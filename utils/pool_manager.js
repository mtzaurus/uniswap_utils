const ethers = require("ethers");
var readline = require('readline-sync');
var config = require("../config");

const uniswapRouterABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "tokenA",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "tokenB",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amountADesired",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountBDesired",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountAMin",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountBMin",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
            }
        ],
        "name": "addLiquidity",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "amountA",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountB",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "liquidity",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [

        ],
        "name": "factory",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

const erc20TokenABI = [
    {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [{
            "internalType": "string",
            "name": "",
            "type": "string"
        }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [{
            "internalType": "string",
            "name": "",
            "type": "string"
        }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{
            "internalType": "address",
            "name": "_spender",
            "type": "address"
        }, {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
        }],
        "name": "approve",
        "outputs": [{
            "internalType": "bool",
            "name": "",
            "type": "bool"
        }],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{
            "internalType": "address",
            "name": "",
            "type": "address"
        }],
        "name": "balanceOf",
        "outputs": [{
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [{
            "internalType": "uint8",
            "name": "",
            "type": "uint8"
        }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];

const uniswapPoolABI = [
    {
        "constant": true,
        "inputs": [

        ],
        "name": "token0",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [

        ],
        "name": "token1",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [

        ],
        "name": "getReserves",
        "outputs": [
            {
                "internalType": "uint112",
                "name": "_reserve0",
                "type": "uint112"
            },
            {
                "internalType": "uint112",
                "name": "_reserve1",
                "type": "uint112"
            },
            {
                "internalType": "uint32",
                "name": "_blockTimestampLast",
                "type": "uint32"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];

const uniswapFactoryABI = [
    {
        "constant": true,
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "getPair",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];

const uniswapRouterAddress = "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008";
const uniswapFactoryAddress = "0x7E0987E5b3a30e3f2828572Bb659A548460a3003";

function readTokenAmounts(token1, token1Max, token2, token2Max) {

    function getTokenAmount(token, maxAmount) {
        while (true) {
            const input = readline.question(`\nEnter new reserves for ${token} (max: ${maxAmount}): `);
            const amount = parseInt(input);

            if (isNaN(amount)) {
                console.log("Invalid number, try again.");
            } else if (amount <= 0) {
                console.log("Amount of tokens must be greater than zero.");
            } else if (amount > maxAmount) {
                console.log("Amount of tokens exceeds amount available for the wallet.");
            } else {
                return amount;
            }
        }
    }

    console.log("\nPlease specify initial reserves for a pool.");
    console.log("Note: all token amounts must be specified in decimals-based fractions.");

    let amount1, amount2;

    while (true) {
        amount1 = getTokenAmount(token1, token1Max);
        amount2 = getTokenAmount(token2, token2Max);

        const confirmation = readline.question("\nAre the values above correct? [Y/N]: ");
        if (confirmation.toLowerCase() === "y") {
            break;
        }
    }

    return [amount1, amount2];
}

async function getTokenDetails(provider, wallet, tokenAddr) {
    const contract = new ethers.Contract(tokenAddr, erc20TokenABI, provider).connect(wallet);
    const symbol = await contract.symbol();
    const decimals = await contract.decimals();
    const balance = await contract.balanceOf(config.WALLET_ADDRESS);

    return { contract, symbol, decimals, balance };
}

async function approveToken(contract, symbol, amount) {
    for (let i = 10; i >= 0; i--) {
        try {
            console.log(`Approving token ${symbol} transfer (${amount} tokens to approve)...`);
            await contract.approve(uniswapRouterAddress, amount);
            console.log(`Token transfer approved successfully for ${symbol}`);
            break;
        } catch (e) {
            if (i === 0) {
                console.error(`Failed to approve token ${symbol} transfer`);
                throw e;
            }
            console.warn(`Retrying token ${symbol} approval...`);
        }
    }
}

async function checkPoolExistence(factoryContract, token1Addr, token2Addr) {
    try {
        const poolAddr = await factoryContract.getPair(token1Addr, token2Addr);
        if (poolAddr !== "0x0000000000000000000000000000000000000000") {
            console.log(`UniswapV2 pool already exists: ${poolAddr}`);
            return poolAddr;
        }
    } catch (e) {
        console.error("Failed to check for existing pools", e);
        throw e;
    }
    return null;
}

async function executeLiquidityOperation(routerContract, token1Addr, token2Addr, tokenReserve1, tokenReserve2, walletAddress) {
    for (let i = 5; i >= 0; i--) {
        try {
            console.log("Adding liquidity with provided token reserves...");
            const deadline = ethers.getBigInt(Math.floor(Date.now() / 1000) + 200000);

            const tx = await routerContract.addLiquidity(
                token1Addr,
                token2Addr,
                tokenReserve1,
                tokenReserve2,
                1,
                1,
                walletAddress,
                deadline
            );
            const receipt = await tx.wait();

            console.log(`Transaction successful. Hash: ${receipt.hash}`);
            return;
        } catch (e) {
            if (i === 0) {
                console.error("Failed to execute liquidity operation", e);
                throw e;
            }
            console.warn("Retrying liquidity operation...");
        }
    }
}

async function managePool(provider, wallet, isReplenish) {
    const uniswapRouter = new ethers.Contract(uniswapRouterAddress, uniswapRouterABI, provider);
    const routerContract = uniswapRouter.connect(wallet);
    const uniswapFactory = new ethers.Contract(uniswapFactoryAddress, uniswapFactoryABI, provider);
    const factoryContract = uniswapFactory.connect(wallet);

    console.log("\nTo manage a UniswapV2 pool, you need to provide token addresses.\n");

    const token1Addr = readline.question("Enter address of the first token: ");
    const token2Addr = readline.question("Enter address of the second token: ");

    const token1 = await getTokenDetails(provider, wallet, token1Addr);
    const token2 = await getTokenDetails(provider, wallet, token2Addr);

    const poolAddr = await checkPoolExistence(factoryContract, token1Addr, token2Addr);
    if (poolAddr) {
        var poolAddress = await factoryContract.getPair(token1Addr, token2Addr);
        // Access pool contract to get current pool reserves.
        const uniswapPool = new ethers.Contract(poolAddress, uniswapPoolABI, provider);
        const poolContract = uniswapPool.connect(wallet);

        var reserves = await poolContract.getReserves();
        const pool_reserve1 = reserves[0];
        const pool_reserve2 = reserves[1];

        console.log(`Token 1: ${token1.symbol}, Balance: ${token1.balance} Pool reserve: ${pool_reserve1}`);
        console.log(`Token 2: ${token2.symbol}, Balance: ${token2.balance} Pool reserve: ${pool_reserve2}`);
    } else {
        console.log(`Token 1: ${token1.symbol}, Balance: ${token1.balance}`);
        console.log(`Token 2: ${token2.symbol}, Balance: ${token2.balance}`);
    }

    if (!isReplenish && poolAddr) {
        console.log("Pool already exists, creation aborted.");
        return;
    }

    if (token1.balance === 0 || token2.balance === 0) {
        console.error("Insufficient token balance for pool operation.");
        return;
    }

    const poolReserves = readTokenAmounts(token1.symbol, token1.balance, token2.symbol, token2.balance);
    const tokenReserve1 = BigInt(poolReserves[0]);
    const tokenReserve2 = BigInt(poolReserves[1]);

    await approveToken(token1.contract, token1.symbol, tokenReserve1);
    await approveToken(token2.contract, token2.symbol, tokenReserve2);

    console.log("Proceeding with liquidity operation...");
    await executeLiquidityOperation(routerContract, token1Addr, token2Addr, tokenReserve1, tokenReserve2, config.WALLET_ADDRESS);
    const poolAddrAfterSwap = await checkPoolExistence(factoryContract, token1Addr, token2Addr);
    if (poolAddrAfterSwap) {
        var poolAddress = await factoryContract.getPair(token1Addr, token2Addr);
        console.log(`Pool address created: ${poolAddress}`);
        console.log(`Token 1: ${token1.symbol} Added to the pool ${tokenReserve1}`);
        console.log(`Token 1: ${token2.symbol} Added to the pool ${tokenReserve2}`);
    }

    console.log("Liquidity operation completed.");
}

// Usage examples:
async function createPool(provider, wallet) {
    await managePool(provider, wallet, false);
}

async function replenishPool(provider, wallet) {
    await managePool(provider, wallet, true);
}


async function main() {
    // Make sure has properly configured wallet/private key. 
    if (config.WALLET_ADDRESS == "" || config.WALLET_PRIVATE_KEY == "") {
        console.log("WALLET_ADDRESS / WALLET_PRIVATE_KEY not configured");
        process.exit(1);
    }

    var provider = new ethers.JsonRpcProvider(config.NODE_URL);
    const wallet = new ethers.Wallet(config.WALLET_PRIVATE_KEY);
    const connectedWallet = wallet.connect(provider);

    console.log("\nWelcome to Sepolia UniswapV2 pool management utility.");
    console.log("Which action would you like to perform ?\n");
    console.log("(1) Create new UniswapV2 pool with initial liquidity.");
    console.log("(2) Replenish existing UniswapV2 pool.");
    console.log("(0) Exit.")

    switch (readline.question("\nPlease select 1, 2 or 0: ")) {
        case "1":
            return await createPool(provider, connectedWallet);
        case "2":
            return await replenishPool(provider, connectedWallet);
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