const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Starting BlockQuest smart contract deployment...");
  console.log("📡 Connecting to Hardhat network...");

  // Get the contract factories
  const StakingToken = await ethers.getContractFactory("StakingToken");
  const StakingContract = await ethers.getContractFactory("StakingContract");
  const AnchorContract = await ethers.getContractFactory("AnchorContract");
  const DIDRegistry = await ethers.getContractFactory("DIDRegistry");

  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deploying contracts with account:", await deployer.getAddress());
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(await deployer.getAddress())), "ETH");

  // Deploy StakingToken first
  console.log("\n📄 Deploying StakingToken...");
  const stakingToken = await StakingToken.deploy();
  await stakingToken.waitForDeployment();
  const stakingTokenAddress = await stakingToken.getAddress();
  console.log("✅ StakingToken deployed to:", stakingTokenAddress);

  // Deploy StakingContract
  console.log("\n📄 Deploying StakingContract...");
  const stakingContract = await StakingContract.deploy(stakingTokenAddress);
  await stakingContract.waitForDeployment();
  const stakingContractAddress = await stakingContract.getAddress();
  console.log("✅ StakingContract deployed to:", stakingContractAddress);

  // Deploy AnchorContract
  console.log("\n📄 Deploying AnchorContract...");
  const anchorContract = await AnchorContract.deploy();
  await anchorContract.waitForDeployment();
  const anchorContractAddress = await anchorContract.getAddress();
  console.log("✅ AnchorContract deployed to:", anchorContractAddress);

  // Deploy DIDRegistry
  console.log("\n📄 Deploying DIDRegistry...");
  const didRegistry = await DIDRegistry.deploy();
  await didRegistry.waitForDeployment();
  const didRegistryAddress = await didRegistry.getAddress();
  console.log("✅ DIDRegistry deployed to:", didRegistryAddress);

  // Mint initial tokens for testing (before transferring ownership)
  console.log("\n💰 Minting initial tokens...");
  const mintAmount = ethers.parseEther("1000000"); // 1 million tokens
  await stakingToken.mint(await deployer.getAddress(), mintAmount);
  console.log("✅ Minted", ethers.formatEther(mintAmount), "tokens to deployer");

  // Setup StakingContract with StakingToken
  console.log("\n🔧 Setting up StakingContract...");
  await stakingToken.transferOwnership(stakingContractAddress);
  console.log("✅ StakingToken ownership transferred to StakingContract");

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Contract Addresses:");
  console.log("   StakingToken:", stakingTokenAddress);
  console.log("   StakingContract:", stakingContractAddress);
  console.log("   AnchorContract:", anchorContractAddress);
  console.log("   DIDRegistry:", didRegistryAddress);

  console.log("\n🔗 Verification:");
  console.log("   - StakingToken owner:", await stakingToken.owner());
  console.log("   - Deployer token balance:", ethers.formatEther(await stakingToken.balanceOf(await deployer.getAddress())));
  console.log("   - StakingContract token:", await stakingContract.token());

  // Save deployment addresses to JSON file
  console.log("\n💾 Saving deployment addresses...");
  const deploymentInfo = {
    network: "localhost",
    deployer: await deployer.getAddress(),
    timestamp: new Date().toISOString(),
    contracts: {
      StakingToken: stakingTokenAddress,
      StakingContract: stakingContractAddress,
      AnchorContract: anchorContractAddress,
      DIDRegistry: didRegistryAddress
    },
    verification: {
      stakingTokenOwner: await stakingToken.owner(),
      deployerBalance: ethers.formatEther(await stakingToken.balanceOf(await deployer.getAddress())),
      stakingContractToken: await stakingContract.token()
    }
  };

  fs.writeFileSync("deployed-addresses.json", JSON.stringify(deploymentInfo, null, 2));
  console.log("✅ Deployment addresses saved to deployed-addresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
