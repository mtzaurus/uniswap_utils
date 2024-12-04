const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("USDT", (m) => {
    const rocket = m.contract("TestToken", ["Test USDT token (v2)", "USDT", 18]);

    return { rocket };
});
