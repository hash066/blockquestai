const { FlashbotsBundleProvider } = require('@flashbots/ethers-provider-bundle');
const { ethers } = require('ethers');

async function submitViaFlashbots(sequencerWallet, anchorTx) {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  
  // Connect to Flashbots relay
  const flashbotsProvider = await FlashbotsBundleProvider.create(
    provider,
    sequencerWallet,
    'https://relay-sepolia.flashbots.net',
    'sepolia'
  );
  
  // Create bundle (transaction that won't be front-run)
  const bundle = [
    {
      signer: sequencerWallet,
      transaction: anchorTx
    }
  ];
  
  // Submit bundle
  const targetBlock = await provider.getBlockNumber() + 1;
  const bundleSubmission = await flashbotsProvider.sendBundle(bundle, targetBlock);
  
  console.log('📦 Flashbots bundle submitted:', bundleSubmission.bundleHash);
  
  // Wait for inclusion
  const waitResponse = await bundleSubmission.wait();
  
  if (waitResponse === 0) {
    console.log('✅ Bundle included in block');
  } else {
    console.log('❌ Bundle not included');
  }
  
  return bundleSubmission;
}

module.exports = { submitViaFlashbots };
