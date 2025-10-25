const axios = require('axios');
const fs = require('fs');

async function testEvidenceGeneration() {
  console.log('🧪 Testing Evidence Generation System\n');

  try {
    // Step 1: Submit a test commit
    console.log('1️⃣ Submitting test commit...');
    const commitResponse = await axios.post('http://localhost:7001/commit', {
      did: 'did:ethr:0xTestUser123',
      signature: '0xTestSignature123',
      content: 'Test AI prompt for Day 3 evidence generation'
    });

    const commitId = commitResponse.data.commit_id;
    console.log(`   ✅ Commit submitted: ${commitId}\n`);

    // Step 2: Wait for batching
    console.log('2️⃣ Waiting 35 seconds for batching...');
    await sleep(35000);

    // Step 3: Wait for anchoring
    console.log('3️⃣ Waiting 15 seconds for anchoring...');
    await sleep(15000);

    // Step 4: Check commit status
    console.log('4️⃣ Checking commit status...');
    const statusResponse = await axios.get(`http://localhost:7001/commit/${commitId}`);
    console.log(`   Status: ${statusResponse.data.status}`);

    if (statusResponse.data.status !== 'anchored') {
      console.log('   ⚠️  Commit not yet anchored. Cannot generate evidence.');
      console.log('   Try running this test again in 1-2 minutes.\n');
      return;
    }

    // Step 5: Generate evidence
    console.log('\n5️⃣ Generating evidence package...');
    const evidenceResponse = await axios.get(`http://localhost:7001/evidence/${commitId}`);
    
    console.log('   ✅ Evidence generated successfully!\n');
    console.log('   Evidence Package:');
    console.log(`   - PDF CID: ${evidenceResponse.data.evidence.pdf_cid}`);
    console.log(`   - JSON CID: ${evidenceResponse.data.evidence.json_cid}`);
    console.log(`   - PDF URL: ${evidenceResponse.data.evidence.pdf_url}`);
    console.log(`   - JSON URL: ${evidenceResponse.data.evidence.json_url}\n`);

    // Step 6: Test compliance endpoints
    console.log('6️⃣ Testing compliance endpoints...');
    
    // Test /my-data
    const myDataResponse = await axios.get(`http://localhost:7001/compliance/my-data?did=did:ethr:0xTestUser123`);
    console.log(`   ✅ /my-data: ${myDataResponse.data.total_commits} commits found`);

    // Test /dmca-report
    const dmcaResponse = await axios.post('http://localhost:7001/compliance/dmca-report', {
      commit_id: commitId,
      reporter_email: 'test@example.com',
      reason: 'Test DMCA report'
    });
    console.log(`   ✅ /dmca-report: ${dmcaResponse.data.ticket_id}`);

    console.log('\n✅ ALL TESTS PASSED!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

testEvidenceGeneration();
