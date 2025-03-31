require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // 테스트넷 배포 시 필요

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {}, // 로컬 네트워크
    sepolia: {
      url: process.env.SEPOLIA_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};