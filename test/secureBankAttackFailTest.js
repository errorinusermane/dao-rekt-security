const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("🛡️ SecureBank - 재진입 공격 방어 테스트", function () {
  let deployer, victim, attacker;
  let secureBank, attackerContract;

  beforeEach(async () => {
    [deployer, victim, attacker] = await ethers.getSigners();

    const SecureBank = await ethers.getContractFactory("SecureBank", deployer);
    secureBank = await SecureBank.deploy();
    await secureBank.waitForDeployment();

    const Attacker = await ethers.getContractFactory("Attacker", attacker);
    attackerContract = await Attacker.deploy(await secureBank.getAddress());
    await attackerContract.waitForDeployment();

    await secureBank.connect(victim).deposit({ value: ethers.parseEther("10") });
  });

  it("공격자가 공격을 시도해도 트랜잭션이 revert되어야 한다", async () => {
    await expect(
      attackerContract.connect(attacker).attack({ value: ethers.parseEther("1") })
    ).to.be.reverted;
  });
});