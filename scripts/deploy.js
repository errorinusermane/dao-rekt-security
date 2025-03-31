const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("📦 배포 계정:", deployer.address);

  const balance = await deployer.getBalance();
  console.log("💰 배포 계정 잔액:", ethers.utils.formatEther(balance), "ETH");

  const SecureBank = await ethers.getContractFactory("SecureBank");
  const secureBank = await SecureBank.deploy();
  await secureBank.deployed();

  console.log("✅ SecureBank 배포 완료:", secureBank.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});