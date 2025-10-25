# Legal Compliance Framework

## Regulatory Landscape

### Jurisdictions Considered
- 🇺🇸 United States (CCPA, COPPA)
- 🇪🇺 European Union (GDPR)
- 🇨🇳 China (PIPL)
- 🇮🇳 India (DPDP Act 2023)

## GDPR Compliance

### Right to Access (Article 15)

**Implementation:**
GET /compliance/my-data?did=did:ethr:0x...

Response:
{
"did": "did:ethr:0x...",
"total_commits": 42,
"commits": [...]
}

**Compliance**: ✅ User can retrieve all data via authenticated API

### Right to Rectification (Article 16)

**Implementation:**
- User controls DID (self-sovereign identity)
- Can update DID-linked metadata off-chain
- On-chain commitments are immutable (legitimate limitation)

**Compliance**: ✅ Partial (blockchain immutability is disclosed)

### Right to Erasure (Article 17)

**Challenge**: Blockchain immutability conflicts with "right to be forgotten"

**Implementation:**
POST /compliance/request-deletion
{
"did": "did:ethr:0x...",
"commit_id": "...",
"reason": "GDPR erasure request"
}

**Compliance**: ✅ Hybrid approach:
1. Mark records as "deleted" in local databases
2. Remove from search indexes
3. Blockchain hash remains (pseudonymous, no PII)
4. User informed of technical limitation

### Data Portability (Article 20)

**Implementation:**
- JSON export via `/my-data` endpoint
- IPFS content directly accessible
- PDF evidence packages

**Compliance**: ✅ Full portability

### Lawful Basis (Article 6)

**Our basis**: Legitimate interest + consent
- Users explicitly sign transactions (consent)
- Cryptographic proof is legitimate interest
- No sensitive personal data stored on-chain

**Compliance**: ✅ Documented in Terms of Service

## CCPA Compliance (California)

### Right to Know

**Implementation**: Same as GDPR `/my-data` endpoint

**Compliance**: ✅

### Right to Delete

**Implementation**: Same as GDPR deletion process

**Compliance**: ✅ (with blockchain limitations disclosed)

### Right to Opt-Out

**Implementation:**
- Users can stop using service anytime
- No personal data sold (we don't sell data)

**Compliance**: ✅ N/A (no data sales)

## DMCA (Digital Millennium Copyright Act)

### Takedown Process

**Copyright holder submits notice:**
POST /compliance/dmca-report
{
"commit_id": "...",
"reporter_email": "rights@holder.com",
"copyright_claim": "Describes infringement",
"good_faith_statement": true
}

**Our response (within 48 hours):**
1. Review claim validity
2. If valid:
   - Mark content as "DMCA_flagged" in database
   - Remove from public APIs
   - Blockchain hash remains (no PII, just hash)
3. Notify user (counter-notice option)
4. Log incident

**Compliance**: ✅ Safe harbor provisions followed

## India DPDP Act 2023

### Data Localization

**Requirement**: Certain data must be stored in India

**Implementation:**
- Registrar nodes can be geographically distributed
- MinIO backup can have India region
- IPFS is decentralized (no single jurisdiction)

**Compliance**: ⚠️ Requires monitoring (law still evolving)

### Consent

**Implementation:**
- Explicit opt-in before commit submission
- Terms of Service clearly state blockchain immutability
- Users sign transactions (cryptographic consent)

**Compliance**: ✅

## AI-Specific Regulations

### EU AI Act (Proposed)

**Requirements for AI systems:**
1. Transparency (disclose AI-generated content)
2. Human oversight
3. Accuracy and robustness
4. Security

**Our approach:**
- ModelRegistry tracks AI model lineage
- Transparency via on-chain metadata
- User retains control (human oversight)

**Compliance**: ✅ Prepared for upcoming regulations

### US Executive Order on AI (Oct 2023)

**Focus**: Safety, security, trustworthy AI

**Our contribution:**
- Proof-of-Prompt prevents unauthorized use
- Chain-of-custody for AI outputs
- Supports accountability

**Compliance**: ✅ Aligns with government goals

## Terms of Service (Sample Clauses)

### Blockchain Immutability Notice

> "You acknowledge that data anchored to blockchain is immutable and cannot be deleted. While we will comply with data erasure requests by removing references from our systems, cryptographic hashes may remain on public blockchains."

### Intellectual Property

> "You retain all rights to your prompts and outputs. By using this service, you grant BlockQuest a limited license to process and anchor your content for verification purposes only."

### Limitation of Liability

> "BlockQuest provides cryptographic proof services 'as is.' We are not liable for disputes arising from AI-generated content ownership."

## Privacy Policy (Key Points)

1. **Data Collection**:
   - On-chain: Pseudonymous hashes only
   - Off-chain: DID, timestamps, IPFS CIDs

2. **Data Usage**:
   - Cryptographic verification
   - Legal evidence generation
   - System analytics (anonymized)

3. **Data Sharing**:
   - No sale to third parties
   - Shared with law enforcement if required by valid legal process

4. **Security Measures**:
   - End-to-end encryption
   - Multi-factor authentication
   - Regular security audits

## Compliance Checklist

- [x] GDPR Article 13/14 (Privacy Notice)
- [x] GDPR Article 15 (Right to Access)
- [x] GDPR Article 17 (Right to Erasure - partial)
- [x] CCPA Section 1798.100 (Right to Know)
- [x] DMCA Section 512 (Safe Harbor)
- [ ] Data Protection Impact Assessment (DPIA)
- [ ] Data Processing Agreement (DPA) with partners
- [ ] Appoint Data Protection Officer (DPO)
- [ ] Register with supervisory authority (if required)

## Contact

**Data Protection Officer**: dpo@blockquest.io
**Legal Inquiries**: legal@blockquest.io
**Security Issues**: security@blockquest.io
