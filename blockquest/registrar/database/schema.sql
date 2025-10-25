-- ====================================
-- BlockQuest Database Schema
-- ====================================

-- Drop existing tables (if any)
DROP TABLE IF EXISTS commits CASCADE;
DROP TABLE IF EXISTS dids CASCADE;
DROP TABLE IF EXISTS batches CASCADE;
DROP TABLE IF EXISTS anchors CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;

-- ====================================
-- 1. DIDs Table (Decentralized Identities)
-- ====================================
CREATE TABLE dids (
    did VARCHAR(255) PRIMARY KEY,
    wallet_address VARCHAR(42) NOT NULL,
    reputation_score INTEGER DEFAULT 500 CHECK (reputation_score >= 0 AND reputation_score <= 1000),
    stake_amount DECIMAL(20, 8) DEFAULT 0,
    total_commits INTEGER DEFAULT 0,
    successful_commits INTEGER DEFAULT 0,
    challenged_commits INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    last_active TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned'))
);

CREATE INDEX idx_did_wallet ON dids(wallet_address);
CREATE INDEX idx_did_reputation ON dids(reputation_score DESC);

-- ====================================
-- 2. Commits Table (User Submissions)
-- ====================================
CREATE TABLE commits (
    commit_id VARCHAR(255) PRIMARY KEY,
    did VARCHAR(255) NOT NULL REFERENCES dids(did),
    signature TEXT NOT NULL,
    content TEXT,
    content_fingerprint VARCHAR(64),
    payload_cid VARCHAR(255),
    model_fingerprint VARCHAR(66),
    commitment_hash VARCHAR(66),
    status VARCHAR(30) DEFAULT 'pending_consensus' CHECK (
        status IN (
            'pending_consensus',
            'batched',
            'anchored',
            'challenged',
            'revoked',
            'deletion_requested'
        )
    ),
    batch_id VARCHAR(255),
    bundle_cid VARCHAR(255),
    anchor_tx_hash VARCHAR(66),
    anchor_block_number BIGINT,
    merkle_root VARCHAR(66),
    merkle_proof JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    batched_at TIMESTAMP,
    anchored_at TIMESTAMP
);

CREATE INDEX idx_commit_did ON commits(did);
CREATE INDEX idx_commit_status ON commits(status);
CREATE INDEX idx_commit_created ON commits(created_at DESC);
CREATE INDEX idx_commit_batch ON commits(batch_id);
CREATE INDEX idx_commit_fingerprint ON commits(content_fingerprint);
CREATE INDEX idx_commit_anchor_tx ON commits(anchor_tx_hash);

-- ====================================
-- 3. Batches Table (Merkle Tree Batches)
-- ====================================
CREATE TABLE batches (
    batch_id VARCHAR(255) PRIMARY KEY,
    node_id INTEGER NOT NULL,
    merkle_root VARCHAR(66) NOT NULL,
    bundle_cid VARCHAR(255),
    commit_count INTEGER NOT NULL,
    total_size BIGINT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN ('pending', 'anchored', 'failed')
    ),
    created_at TIMESTAMP DEFAULT NOW(),
    anchored_at TIMESTAMP
);

CREATE INDEX idx_batch_status ON batches(status);
CREATE INDEX idx_batch_created ON batches(created_at DESC);
CREATE INDEX idx_batch_node ON batches(node_id);

-- ====================================
-- 4. Anchors Table (Blockchain Anchors)
-- ====================================
CREATE TABLE anchors (
    anchor_id SERIAL PRIMARY KEY,
    batch_id VARCHAR(255) NOT NULL REFERENCES batches(batch_id),
    sequencer_id INTEGER NOT NULL,
    merkle_root VARCHAR(66) NOT NULL,
    prev_root VARCHAR(66),
    tx_hash VARCHAR(66) NOT NULL UNIQUE,
    block_number BIGINT NOT NULL,
    block_timestamp TIMESTAMP,
    gas_used BIGINT,
    gas_price BIGINT,
    network VARCHAR(50) DEFAULT 'localhost',
    contract_address VARCHAR(42),
    status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN ('pending', 'confirmed', 'failed')
    ),
    created_at TIMESTAMP DEFAULT NOW(),
    confirmed_at TIMESTAMP
);

CREATE INDEX idx_anchor_batch ON anchors(batch_id);
CREATE INDEX idx_anchor_tx ON anchors(tx_hash);
CREATE INDEX idx_anchor_block ON anchors(block_number);
CREATE INDEX idx_anchor_status ON anchors(status);

-- ====================================
-- 5. Challenges Table (Dispute Resolution)
-- ====================================
CREATE TABLE challenges (
    challenge_id SERIAL PRIMARY KEY,
    commit_id VARCHAR(255) NOT NULL REFERENCES commits(commit_id),
    challenger_did VARCHAR(255) NOT NULL REFERENCES dids(did),
    challenge_type VARCHAR(50) NOT NULL CHECK (
        challenge_type IN (
            'plagiarism',
            'censorship',
            'invalid_anchor',
            'false_attestation'
        )
    ),
    evidence JSONB,
    stake_amount DECIMAL(20, 8),
    status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN ('pending', 'accepted', 'rejected', 'expired')
    ),
    resolution TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

