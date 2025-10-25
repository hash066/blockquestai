const rateLimit = {};
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_COMMITS_PER_MINUTE = 10;
const COOLDOWN_PENALTY = 300000; // 5 minutes cooldown after violation

function checkRateLimit(did) {
  const now = Date.now();
  
  // Initialize if first request
  if (!rateLimit[did]) {
    rateLimit[did] = {
      count: 0,
      windowStart: now,
      penaltyUntil: 0
    };
  }
  
  const userLimit = rateLimit[did];
  
  // Check if user is in cooldown penalty
  if (userLimit.penaltyUntil > now) {
    const remainingSeconds = Math.ceil((userLimit.penaltyUntil - now) / 1000);
    throw new Error(`Rate limit exceeded. Cooldown for ${remainingSeconds}s`);
  }
  
  // Reset window if expired
  if (now - userLimit.windowStart > RATE_LIMIT_WINDOW) {
    userLimit.count = 0;
    userLimit.windowStart = now;
  }
  
  // Check limit
  if (userLimit.count >= MAX_COMMITS_PER_MINUTE) {
    userLimit.penaltyUntil = now + COOLDOWN_PENALTY;
    throw new Error(`Rate limit exceeded! Max ${MAX_COMMITS_PER_MINUTE} commits/min. Cooldown: 5 minutes.`);
  }
  
  // Increment counter
  userLimit.count++;
  return true;
}

// Reputation-based rate limits (higher reputation = higher limits)
function getReputation(did) {
  // Query from DIDRegistry contract or database
  // For now, return default
  return 500; // 0-1000 scale
}

function getDynamicRateLimit(did) {
  const reputation = getReputation(did);
  
  if (reputation >= 800) return 50; // High reputation
  if (reputation >= 600) return 25; // Medium reputation
  if (reputation >= 400) return 15; // Average reputation
  return 10; // Low reputation (default)
}

module.exports = { checkRateLimit, getDynamicRateLimit };
