const express = require('express');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const client = require('prom-client');
require('dotenv').config();

const app = express();
app.use(express.json());

// Prometheus metrics setup
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const anchorsPostedTotal = new client.Counter({
  name: 'anchors_posted_total',
  help: 'Total number of anchors posted',
  registers: [register]
});

const queueLength = new client.Gauge({
  name: 'queue_length',
  help: 'Current queue length of pending anchors',
  registers: [register]
});

const gasUsedPerAnchor = new client.Histogram({
  name: 'gas_used_per_anchor',
  help: 'Gas used per anchor transaction',
  registers: [register]
});

const SEQUENCER_ID = process.env.SEQUENCER_ID || '1';
const PORT = process.env.PORT || '8001';
const HARDHAT_RPC = process.env.HARDHAT_RPC || 'http://hardhat:8545';
const PRIVATE_KEY = process.env.SEQUENCER_PRIVATE_KEY || '0x...';

console.log(`🚀 Sequencer ${SEQUENCER_ID} starting on port ${PORT}...`);
console.log(`📡 Hardhat RPC: ${HARDHAT_RPC}`);
console.log(`🔑 Private Key: ${PRIVATE_KEY.substring(0, 10)}...`);

// Load deployed addresses
let deployedAddresses;
try {
  const addressesPath = path.join(__dirname, '../smart-contracts/deployed-addresses.json');
  deployedAddresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  console.log('✅ Deployed addresses loaded');
} catch (err) {
  console.error('❌ Failed to load deployed addresses:', err);
  process.exit(1);
}

// Initialize provider and wallet
let provider, wallet, anchorContract;
async function initializeProvider() {
  try {
    provider = new ethers.providers.JsonRpcProvider(HARDHAT_RPC);
    console.log('✅ Provider initialized');
    wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    console.log(`✅ Wallet initialized: ${wallet.address}`);

    // Initialize AnchorContract
    const anchorContractAddress = deployedAddresses.contracts.AnchorContract;
    const anchorContractABI = [
      "function anchorRoot(bytes32 root, bytes32 prevRoot, uint256 nonce, string memory bundleCID) external",
      "function getAnchor(bytes32 root) external view returns (tuple(bytes32 root, bytes32 prevRoot, uint256 nonce, string bundleCID, uint256 timestamp, address sequencer, bool revoked))",
      "function currentNonce() external view returns (uint256)"
    ];
    anchorContract = new ethers.Contract(anchorContractAddress, anchorContractABI, wallet);
    console.log(`✅ AnchorContract initialized at ${anchorContractAddress}`);
  } catch (err) {
    console.error('❌ Failed to initialize provider or wallet:', err);
    process.exit(1);
  }
}

// API endpoint for anchor requests
app.post('/api/anchor-request', async (req, res) => {
  try {
    const { batch_id, merkle_root, bundle_cid, node_id, timestamp, commit_count } = req.body;

    console.log(`📥 Received anchor request from node ${node_id}:`);
    console.log(`   Batch ID: ${batch_id}`);
    console.log(`   Merkle Root: ${merkle_root}`);
    console.log(`   Bundle CID: ${bundle_cid}`);
    console.log(`   Commits: ${commit_count}`);

    // Get current nonce from contract
    const currentNonce = await anchorContract.currentNonce();
    console.log(`   Current Nonce: ${currentNonce}`);

    // Anchor to blockchain using AnchorContract
    const tx = await anchorContract.anchorRoot(
      merkle_root,
      ethers.constants.HashZero, // prevRoot as 0x0 for simplicity
      currentNonce,
      bundle_cid
    );

    const receipt = await tx.wait();
    const gasUsed = receipt.gasUsed.toNumber();

    console.log(`⛓️  Anchored to blockchain: ${tx.hash}, gas used: ${gasUsed}`);

    // Update metrics
    anchorsPostedTotal.inc();
    gasUsedPerAnchor.observe(gasUsed);

    res.json({
      success: true,
      tx_hash: tx.hash,
      sequencer_id: SEQUENCER_ID,
    });
  } catch (err) {
    console.error('❌ Anchor request failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    sequencer_id: SEQUENCER_ID,
    timestamp: new Date().toISOString(),
  });
});

async function start() {
  await initializeProvider();
  app.listen(PORT, () => {
    console.log(`✅ Sequencer ${SEQUENCER_ID} listening on port ${PORT}`);
  });
}

start().catch(console.error);
