const { MerkleTree } = require('merkletreejs');
const SHA256 = require('crypto-js/sha256');
const axios = require('axios');
const Minio = require('minio');
const { create } = require('ipfs-http-client');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const express = require('express');
const client = require('prom-client');
require('dotenv').config();

// Configuration
const NODE_ID = process.env.NODE_ID || '1';
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '10');
const BATCH_INTERVAL = parseInt(process.env.BATCH_INTERVAL || '30000'); // 30 seconds
const PORT = process.env.PORT || '9001';

// Prometheus setup
const app = express();
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const batchesCreatedTotal = new client.Counter({
  name: 'batches_created_total',
  help: 'Total number of batches created',
  registers: [register]
});

const commitsPerBatch = new client.Histogram({
  name: 'commits_per_batch',
  help: 'Number of commits per batch',
  registers: [register]
});

const ipfsPinsTotal = new client.Counter({
  name: 'ipfs_pins_total',
  help: 'Total number of IPFS pins attempted',
  registers: [register]
});

const ipfsPinsSuccessTotal = new client.Counter({
  name: 'ipfs_pins_success_total',
  help: 'Total number of successful IPFS pins',
  registers: [register]
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// PostgreSQL connection
const pool = new Pool(
  process.env.DATABASE_URL || {
    host: process.env.POSTGRES_HOST || `postgres-registrar-${NODE_ID}`,
    port: 5432,
    database: 'registrar',
    user: 'registrar',
    password: 'registrar123',
  }
);

// MinIO client
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ROOT_USER || 'minioadmin',
  secretKey: process.env.MINIO_ROOT_PASSWORD || 'minioadmin123',
});

// IPFS client
const ipfs = create(`http://${process.env.IPFS_HOST || 'localhost'}:${process.env.IPFS_PORT || '5001'}`);

// Ensure MinIO bucket exists
async function ensureBucket() {
  const bucketName = 'proof-of-prompt-bundles';
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`✅ Created MinIO bucket: ${bucketName}`);
    }
  } catch (err) {
    console.error('MinIO bucket error:', err);
  }
}

// Fetch pending commits from database
async function fetchPendingCommits(limit = BATCH_SIZE) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT id, commit_id, did, signature, payload_cid, content, created_at 
       FROM commits 
       WHERE status = 'pending_consensus' 
       ORDER BY created_at ASC 
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

// Generate Merkle tree and bundle
async function generateMerkleBundle(commits) {
  if (commits.length === 0) {
    console.log('⏸️  No pending commits to batch');
    return null;
  }

  console.log(`📦 Batching ${commits.length} commits...`);

  // Create leaf hashes (hash of commit data)
  const leaves = commits.map(commit => {
    const data = `${commit.commit_id}:${commit.did}:${commit.signature}`;
    return SHA256(data).toString();
  });

  // Build Merkle tree
  const tree = new MerkleTree(leaves, SHA256, { sortPairs: true });
  const root = tree.getHexRoot();

  console.log(`🌳 Merkle root: ${root}`);

  // Generate bundle metadata
  const bundle = {
    batch_id: `batch_${Date.now()}_node${NODE_ID}`,
    node_id: NODE_ID,
    merkle_root: root,
    timestamp: new Date().toISOString(),
    commit_count: commits.length,
    leaves: commits.map((commit, index) => ({
      commit_id: commit.commit_id,
      leaf_hash: leaves[index],
      did: commit.did,
      payload_cid: commit.payload_cid,
      merkle_proof: tree.getHexProof(leaves[index]),
    })),
  };

  return bundle;
}

// Upload bundle to MinIO
async function uploadToMinio(bundle) {
  const bucketName = 'proof-of-prompt-bundles';
  const objectName = `${bundle.batch_id}.json`;
  const bundleJson = JSON.stringify(bundle, null, 2);

  try {
    await minioClient.putObject(
      bucketName,
      objectName,
      Buffer.from(bundleJson),
      bundleJson.length,
      { 'Content-Type': 'application/json' }
    );
    
    const url = `http://${process.env.MINIO_ENDPOINT || 'localhost'}:9000/${bucketName}/${objectName}`;
    console.log(`☁️  Uploaded to MinIO: ${url}`);
    return url;
  } catch (err) {
    console.error('MinIO upload failed:', err);
    throw err;
  }
}

// Pin bundle to IPFS
async function pinToIPFS(bundle) {
  ipfsPinsTotal.inc();
  try {
    const bundleJson = JSON.stringify(bundle);
    const result = await ipfs.add(bundleJson, { pin: true });
    console.log(`📌 Pinned to IPFS: ${result.cid.toString()}`);
    ipfsPinsSuccessTotal.inc();
    return result.cid.toString();
  } catch (err) {
    console.error('IPFS pinning failed:', err);
    throw err;
  }
}