CREATE INDEX idx_challenge_commit ON challenges(commit_id);
CREATE INDEX idx_challenge_challenger ON challenges(challenger_did);
CREATE INDEX idx_challenge_status ON challenges(status);

-- ====================================
-- 6. Rate Limits Table (Spam Prevention)
-- ====================================
CREATE TABLE rate_limits (
    did VARCHAR(255) PRIMARY KEY REFERENCES dids(did),
    request_count INTEGER DEFAULT 0,
    window_start TIMESTAMP DEFAULT NOW(),
    penalty_until TIMESTAMP,
    total_violations INTEGER DEFAULT 0,
    last_violation TIMESTAMP
);

CREATE INDEX idx_rate_limit_penalty ON rate_limits(penalty_until);

-- ====================================
-- 7. System Events Table (Audit Log)
-- ====================================
CREATE TABLE system_events (
    event_id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    actor VARCHAR(255),
    target_id VARCHAR(255),
    metadata JSONB,
    severity VARCHAR(20) DEFAULT 'info' CHECK (
        severity IN ('debug', 'info', 'warning', 'error', 'critical')
    ),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_event_type ON system_events(event_type);
CREATE INDEX idx_event_created ON system_events(created_at DESC);
CREATE INDEX idx_event_severity ON system_events(severity);

-- ====================================
-- Views for Common Queries
-- ====================================

-- Active commits awaiting batching
CREATE VIEW pending_commits AS
SELECT 
    c.commit_id,
    c.did,
    c.created_at,
    c.content_fingerprint,
    d.reputation_score
FROM commits c
JOIN dids d ON c.did = d.did
WHERE c.status = 'pending_consensus'
ORDER BY d.reputation_score DESC, c.created_at ASC;

-- Batch statistics
CREATE VIEW batch_stats AS
SELECT 
    DATE_TRUNC('hour', created_at) as hour,
    COUNT(*) as batch_count,
    SUM(commit_count) as total_commits,
    AVG(commit_count) as avg_commits_per_batch
FROM batches
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hour DESC;

-- DID leaderboard
CREATE VIEW did_leaderboard AS
SELECT 
    did,
    reputation_score,
    total_commits,
    successful_commits,
    CASE 
        WHEN total_commits > 0 
        THEN ROUND((successful_commits::DECIMAL / total_commits * 100), 2)
        ELSE 0 
    END as success_rate
FROM dids
WHERE status = 'active'
ORDER BY reputation_score DESC
LIMIT 100;

-- ====================================
-- Functions
-- ====================================

-- Update DID statistics after commit
CREATE OR REPLACE FUNCTION update_did_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE dids 
        SET total_commits = total_commits + 1,
            last_active = NOW()
        WHERE did = NEW.did;
    ELSIF TG_OP = 'UPDATE' AND NEW.status = 'anchored' AND OLD.status != 'anchored' THEN
        UPDATE dids 
        SET successful_commits = successful_commits + 1,
            reputation_score = LEAST(reputation_score + 10, 1000)
        WHERE did = NEW.did;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update DID stats
CREATE TRIGGER trigger_update_did_stats
AFTER INSERT OR UPDATE ON commits
FOR EACH ROW
EXECUTE FUNCTION update_did_stats();

-- ====================================
-- Initial Data (Optional)
-- ====================================

-- Create test DID
INSERT INTO dids (did, wallet_address, reputation_score)
VALUES ('did:ethr:0xTestUser123', '0xTestAddress123', 500)
ON CONFLICT (did) DO NOTHING;

-- ====================================
-- Indexes for Performance
-- ====================================

-- Composite indexes for common queries
CREATE INDEX idx_commit_did_status ON commits(did, status);
CREATE INDEX idx_commit_status_created ON commits(status, created_at DESC);
CREATE INDEX idx_batch_status_created ON batches(status, created_at DESC);

-- ====================================
-- Maintenance
-- ====================================

-- Auto-vacuum settings (optimize for write-heavy workload)
ALTER TABLE commits SET (
    autovacuum_vacuum_scale_factor = 0.1,
    autovacuum_analyze_scale_factor = 0.05
);

ALTER TABLE batches SET (
    autovacuum_vacuum_scale_factor = 0.1
);

-- ====================================
-- Database Info
-- ====================================

COMMENT ON TABLE commits IS 'User-submitted AI prompt commitments';
COMMENT ON TABLE dids IS 'Decentralized identity registry';
COMMENT ON TABLE batches IS 'Merkle tree batches for blockchain anchoring';
COMMENT ON TABLE anchors IS 'Blockchain anchor records';
COMMENT ON TABLE challenges IS 'Dispute and challenge system';
COMMENT ON TABLE rate_limits IS 'Rate limiting and spam prevention';
COMMENT ON TABLE system_events IS 'System audit log';

-- Done!
SELECT 'Database schema created successfully!' as status;
