import { ethers } from "hardhat";
async function main(){
  const [deployer]=await ethers.getSigners();
  const Registry=await ethers.getContractFactory("MemeRegistry");const registry=await Registry.deploy();await registry.waitForDeployment();
  const Factory=await ethers.getContractFactory("MemeTokenFactory");const factory=await Factory.deploy(await registry.getAddress(),deployer.address);await factory.waitForDeployment();
  const Voting=await ethers.getContractFactory("MemeVoting");const voting=await Voting.deploy(await registry.getAddress(),await factory.getAddress());await voting.waitForDeployment();
  await (await factory.setVotingContract(await voting.getAddress())).wait();await (await registry.setProtocol(await voting.getAddress(),await factory.getAddress())).wait();
  console.log({registry:await registry.getAddress(),factory:await factory.getAddress(),voting:await voting.getAddress()});
}
main().catch(e=>{console.error(e);process.exitCode=1});
