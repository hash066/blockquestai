# Economic Security Model

## Game-Theoretic Analysis

### Threat Model

**Actors:**
1. **Honest Registrar** (h): Follows protocol, validates correctly
2. **Malicious Registrar** (m): May censor or lie
3. **Honest User** (u): Submits legitimate prompts
4. **Attacker** (a): Attempts to manipulate system

### Staking Requirements

| Role | Min Stake | Slash Condition | Slash Amount |
|------|-----------|-----------------|--------------|
| Registrar | 10,000 POP | Censorship proven | 100% + penalty |
| Sequencer | 5,000 POP | Invalid anchor | 50% + penalty |
| Model Operator | 2,500 POP | Fraudulent output | 75% + penalty |
| Attestor | 1,000 POP | False attestation | 100% |

### Attack Scenarios & Defenses

#### Attack 1: Plagiarism (Copy Existing Prompt)

**Attack:**
Attacker observes revealed prompt P1

Attacker commits same prompt: C_a = H(P1 || nonce_a || M_a)

Attacker claims authorship

**Defense:**
Timestamp precedence: Earlier commitment wins

DID-binding: Each commit tied to unique identity

Reputation penalty: Duplicate detections lower score

Economic loss: Stake forfeited if plagiarism proven

**Economic Analysis:**
- Attack cost: MIN_STAKE (0.001 ETH) + gas
- Expected gain: 0 (precedence prevents profit)
- **Rational decision**: Don't attack (negative EV)

#### Attack 2: Sybil (Multiple Fake Identities)

**Attack:**
Attacker creates N DIDs

Each DID submits similar prompts

Attempts to dominate reputation or voting

**Defense:**
Stake per DID: N × MIN_STAKE required

Reputation system: New DIDs start at low reputation

Challenge mechanism: Any user can challenge suspicious pattern

Collusion detection: Graph analysis identifies clusters

**Economic Analysis:**
- Attack cost: N × 0.001 ETH × (1 + gas_multiplier)
- Expected gain: Reputation_boost / N (diminishes with N)
- Break-even: N > 1000 (impractical)
- **Rational decision**: Attack unprofitable

#### Attack 3: Censorship (Registrar Blocks Commit)

**Attack:**
Malicious registrar M refuses to include commit C

User's prompt never reaches consensus

**Defense:**
Byzantine fault tolerance: 7 registrars, need 5/7 honest

Challenge mechanism: User proves censorship via signed commit receipt

Slashing: Malicious registrar loses 10,000 POP stake

Redundancy: User can resubmit to different registrar

**Economic Analysis:**
- Attack cost: 10,000 POP stake (slashed) + reputation loss
- Expected gain: Censorship_fee (user has no reason to pay)
- **Rational decision**: Don't attack (guaranteed loss)

### Rational Actor Proof (Simplified)

**Theorem**: Under our staking model, rational actors will behave honestly.

**Proof Sketch:**
Let:

S = Stake amount

P_detect = Probability of detection (> 0.9 in our model)

G = Gain from attack

L = Loss if detected (S + penalty)

Expected Value of Attack:
EV_attack = (1 - P_detect) × G - P_detect × L

For rational actor to attack:
EV_attack > 0
=> (1 - P_detect) × G > P_detect × L
=> G > P_detect × L / (1 - P_detect)

Given:

P_detect = 0.9 (Byzantine fault tolerance + challenge mechanism)

L = 10,000 POP (registrar stake)

G_max ≈ 100 POP (realistic censorship fee)

=> 100 > 0.9 × 10,000 / 0.1
=> 100 > 90,000 ❌

Therefore, EV_attack < 0 for all realistic scenarios.
∎

### Challenge Mechanism

**Process:**
User submits commit to Registrar R1

R1 issues signed receipt: Sign_R1(commit_hash, timestamp)

If R1 censors (doesn't include in batch), user files challenge:

Submit receipt to smart contract

Provide merkle proof of exclusion

Governance verifies:

Check R1's signature on receipt

Verify commit absent from R1's batch

If censorship proven:

Slash R1's 10,000 POP stake

Distribute 80% to challenger, 20% to treasury

Revoke R1's registrar status

### Governance Parameters

uint256 public constant MIN_STAKE_REGISTRAR = 10000 * 1018;
uint256 public constant MIN_STAKE_SEQUENCER = 5000 * 1018;
uint256 public constant CHALLENGE_PERIOD = 7 days;
uint256 public constant SLASH_PERCENTAGE = 100; // 100% for censorship
uint256 public constant CHALLENGER_REWARD = 80; // 80% of slashed amount

### Token Economics (Future Mainnet)

**Initial Distribution:**
- Team: 20%
- Community: 30%
- Staking Rewards: 25%
- Ecosystem Fund: 15%
- Treasury: 10%

**Inflation Rate:**
- Year 1: 5%
- Year 2-5: 3%
- Year 5+: 1%

**Utility:**
1. Staking (security)
2. Governance voting
3. Fee payment (commit submission)
4. Reputation boosting

### References
1. Buterin, V. (2014). "Slasher: A Punitive Proof-of-Stake Algorithm"
2. Zamfir, V. (2015). "Introducing Casper 'the Friendly Ghost'"
3. Saleh, F. (2020). "Blockchain Without Waste"
