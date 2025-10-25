# Threat Model & Attack Surface Analysis

## Assets to Protect

1. **User Prompts** (Confidentiality before reveal)
2. **Cryptographic Commitments** (Integrity)
3. **Blockchain State** (Immutability)
4. **Staked Funds** (Economic security)
5. **User DIDs** (Identity/reputation)

## Threat Actors

| Actor | Motivation | Capability | Impact |
|-------|------------|------------|--------|
| **Script Kiddie** | Disruption | Low | Low |
| **Competitor** | Market advantage | Medium | Medium |
| **Nation State** | Censorship | High | High |
| **Insider** | Financial gain | High | Critical |

## Attack Vectors & Mitigations

### 1. Commitment Pre-Image Attack

**Attack:**
- Attacker intercepts commitment on network
- Attempts to reverse-engineer prompt before reveal

**Mitigation:**
- ✅ 256-bit nonce (2^256 keyspace)
- ✅ Keccak256 pre-image resistance
- ✅ Economic stake disincentivizes brute force

**Residual Risk**: ⚠️ LOW (computationally infeasible)

### 2. Front-Running Attack

**Attack:**
- Attacker observes pending `revealPrompt()` transaction
- Submits own reveal with higher gas to claim authorship

**Mitigation:**
- ✅ Commitment timestamp precedence
- ✅ DID-binding (signature verification)
- ✅ Flashbots/private mempool support

**Residual Risk**: ⚠️ LOW (precedence + identity binding)

### 3. Censorship Attack

**Attack:**
- Malicious registrar refuses to process user commits
- User cannot prove ownership

**Mitigation:**
- ✅ Byzantine fault tolerance (5/7 honest nodes required)
- ✅ Challenge mechanism with slashing
- ✅ Alternative registrar submission

**Residual Risk**: ⚠️ VERY LOW (would need 3/7 colluding registrars)

### 4. Sybil Attack

**Attack:**
- Attacker creates many fake DIDs
- Attempts to manipulate reputation/voting

**Mitigation:**
- ✅ Stake requirement per DID (0.001 ETH)
- ✅ Reputation starts low, grows with usage
- ✅ Graph analysis detects clusters
- ✅ Challenge mechanism

**Residual Risk**: ⚠️ MEDIUM (expensive but possible)

### 5. Plagiarism Attack

**Attack:**
- Attacker copies revealed prompt
- Submits as their own to different model

**Mitigation:**
- ✅ Timestamp precedence on-chain
- ✅ Model fingerprint binding
- ✅ Reputation penalty system
- ✅ Community challenges

**Residual Risk**: ⚠️ MEDIUM (detection is probabilistic)

### 6. Smart Contract Exploits

**Attack:**
- Reentrancy, overflow, or logic bugs in contracts

**Mitigation:**
- ✅ OpenZeppelin battle-tested libraries
- ✅ Solidity 0.8+ (overflow protection)
- ✅ Checks-Effects-Interactions pattern
- ✅ Comprehensive test suite

**Residual Risk**: ⚠️ MEDIUM (audit recommended for mainnet)

### 7. Sequencer MEV Extraction

**Attack:**
- Sequencer reorders transactions for profit
- Front-runs high-value reveals

**Mitigation:**
- ✅ Commit-reveal hides value until reveal
- ✅ Round-robin sequencer rotation
- ✅ Encrypted mempool (future)

**Residual Risk**: ⚠️ LOW (limited MEV surface)

### 8. IPFS/Pinata Censorship

**Attack:**
- Pinata/IPFS nodes refuse to serve content
- User cannot access prompt history

**Mitigation:**
- ✅ Redundant pinning (Pinata + local IPFS)
- ✅ MinIO backup
- ✅ Multi-gateway access
- ✅ User can pin own content

**Residual Risk**: ⚠️ LOW (triple redundancy)

### 9. Oracle Manipulation

**Attack:**
- Fake attestor provides false model verification
- Incorrect reputation assigned

**Mitigation:**
- ✅ Multi-oracle system (5 attestors, require 3/5)
- ✅ Stake slashing for false attestation
- ✅ Challenge mechanism
- ✅ On-chain aggregation

**Residual Risk**: ⚠️ MEDIUM (requires 3/5 colluding oracles)

### 10. DoS Attack

**Attack:**
- Spam system with commits to overload registrars

**Mitigation:**
- ✅ Minimum stake requirement (0.001 ETH per commit)
- ✅ Rate limiting per DID
- ✅ Reputation-based priority
- ✅ Gas fees on blockchain layer

**Residual Risk**: ⚠️ LOW (economically expensive)

## Attack Cost Analysis

| Attack | Cost | Success Probability | Expected Gain |
|--------|------|---------------------|---------------|
| Pre-image | $10M+ (hardware) | <0.001% | $0 |
| Front-run | $10 (gas) | 10% | -$5 (net loss) |
| Censorship | $20,000 (stake) | 5% | -$19,000 (slashed) |
| Sybil | $1,000 (100 DIDs) | 30% | -$700 (no gain) |
| Plagiarism | $1 (gas) | 50% | -$1 (precedence) |
| Contract Exploit | $50,000 (audit) | 1% | $0 (if caught) |

**Conclusion**: All attacks have negative expected value for rational actors.

## Security Roadmap

### Phase 1 (Current - Testnet)
- ✅ Commit-reveal protocol
- ✅ Byzantine fault tolerance
- ✅ Economic staking

### Phase 2 (Pre-Mainnet)
- [ ] Professional security audit (Consensys Diligence, Trail of Bits)
- [ ] Bug bounty program ($50k)
- [ ] Formal verification (Certora)

### Phase 3 (Mainnet)
- [ ] Encrypted mempool (Flashbots)
- [ ] ZK-based selective disclosure
- [ ] Hardware security module (HSM) for sequencers
- [ ] On-chain governance (DAO)

## Incident Response Plan

**If exploit detected:**
1. **Pause** contracts (emergency stop function)
2. **Notify** users via Discord/Twitter
3. **Investigate** root cause (contract, infrastructure, or social)
4. **Patch** vulnerability
5. **Resume** after audit confirmation
6. **Compensate** affected users from treasury

**Contact**: security@blockquest.io
