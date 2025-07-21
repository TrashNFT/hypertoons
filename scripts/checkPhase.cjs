const hre = require("hardhat")
const { ethers } = hre

async function main() {
  console.log("🔍 Checking contract phase on HyperLiquid Mainnet...")

  const contractAddress = "0x6eC511e72F5F2A478d621E8d8088C0d1637BcaD3"
  const HypertoonsNFT = await ethers.getContractFactory("HypertoonsNFTUltraMinimal")
  const contract = HypertoonsNFT.attach(contractAddress)

  console.log("📋 Contract Details:")
  console.log("- Address:", contractAddress)

  try {
    const currentPhase = await contract.currentPhase()
    const merkleRoot = await contract.merkleRoot()
    
    console.log("\n📊 Current Status:")
    console.log("- Phase:", currentPhase.toString(), "(0=NONE, 1=TEAM, 2=OG, 3=WL, 4=PUBLIC)")
    console.log("- Merkle Root:", merkleRoot)

  } catch (error) {
    console.error("❌ Error:", error.message)
    process.exit(1)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error)
    process.exit(1)
  }) 