const hre = require("hardhat")
const { ethers } = hre
const fs = require('fs')
const path = require('path')

async function main() {
  console.log("🚀 Starting Hypertoons NFT Optimized Deployment on HyperLiquid Mainnet...")

  // Load merkle roots
  const teamProofsPath = path.join(__dirname, '../src/data/team-proofs.json')
  const ogProofsPath = path.join(__dirname, '../src/data/og-proofs.json')
  const wlProofsPath = path.join(__dirname, '../src/data/wl-proofs.json')

  const teamProofs = JSON.parse(fs.readFileSync(teamProofsPath, 'utf8'))
  const ogProofs = JSON.parse(fs.readFileSync(ogProofsPath, 'utf8'))
  const wlProofs = JSON.parse(fs.readFileSync(wlProofsPath, 'utf8'))

  const [deployer] = await ethers.getSigners()
  console.log("- Deployer:", deployer.address)
  
  const balance = await ethers.provider.getBalance(deployer.address)
  console.log("- Balance:", ethers.formatEther(balance), "HYPE")

  // Contract parameters
  const contractParams = {
    baseURI: "ipfs://bafybeiellww2lcrlzc6gen6mf5i6347zicrnsyqdrx56cfy4ci2q3wocvy/",
    teamMerkleRoot: teamProofs.merkleRoot,
    ogMerkleRoot: ogProofs.merkleRoot,
    wlMerkleRoot: wlProofs.merkleRoot
  }

  console.log("\n📋 Contract Parameters:")
  console.log("- Base URI:", contractParams.baseURI)
  console.log("- Team Merkle Root:", contractParams.teamMerkleRoot)
  console.log("- OG Merkle Root:", contractParams.ogMerkleRoot)
  console.log("- WL Merkle Root:", contractParams.wlMerkleRoot)

  // Deploy contract
  console.log("\n🔨 Deploying HypertoonsNFTOptimized contract...")
  
  const HypertoonsNFT = await ethers.getContractFactory("HypertoonsNFTOptimized")
  const contract = await HypertoonsNFT.deploy(
    contractParams.baseURI,
    contractParams.teamMerkleRoot,
    contractParams.ogMerkleRoot,
    contractParams.wlMerkleRoot
  )

  await contract.waitForDeployment()
  const contractAddress = await contract.getAddress()

  console.log("\n✅ Contract deployed successfully!")
  console.log("📍 Contract Address:", contractAddress)
  console.log("🔗 Transaction Hash:", contract.deploymentTransaction().hash)

  // Verify deployment
  console.log("\n🔍 Verifying deployment...")
  const totalSupply = await contract.totalSupply()
  const currentPhase = await contract.currentPhase()
  const owner = await contract.owner()

  console.log("- Total Supply:", totalSupply.toString())
  console.log("- Current Phase:", currentPhase.toString(), "(0=NONE, 1=TEAM, 2=OG, 3=WL, 4=PUBLIC)")
  console.log("- Owner:", owner)

  // Save deployment info
  const deploymentInfo = {
    network: "hyperliquid",
    chainId: "999",
    contractAddress: contractAddress,
    deployer: deployer.address,
    txHash: contract.deploymentTransaction().hash,
    timestamp: new Date().toISOString(),
    contractParams,
    verification: {
      totalSupply: totalSupply.toString(),
      currentPhase: currentPhase.toString(),
      owner: owner
    }
  }

  // Save to file
  const fileName = `deployment-hyperliquid-${Date.now()}.json`
  const filePath = path.join(__dirname, fileName)
  fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2))
  
  console.log("\n💾 Deployment info saved to:", fileName)

  // Update contract config
  console.log("\n📝 Next steps:")
  console.log(`1. Update src/config/contract.js with the new contract address: ${contractAddress}`)
  console.log("2. Start the team phase using the startTeamPhase.js script")
  console.log("3. Monitor the contract for successful minting")

  console.log("\n🎉 Optimized deployment completed successfully!")
  console.log("Contract Address:", contractAddress)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error)
    process.exit(1)
  }) 