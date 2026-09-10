import hre from "hardhat";

async function main() {
  const { ethers } = hre;
  const [deployer] = await ethers.getSigners();
  console.log("Deploying community contracts from:", deployer.address);

  const Factory = await ethers.getContractFactory("PermissionlessMemeFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();

  const Oracle = await ethers.getContractFactory("DailyMarketCapOracle");
  const oracle = await Oracle.deploy(deployer.address);
  await oracle.waitForDeployment();

  const Born = await ethers.getContractFactory("BornToken");
  const born = await Born.deploy(deployer.address);
  await born.waitForDeployment();

  console.log({
    born: await born.getAddress(),
    factory: await factory.getAddress(),
    oracle: await oracle.getAddress(),
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
