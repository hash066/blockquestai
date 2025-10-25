const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { Pool } = require('pg');
require('dotenv').config();

const { register, httpRequestDuration, activeConnections } = require('./utils/metrics');

const commitRoutes = require('./routes/commit');
const stakesRoutes = require('./routes/stakes');
const challengesRoutes = require('./routes/challenges');
const anchorsRoutes = require('./routes/anchors');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const app = express();
const PORT = process.env.PORT || 7001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Metrics middleware for request timing and active connections
app.use((req, res, next) => {
    activeConnections.inc();
    const end = httpRequestDuration.startTimer({ method: req.method });
    res.on('finish', () => {
        end({ status_code: res.statusCode });
        activeConnections.dec();
    });
    next();
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'registrar-api',
        version: '1.0.0'
    });
});

// API endpoints
app.get('/api/status', (req, res) => {
    res.json({
        message: 'Registrar API is running',
        node: process.env.NODE_ID || 'unknown',
        tendermint_proxy: process.env.TENDERMINT_PROXY || 'localhost:26657'
    });
});

// DID Registration endpoints
app.post('/api/did/register', (req, res) => {
    // TODO: Implement DID registration logic
    res.json({
        success: true,
        message: 'DID registration endpoint - to be implemented',
        data: req.body
    });
});

app.get('/api/did/:did', (req, res) => {
    // TODO: Implement DID lookup logic
    res.json({
        success: true,
        message: 'DID lookup endpoint - to be implemented',
        did: req.params.did
    });
});

// Staking endpoints
app.post('/api/staking/stake', (req, res) => {
    // TODO: Implement staking logic
    res.json({
        success: true,
        message: 'Staking endpoint - to be implemented',
        data: req.body
    });
});

app.post('/api/staking/unstake', (req, res) => {
    // TODO: Implement unstaking logic
    res.json({
        success: true,
        message: 'Unstaking endpoint - to be implemented',
        data: req.body
    });
});

// Routes
app.use('/api', commitRoutes);
app.use('/stakes', stakesRoutes);
app.use('/challenges', challengesRoutes);
app.use('/anchors', anchorsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Database functions
async function initDatabase() {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS commits (
                id SERIAL PRIMARY KEY,
                commit_hash VARCHAR(255) NOT NULL,
                data JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Database initialized');
    } catch (err) {
        console.error('Error initializing database:', err);
    } finally {
        client.release();
    }
}

async function updateDatabaseSchema() {
    const client = await pool.connect();
    try {
        // Add new columns for Day 2
        await client.query(`
            ALTER TABLE commits
            ADD COLUMN IF NOT EXISTS batch_id VARCHAR(255),
            ADD COLUMN IF NOT EXISTS bundle_cid VARCHAR(255),
            ADD COLUMN IF NOT EXISTS anchor_tx_hash VARCHAR(255),
            ADD COLUMN IF NOT EXISTS anchor_block_number INTEGER
        `);
        console.log('✅ Database schema updated for Day 2');
    } catch (err) {
        // Columns may already exist
        console.log('Database schema already up to date');
    } finally {
        client.release();
    }
}

// Start server
app.listen(PORT, async () => {
    console.log(`🚀 Registrar API server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 Tendermint proxy: ${process.env.TENDERMINT_PROXY || 'localhost:26657'}`);
    console.log(`📝 Node ID: ${process.env.NODE_ID || 'unknown'}`);
    await initDatabase();
    await updateDatabaseSchema();
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

module.exports = app;
