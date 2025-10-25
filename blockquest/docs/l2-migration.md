# Layer 2 Migration Guide

## Why Layer 2?

**Current Costs (Ethereum Mainnet):**
- Anchor transaction: $50-200
- Annual cost (1M commits): $500,000+

**Layer 2 Costs:**
- Anchor transaction: $0.10-0.50
- Annual cost (1M commits): $1,000-5,000
- **Savings**: 99%+

## Recommended Layer 2s

### 1. Polygon zkEVM (Top Choice)

**Pros:**
- Native Ethereum compatibility
- ZK-proof security
- $0.10 per anchor transaction
- Mainnet-level finality in minutes
- Strong ecosystem

**Deployment:**
// hardhat.config.js
networks: {
polygonZkEvm: {
url: "https://zkevm-rpc.com",
accounts: [process.env.PRIVATE_KEY],
chainId: 1101
}
}

**Deployment Command:**
npx hardhat run scripts/deploy-all.js --network polygonZkEvm

### 2. Base (Coinbase L2)

**Pros:**
- Low fees ($0.08 per tx)
- Fast finality (2 seconds)
- Easy fiat on-ramps
- Growing ecosystem

**Deployment:**
networks: {
base: {
url: "https://mainnet.base.org",
accounts: [process.env.PRIVATE_KEY],
chainId: 8453
}
}

### 3. Arbitrum One

**Pros:**
- Most mature L2
- Largest TVL
- $0.15 per anchor
- Proven security

**Deployment:**
networks: {
arbitrum: {
url: "https://arb1.arbitrum.io/rpc",
accounts: [process.env.PRIVATE_KEY],
chainId: 42161
}
}

## Migration Checklist

### Phase 1: Pre-Migration (Week 1)
- [ ] Audit contracts for L2 compatibility
- [ ] Test on L2 testnet (Polygon Mumbai, Base Goerli)
- [ ] Benchmark gas costs
- [ ] Update frontend RPC URLs
- [ ] Notify users of migration

### Phase 2: Dual-Chain Period (Week 2-4)
- [ ] Deploy contracts to L2
- [ ] Run both L1 and L2 simultaneously
- [ ] Migrate critical data (DIDs, reputation)
- [ ] Test cross-chain bridge (if needed)

### Phase 3: L2-Primary (Week 5+)
- [ ] Set L2 as default in UI
- [ ] Keep L1 for disputes only
- [ ] Monitor L2 performance
- [ ] Gradually sunset L1

## Contract Modifications for L2

**No changes required!** Our contracts are L2-compatible because:
1. ✅ No block.difficulty dependencies
2. ✅ No assembly/low-level calls
3. ✅ Standard EVM opcodes only
4. ✅ No L1-specific precompiles

## Cross-Chain Considerations

### Bridging DID Reputation

// L1 → L2 Bridge Contract
interface IReputationBridge {
function bridgeReputation(
address user,
uint256 l1Reputation,
bytes memory proof
) external;
}

### Merkle Root Verification

**Option 1: Dual-Chain Anchoring**
- Post same merkle root to both L1 and L2
- Cost: L1_cost + L2_cost
- Security: Maximum

**Option 2: L2-Only with L1 Fallback**
- Default to L2
- L1 only for disputed proofs
- Cost: 95% savings
- Security: High (L2 security + L1 fallback)

## Cost Comparison (Annual, 1M commits)

| Solution | Cost | Finality | Security |
|----------|------|----------|----------|
| Ethereum L1 | $500,000 | 15 min | Highest |
| Sepolia Testnet | FREE | FREE | FREE |
| Polygon zkEVM | $1,000 | 5 min | Very High |
| Base | $800 | 2 sec | High |
| Arbitrum | $1,500 | 15 min | Very High |

**Recommendation**: Start with Polygon zkEVM, evaluate Base if speed critical.
