const { Pool } = require('pg');
const crypto = require('crypto');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

/**
 * Generate content fingerprint (similarity hash)
 */
function generateContentFingerprint(content) {
  // Normalize content (remove whitespace, lowercase)
  const normalized = content.toLowerCase().replace(/\s+/g, ' ').trim();
  
  // SHA-256 hash of normalized content
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Check for exact duplicates
 */
async function checkExactDuplicate(contentFingerprint, did) {
  const result = await pool.query(
    `SELECT commit_id, did, created_at 
     FROM commits 
     WHERE content_fingerprint = $1 
     ORDER BY created_at ASC 
     LIMIT 1`,
    [contentFingerprint]
  );
  
  if (result.rows.length > 0) {
    const original = result.rows[0];
    
    return {
      isDuplicate: true,
      originalCommitId: original.commit_id,
      originalDid: original.did,
      originalTimestamp: original.created_at,
      isSameUser: original.did === did
    };
  }
  
  return { isDuplicate: false };
}

/**
 * Fuzzy similarity check (Levenshtein distance)
 */
function calculateSimilarity(str1, str2) {
  const matrix = [];
  const len1 = str1.length;
  const len2 = str2.length;
  
  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  
  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  const similarity = 1 - (distance / maxLen);
  
  return similarity;
}

/**
 * Check for near-duplicates (fuzzy matching)
 */
async function checkNearDuplicates(content, threshold = 0.95) {
  // Get recent commits (last 1000)
  const result = await pool.query(
    `SELECT commit_id, content, did, created_at 
     FROM commits 
     WHERE created_at > NOW() - INTERVAL '7 days'
     ORDER BY created_at DESC 
     LIMIT 1000`
  );
  
  const nearDuplicates = [];
  
  for (const row of result.rows) {
    const similarity = calculateSimilarity(content, row.content);
    
    if (similarity >= threshold) {
      nearDuplicates.push({
        commit_id: row.commit_id,
        did: row.did,
        similarity: similarity,
        created_at: row.created_at
      });
    }
  }
  
  return nearDuplicates;
}

/**
 * Main duplicate check function
 */
async function checkDuplicates(content, did) {
  const fingerprint = generateContentFingerprint(content);
  
  // Check exact duplicate
  const exactCheck = await checkExactDuplicate(fingerprint, did);
  
  if (exactCheck.isDuplicate) {
    if (exactCheck.isSameUser) {
      // User re-submitting their own content
      return {
        status: 'duplicate_self',
        message: 'You already submitted this prompt',
        original: exactCheck
      };
    } else {
      // Someone else submitted first
      return {
        status: 'duplicate_other',
        message: 'This prompt was already submitted by another user',
        original: exactCheck,
        action: 'reject'
      };
    }
  }
  
  // Check near-duplicates (optional, can be expensive)
  const nearDuplicates = await checkNearDuplicates(content, 0.95);
  
  if (nearDuplicates.length > 0) {
    return {
      status: 'similar',
      message: 'Similar prompts detected',
      similar: nearDuplicates,
      action: 'warn' // Still allow, but warn user
    };
  }
  
  return {
    status: 'unique',
    fingerprint: fingerprint
  };
}

module.exports = {
  checkDuplicates,
  generateContentFingerprint
};
