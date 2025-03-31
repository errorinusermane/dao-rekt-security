const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("✅ SecureBank - 정상 입출금 테스트", function () {
  let deployer, user;
  let secureBank;

  beforeEach(async () => {
    [deployer, user] = await ethers.getSigners();

    const SecureBank = await ethers.getContractFactory("SecureBank", deployer);
    secureBank = await SecureBank.deploy();
    await secureBank.waitForDeployment();
  });

  it("사용자가 입금 후 출금하면 잔액이 0이 되어야 한다", async () => {
    const depositAmount = ethers.parseEther("1");

    await secureBank.connect(user).deposit({ value: depositAmount });

    let contractBalance = await ethers.provider.getBalance(await secureBank.getAddress());
    expect(contractBalance).to.equal(depositAmount);

    await secureBank.connect(user).withdraw();

    contractBalance = await ethers.provider.getBalance(await secureBank.getAddress());
    expect(contractBalance).to.equal(0);
  });
});