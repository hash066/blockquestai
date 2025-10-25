const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// POST /stakes - Create a new stake (as a challenge)
router.post('/stakes', async (req, res) => {
  const { commitId, amount, prediction, address } = req.body;

  try {
    // For now, treat stakes as challenges
    const challengeId = `stake_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await pool.query(
      `INSERT INTO challenges (challenge_id, commit_id, challenger_did, challenge_type, stake_amount, status, created_at)
       VALUES ($1, $2, $3, $4, $5, 'pending', NOW())`,
      [challengeId, commitId, address, 'stake', amount]
    );

    res.json({
      success: true,
      id: challengeId,
      commitId,
      amount,
      prediction,
      address,
      status: 'active'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// GET /stakes - Get user stakes
router.get('/stakes', async (req, res) => {
  const { user } = req.query;

  try {
    const result = await pool.query(
      'SELECT * FROM challenges WHERE challenger_did = $1 AND challenge_type = $2',
      [user, 'stake']
    );
    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.challenge_id,
        commitId: row.commit_id,
        amount: row.stake_amount,
        prediction: 'correct', // Assume correct for now
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

module.exports = router;
