require("@nomicfoundation/hardhat-toolbox");

const config = require("./config");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: config.NODE_URL,
      accounts: [config.WALLET_PRIVATE_KEY],
    },
  },
};
