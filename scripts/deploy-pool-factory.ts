import hre from "hardhat";

const ROBINHOOD_WETH = "0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73";
const ROBINHOOD_V3_POSITION_MANAGER = "0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3";

async function main() {
  const { ethers } = hre;
  const [deployer] = await ethers.getSigners();
  console.log("Deploying pool factory from:", deployer.address);
  const Factory = await ethers.getContractFactory("PoolMemeFactory");
  const factory = await Factory.deploy(ROBINHOOD_WETH, ROBINHOOD_V3_POSITION_MANAGER);
  await factory.waitForDeployment();
  console.log("PoolMemeFactory:", await factory.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
