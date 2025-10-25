const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// POST /challenges - Create a new challenge
router.post('/challenges', async (req, res) => {
  const { commitId, stakeAmount, reason } = req.body;

  try {
    const challengeId = `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await pool.query(
      `INSERT INTO challenges (challenge_id, commit_id, challenger_did, challenge_type, stake_amount, evidence, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())`,
      [challengeId, commitId, req.body.address || 'unknown', 'plagiarism', stakeAmount, JSON.stringify({ reason })]
    );

    res.json({
      success: true,
      id: challengeId,
      commitId,
      stakeAmount,
      reason,
      status: 'pending'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// GET /challenges - Get user challenges
router.get('/challenges', async (req, res) => {
  const { user } = req.query;

  try {
    const result = await pool.query(
      'SELECT * FROM challenges WHERE challenger_did = $1',
      [user]
    );
    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.challenge_id,
        commitId: row.commit_id,
        stakeAmount: row.stake_amount,
        reason: row.evidence?.reason || '',
        status: row.status,
        createdAt: row.created_at
      }))
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// POST /challenges/:id/respond - Respond to a challenge
router.post('/challenges/:id/respond', async (req, res) => {
  const { id } = req.params;
  const { response } = req.body;

  try {
    await pool.query(
      'UPDATE challenges SET status = $1, resolution = $2, resolved_at = NOW() WHERE challenge_id = $3',
      ['resolved', response, id]
    );

    res.json({
      success: true,
      message: 'Challenge responded to'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

module.exports = router;
