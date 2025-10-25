# MEV Protection Strategy

## Problem
Sequencers posting anchor transactions can be front-run by MEV bots who:
- Copy the merkle root
- Submit with higher gas
- Claim credit for anchoring

## Solution: Flashbots Protect

We use Flashbots to submit anchor transactions privately:
1. Transaction sent to Flashbots relay (not public mempool)
2. Only block builder sees it
3. No front-running possible

## Implementation
See `registrar/utils/flashbots-relay.js`

## Cost
- Same gas as normal transaction
- No extra fees
- Sepolia testnet supported
