const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { checkRateLimit } = require('../middleware/rate-limiter');
const { checkDuplicates } = require('../utils/duplicate-detector');
const { commitsTotal } = require('../utils/metrics');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

router.post('/commit', async (req, res) => {
  const { did, signature, content } = req.body;

  try {
    // 1. Rate limit check FIRST
    checkRateLimit(did);

    // 2. Duplicate check
    const dupCheck = await checkDuplicates(content, did);

    if (dupCheck.status === 'duplicate_other') {
      return res.status(409).json({
        error: 'Duplicate content',
        message: dupCheck.message,
        original_commit_id: dupCheck.original.originalCommitId,
        original_timestamp: dupCheck.original.originalTimestamp
      });
    }

    if (dupCheck.status === 'duplicate_self') {
      return res.status(409).json({
        error: 'Already submitted',
        message: dupCheck.message,
        existing_commit_id: dupCheck.original.originalCommitId
      });
    }

    if (dupCheck.status === 'similar') {
      // Log warning but allow
      console.warn(`⚠️  Similar content detected for DID ${did}`);
    }

    // 3. Store content_fingerprint in database
    const contentFingerprint = dupCheck.fingerprint;

    // 4. Process commit (existing logic)
    const commitId = `commit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await pool.query(
      `INSERT INTO commits (commit_id, did, signature, content, content_fingerprint, status, created_at)
       VALUES ($1, $2, $3, $4, $5, 'pending_consensus', NOW())`,
      [commitId, did, signature, content, contentFingerprint]
    );

    // Increment commit counter
    commitsTotal.inc();

    res.json({
      success: true,
      commit_id: commitId,
      status: 'pending_consensus',
      duplicate_check: dupCheck.status
    });

  } catch (error) {
    if (error.message.includes('Rate limit')) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: error.message
      });
    }
    // Other errors...
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// GET /commits - Get all commits or filter by user
router.get('/commits', async (req, res) => {
  const { user } = req.query;

  try {
    let query = 'SELECT * FROM commits';
    let params = [];
    if (user) {
      query += ' WHERE did = $1';
      params.push(user);
    }
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// GET /commits/:id - Get a specific commit
router.get('/commits/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM commits WHERE commit_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Commit not found'
      });
    }
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

module.exports = router;
