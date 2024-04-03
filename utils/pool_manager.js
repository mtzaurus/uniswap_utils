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

function read_token_amounts(token1, token1_max, token2, token2_max) {
    var amount1 = 0;
    var amount2 = 0;

    console.log("\nPlease specify initial reserves for a pool.");
    console.log("Note: all atoken amounts must be specified in decimals-based fractions.");
    while (true) {
        // First tokens.
        amount1 = readline.question(
            "\nEnter new reserves for " + token1 + " (max: " + token1_max + "): "
        );
        amount1 = parseInt(amount1);
        if (isNaN(amount1)) {
            console.log("Invalid number, try again.");
            continue;
        }

        if (amount1 <= 0) {
            console.log("Amount of tokens must be greater than zero");
            continue;
        }

        if (amount1 > token1_max) {
            console.log("Amount of tokens exceeds amount available for the wallet");
            continue;
        }

        // Second token.
        while (true) {
            amount2 = readline.question(
                "\nEnter new reserves for " + token2 + " (max: " + token2_max + "): "
            );
            amount2 = parseInt(amount2);
            if (isNaN(amount2)) {
                console.log("Invalid number, try again.");
                continue;
            }

            if (amount2 <= 0) {
                console.log("Amount of tokens must be greater than zero");
                continue;
            }

            if (amount2 > token2_max) {
                console.log("Amount of tokens exceeds amount available for the wallet");
                continue;
            }
            break;
        }

        var yes = readline.question("\n Are the values above correct ? [Y/N]");
        if (yes == "Y" || yes == "y") {
            break;
        }
    }

    return [amount1, amount2]
}

async function create_pool(provider, wallet) {
    const uniswapRouter = new ethers.Contract(uniswapRouterAddress, uniswapRouterABI, provider);
    const routerContract = uniswapRouter.connect(wallet);

    const uniswapFactory = new ethers.Contract(uniswapFactoryAddress, uniswapFactoryABI, provider);
    const factoryContract = uniswapFactory.connect(wallet);

    console.log("\nTo create a UniswapV2 pool, you need to provide addresses for all tokens.\n");
    console.log("Note: you wallet must have enough tokens for a new pool to be created.");
    console.log("      Creation of empty pools is not allowed.\n")

    var token1_addr = readline.question("Enter address of the first token : ");
    var token2_addr = readline.question("Enter address of the second token: ");

    const contract1 = new ethers.Contract(token1_addr, erc20TokenABI, provider).connect(wallet);
    var symbol1 = await contract1.symbol();
    var decimals1 = await contract1.decimals();

    const contract2 = new ethers.Contract(token2_addr, erc20TokenABI, provider).connect(wallet);
    var symbol2 = await contract2.symbol();
    var decimals2 = await contract2.decimals();

    // Make sure no UniswapV2 pool exists for target tokens.
    try {
        var pool_addr = await factoryContract.getPair(token1_addr, token2_addr);
        if (pool_addr != "0x0000000000000000000000000000000000000000") {
            console.log("UniswapV2 pool already exists for target tokens: " + pool_addr);
            return 1;
        }
    } catch (e) {
        console.log("Failed to check for existing UniswapV2 pools");
        return 1;
    }

    // Make sure user owns enough tokens to create a pool.
    var balance1 = 0;
    var balance2 = 0;
    try {
        balance1 = await contract1.balanceOf(config.WALLET_ADDRESS);
        balance2 = await contract2.balanceOf(config.WALLET_ADDRESS);

        if (balance1 == 0) {
            console.log("Wallet doesn't have enough balance for token " + symbol1 + " to create a pool.");
            return 1;
        }

        if (balance2 == 0) {
            console.log("Wallet doesn't have enough balance for token " + symbol2 + " to create a pool.");
            return 1;
        }
    } catch (e) {
        console.log("Failed to retrieve balances of tokens");
        return 1;
    }

    // Determine initial pool reserves.
    var pool_reserves = read_token_amounts(
        symbol1,
        balance1,
        symbol2,
        balance2
    );

    // Use BigInt when communicating with ERC20 contracts.
    var token_reserve1 = BigInt(pool_reserves[0]);
    var token_reserve2 = BigInt(pool_reserves[1]);

    // Approve tokens for UniswapV2 router before adding liquidity.
    // Perform operation multiple times to handle gas price races.
    for (var i = 10; i >= 0; i--) {
        try {
            console.log(`Approving token ${symbol1} transfer for UniswapV2 factory (${token_reserve1} tokens to approve) ...`);
            await contract1.approve(uniswapRouterAddress, token_reserve1);
            console.log("Token transfer aproved successfully for " + symbol1);
            break;
        } catch (e) {
            if (i == 0) {
                console.log("Failed to approve token transfer, pool creation failed");
                console.log(e);
                return 1;
            }
            continue;
        }
    }

    console.log(`Approving token ${symbol2} transfer for UniswapV2 factory (${token_reserve2} tokens to approve) ...`);
    for (var i = 10; i >= 0; i--) {
        try {
            await contract2.approve(uniswapRouterAddress, token_reserve2);
            console.log("Token transfer aproved successfully for " + symbol2);
            break;
        } catch (e) {
            if (i == 0) {
                console.log("Failed to approve token transfer, pool creation failed");
                return 1;
            }
            continue;
        }
    }

    console.log("\nToken transfer successfully approved, creating a pool with the following reserves:");
    console.log(`${symbol1}: ${token_reserve1}`);
    console.log(`${symbol2}: ${token_reserve2}`);
    console.log("Current pool price: " + (token_reserve1 / token_reserve2));

    var yes = readline.question("\n Create a pool ? [Y/N]");
    if (yes != "Y" && yes != "y") {
        return 1;
    }

    // Try to create a pool a few times to mitigate gas price races.
    for (var i = 5; i >= 0; i--) {
        try {
            console.log("\nCreating a pool using token reserves provided ...");
            const deadline = ethers.getBigInt(Math.floor(Date.now() / 1000) + 200000);

            tx = await routerContract.addLiquidity(
                token1_addr,
                token2_addr,
                token_reserve1,
                token_reserve2,
                1,
                1,
                config.WALLET_ADDRESS,
                deadline
            );
            receipt = await tx.wait();

            console.log("Transaction hash: " + receipt.hash);
            console.log("New UniswapV2 pool created successfully !");
            break;
        } catch (e) {
            if (i == 0) { 
                console.log("Failed to create a new UniswapV2 pool");
                console.log(e);
                return 1;
            } else {
                console.log("Pool creation failed (potential gas price races), trying one more time");
            }
        }
    }

    // Get the the address of the pool.
    try {
        var poolAddress = await factoryContract.getPair(token1_addr, token2_addr);
        console.log("Pool address: " + poolAddress);

        // Access pool contract to get current pool reserves.
        const uniswapPool = new ethers.Contract(poolAddress, uniswapPoolABI, provider);
        const poolContract = uniswapPool.connect(wallet);

        var reserves = await poolContract.getReserves();
        console.log("Pool has the following token reserves: " + reserves[0] + " / " + reserves[1]);
    } catch (e) {
        console.log("Failed to get the address of the newly created pool.");
    }

    return 0;
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
    console.log("(0) Exit.")

    switch (readline.question("\nPlease select 1 or 0: ")) {
        case "1":
            return await create_pool(provider, connectedWallet);
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