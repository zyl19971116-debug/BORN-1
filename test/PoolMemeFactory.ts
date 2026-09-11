import { expect } from "chai";
import hre from "hardhat";

const { ethers } = hre;

describe("PoolMemeFactory", function () {
  it("creates a token, seeds the ETH pool and burns the LP position", async function () {
    const [, creator] = await ethers.getSigners();
    const weth = await (await ethers.getContractFactory("MockWETH")).deploy();
    const manager = await (await ethers.getContractFactory("MockPositionManager")).deploy();
    const factory = await (await ethers.getContractFactory("PoolMemeFactory")).deploy(
      await weth.getAddress(),
      await manager.getAddress()
    );

    await factory.connect(creator).createTokenAndPool("Pool Meme", "POOL", "data:test", {
      value: ethers.parseEther("0.005"),
    });

    expect(await factory.launchCount()).to.equal(1);
    const launch = await factory.getLaunch(0);
    expect(launch.creator).to.equal(creator.address);
    expect(launch.initialEth).to.equal(ethers.parseEther("0.005"));
    expect(launch.pool).to.equal("0x0000000000000000000000000000000000001234");
    expect(await manager.lastRecipient()).to.equal("0x000000000000000000000000000000000000dEaD");
    expect(await manager.lastSqrtPriceX96()).to.be.greaterThan(0);

    const token = await ethers.getContractAt("MemeToken", launch.token);
    expect(await token.balanceOf(await manager.getAddress())).to.equal(await token.TOTAL_SUPPLY());
    expect(await weth.balanceOf(await manager.getAddress())).to.equal(ethers.parseEther("0.005"));
    expect(await token.balanceOf(creator.address)).to.equal(0);
  });

  it("rejects launches below the minimum ETH liquidity", async function () {
    const weth = await (await ethers.getContractFactory("MockWETH")).deploy();
    const manager = await (await ethers.getContractFactory("MockPositionManager")).deploy();
    const factory = await (await ethers.getContractFactory("PoolMemeFactory")).deploy(
      await weth.getAddress(),
      await manager.getAddress()
    );
    await expect(
      factory.createTokenAndPool("Pool Meme", "POOL", "data:test", {
        value: ethers.parseEther("0.0009"),
      })
    ).to.be.revertedWith("Initial ETH too low");
  });
});
