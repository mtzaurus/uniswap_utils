var readline = require('readline-sync');

var amm = require('./raydium_amm');

async function main() {
    console.log("\nWelcome to Solana Devnet Raydium pool management utility.");
    console.log("Which action would you like to perform ?\n");
    console.log("(1) Create new Raydium Amm pool with initial liquidity.");
    console.log("(2) Replenish existing Raydium Amm pool.");
    console.log("(3) Create new mint.");
    console.log("(4) Create associated token account.");
    console.log("(5) Create token account.");
    console.log("(6) Mint to token account.");
    console.log("(7) Create market.");
    console.log("(8) Add liquidity.");
    console.log("(9) Fetch pool info.");
    console.log("(10) Swap.");
    console.log("(11) Add token metadata.");
    console.log("(0) Exit.")

    switch (readline.question("\nPlease select one of the options above: ")) {
        case "1":
            return await amm.createPool()
        case "2":
            return await amm.replenishPool();
        case "3":
            return await amm.createMint();
        case "4":
            return await amm.createAssociatedTokenAccount();
        case "5":
            return await amm.createTokenAccount();
        case "6":
            return await amm.mintToTokenAccount();
        case "7":
            return await amm.createMarket();
        case "8":
            return await amm.addLiquidity();
        case "9":
            return await amm.fetchRpcPoolInfo();
        case "10":
            return await amm.swap();
        case "11":
            return await amm.addMetadata();
        case "0":
            console.log("No action selected, exiting");
            break;
        default:
            console.log("Invalid action selected, exiting");
            process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });