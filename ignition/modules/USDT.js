const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("USDC", (m) => {
    const rocket = m.contract("TestToken", ["Test USDC token (v2)", "USDC", 18]);
  
    return { rocket };
});
