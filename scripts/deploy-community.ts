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

  const Rewards = await ethers.getContractFactory("DailyBornRewards");
  const rewards = await Rewards.deploy(
    await born.getAddress(),
    await factory.getAddress(),
    await oracle.getAddress()
  );
  await rewards.waitForDeployment();

  const funding = await born.transfer(
    await rewards.getAddress(),
    365_000_000n * 10n ** 18n
  );
  await funding.wait();

  console.log({
    born: await born.getAddress(),
    factory: await factory.getAddress(),
    oracle: await oracle.getAddress(),
    rewards: await rewards.getAddress(),
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