// Update commit statuses in database
async function markCommitsAsBatched(commits, batchId, bundleCid) {
  const client = await pool.connect();
  try {
    const commitIds = commits.map(c => c.commit_id);
    await client.query(
      `UPDATE commits 
       SET status = 'batched', 
           batch_id = $1, 
           bundle_cid = $2 
       WHERE commit_id = ANY($3)`,
      [batchId, bundleCid, commitIds]
    );
    console.log(`✅ Marked ${commits.length} commits as batched`);
  } finally {
    client.release();
  }
}

// Save bundle metadata to local disk
async function saveBundleLocal(bundle) {
  const bundlesDir = path.join(__dirname, '..', '..', 'data', 'bundles');
  if (!fs.existsSync(bundlesDir)) {
    fs.mkdirSync(bundlesDir, { recursive: true });
  }
  
  const filePath = path.join(bundlesDir, `${bundle.batch_id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(bundle, null, 2));
  console.log(`💾 Saved bundle locally: ${filePath}`);
}

// Emit event to sequencers (via HTTP or message queue)
async function notifySequencers(bundle, bundleCid) {
  const sequencerEndpoints = [
    'http://localhost:8001/api/anchor-request',
    'http://localhost:8002/api/anchor-request',
    'http://localhost:8003/api/anchor-request',
  ];

  const payload = {
    batch_id: bundle.batch_id,
    merkle_root: bundle.merkle_root,
    bundle_cid: bundleCid,
    node_id: NODE_ID,
    timestamp: bundle.timestamp,
    commit_count: bundle.commit_count,
  };

  for (const endpoint of sequencerEndpoints) {
    try {
      await axios.post(endpoint, payload, { timeout: 5000 });
      console.log(`📡 Notified sequencer: ${endpoint}`);
    } catch (err) {
      console.warn(`⚠️  Sequencer ${endpoint} unreachable`);
    }
  }
}

// Main batch processing function
async function processBatch() {
  console.log(`\n⏰ [${new Date().toISOString()}] Starting batch process...`);

  try {
    // 1. Fetch pending commits
    const commits = await fetchPendingCommits(BATCH_SIZE);
    
    if (commits.length === 0) {
      console.log('⏸️  No commits to process');
      return;
    }

    // 2. Generate Merkle bundle
    const bundle = await generateMerkleBundle(commits);

    if (!bundle) return;

    // Update metrics
    batchesCreatedTotal.inc();
    commitsPerBatch.observe(bundle.commit_count);

    // 3. Upload to MinIO
    await uploadToMinio(bundle);

    // 4. Pin to IPFS
    const bundleCid = await pinToIPFS(bundle);

    // 5. Save locally
    await saveBundleLocal(bundle);

    // 6. Update database
    await markCommitsAsBatched(commits, bundle.batch_id, bundleCid);

    // 7. Notify sequencers
    await notifySequencers(bundle, bundleCid);

    console.log(`✅ Batch ${bundle.batch_id} complete!\n`);
  } catch (err) {
    console.error('❌ Batch processing failed:', err);
  }
}

// Test mode
async function runTest() {
  console.log('🧪 Running test mode...\n');

  // Create test commits
  const testCommits = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    commit_id: `test_commit_${i + 1}`,
    did: `did:ethr:0xtest${i + 1}`,
    signature: `0xsig${i + 1}`,
    payload_cid: `Qmtest${i + 1}`,
    content: `Test content ${i + 1}`,
    created_at: new Date(),
  }));

  const bundle = await generateMerkleBundle(testCommits);
  console.log('\n📋 Test bundle generated:');
  console.log(JSON.stringify(bundle, null, 2));

  // Verify proof for first commit
  const leaves = testCommits.map(c => SHA256(`${c.commit_id}:${c.did}:${c.signature}`).toString());
  const tree = new MerkleTree(leaves, SHA256, { sortPairs: true });
  const proof = tree.getHexProof(leaves[0]);
  const isValid = tree.verify(proof, leaves[0], bundle.merkle_root);

  console.log(`\n🔍 Proof verification: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
}

// Startup
async function start() {
  if (process.argv.includes('--test')) {
    await runTest();
    process.exit(0);
  }

  console.log(`🚀 Merkle Batcher starting (Node ${NODE_ID})...`);
  await ensureBucket();

  // Start metrics server
  app.listen(PORT, () => {
    console.log(`📊 Metrics server listening on port ${PORT}`);
  });

  // Run batch process on interval
  setInterval(processBatch, BATCH_INTERVAL);

  // Initial run
  processBatch();
}

start().catch(console.error);
