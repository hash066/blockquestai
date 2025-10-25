-- Add content_fingerprint column
ALTER TABLE commits ADD COLUMN content_fingerprint VARCHAR(64);
CREATE INDEX idx_content_fingerprint ON commits(content_fingerprint);
