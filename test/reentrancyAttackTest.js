const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("💥 Reentrancy Attack Test", function () {
  let deployer, victim, attacker;
  let vulnerableBank, attackerContract;

  beforeEach(async () => {
    [deployer, victim, attacker] = await ethers.getSigners();

    const VulnerableBank = await ethers.getContractFactory("VulnerableBank", deployer);
    vulnerableBank = await VulnerableBank.deploy();
    await vulnerableBank.waitForDeployment();

    const Attacker = await ethers.getContractFactory("Attacker", attacker);
    attackerContract = await Attacker.deploy(await vulnerableBank.getAddress());
    await attackerContract.waitForDeployment();

    await vulnerableBank.connect(victim).deposit({ value: ethers.parseEther("10") });
  });

  it("💸 공격자가 재진입 공격으로 잔액을 탈취할 수 있어야 한다", async () => {
    await attackerContract.connect(attacker).attack({ value: ethers.parseEther("1") });

    const balance = await ethers.provider.getBalance(await attackerContract.getAddress());
    console.log("공격자 컨트랙트 잔액:", ethers.formatEther(balance), "ETH");

    expect(balance).to.be.gt(ethers.parseEther("10"));
  });
});