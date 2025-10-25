const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// GET /anchors - Get anchors, optionally filtered by commitId
router.get('/anchors', async (req, res) => {
  const { commitId } = req.query;

  try {
    let query = 'SELECT * FROM anchors';
    let params = [];
    if (commitId) {
      // Assuming anchors are linked via batch_id or something; for now, return all
      query += ' WHERE batch_id IN (SELECT batch_id FROM commits WHERE commit_id = $1)';
      params.push(commitId);
    }
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.anchor_id,
        commitId: row.batch_id, // Assuming batch_id links to commits
        blockNumber: row.block_number,
        transactionHash: row.tx_hash,
        timestamp: row.created_at
      }))
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// POST /anchors - Create a new anchor
router.post('/anchors', async (req, res) => {
  const { commitId, blockNumber, transactionHash } = req.body;

  try {
    // For simplicity, create a batch if needed
    const batchId = `batch_${Date.now()}`;
    await pool.query(
      'INSERT INTO batches (batch_id, node_id, merkle_root, commit_count, status) VALUES ($1, 1, $2, 1, $3)',
      [batchId, 'dummy_root', 'pending']
    );

    const anchorId = `anchor_${Date.now()}`;
    await pool.query(
      'INSERT INTO anchors (anchor_id, batch_id, sequencer_id, merkle_root, tx_hash, block_number, status) VALUES ($1, $2, 1, $3, $4, $5, $6)',
      [anchorId, batchId, 'dummy_root', transactionHash, blockNumber, 'confirmed']
    );

    res.json({
      success: true,
      id: anchorId,
      commitId,
      blockNumber,
      transactionHash
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

module.exports = router;
