-- Supabase Database Schema for BlockQuest Explorer

-- Create commits table
CREATE TABLE commits (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  model_id TEXT NOT NULL,
  prompt_hash TEXT NOT NULL,
  signature TEXT NOT NULL,
  prompt TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create stakes table
CREATE TABLE stakes (
  id TEXT PRIMARY KEY,
  commit_id TEXT NOT NULL REFERENCES commits(id),
  amount TEXT NOT NULL,
  prediction TEXT NOT NULL,
  user_address TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Create challenges table
CREATE TABLE challenges (
  id TEXT PRIMARY KEY,
  commit_id TEXT NOT NULL REFERENCES commits(id),
  stake_amount TEXT NOT NULL,
  reason TEXT NOT NULL,
  user_address TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create anchors table
CREATE TABLE anchors (
  id TEXT PRIMARY KEY,
  commit_id TEXT NOT NULL REFERENCES commits(id),
  block_number BIGINT NOT NULL,
  transaction_hash TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create models table
CREATE TABLE models (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  creator TEXT DEFAULT 'User',
  trust_score DECIMAL(3,1) DEFAULT 5.0,
  total_commits INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE commits ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE anchors ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (since using anon key)
CREATE POLICY "Allow public read access on commits" ON commits FOR SELECT USING (true);
CREATE POLICY "Allow public insert on commits" ON commits FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on stakes" ON stakes FOR SELECT USING (true);
CREATE POLICY "Allow public insert on stakes" ON stakes FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on challenges" ON challenges FOR SELECT USING (true);
CREATE POLICY "Allow public insert on challenges" ON challenges FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on anchors" ON anchors FOR SELECT USING (true);
CREATE POLICY "Allow public insert on anchors" ON anchors FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on models" ON models FOR SELECT USING (true);
CREATE POLICY "Allow public insert on models" ON models FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_commits_user_id ON commits(user_id);
CREATE INDEX idx_commits_prompt_hash ON commits(prompt_hash);
CREATE INDEX idx_stakes_user_address ON stakes(user_address);
CREATE INDEX idx_challenges_user_address ON challenges(user_address);
CREATE INDEX idx_anchors_commit_id ON anchors(commit_id);
