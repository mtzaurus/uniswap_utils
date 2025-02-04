const ethers = require("ethers");
const { Pool, Position, TickMath, nearestUsableTick, Tick, SwapRouter, FeeAmount } = require('@uniswap/v3-sdk');
const { Token, CurrencyAmount, Pair, Route, Trade, TradeType } = require('@uniswap/sdk-core');
const BigNumber = require("bignumber.js");
var readline = require('readline-sync');
var config = require("../config");

const uniswapRouterAddress = "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD";
const uniswapFactoryAddress = "0x0227628f3F023bb0B980b67D528571c95c6DaC1c";
const nonFungiblePositionManager = "0x1238536071E1c677A632429e3655c799b22cDA52";

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

const uniswapFactoryABI = [
    {
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
          },
          {
            "internalType": "uint24",
            "name": "",
            "type": "uint24"
          }
        ],
        "name": "getPool",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
    },
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
            "internalType": "uint24",
            "name": "fee",
            "type": "uint24"
          }
        ],
        "name": "createPool",
        "outputs": [
          {
            "internalType": "address",
            "name": "pool",
            "type": "address"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      }
];

const uniswapPoolAbi = [
    {
        "inputs": [
          
        ],
        "name": "slot0",
        "outputs": [
          {
            "internalType": "uint160",
            "name": "sqrtPriceX96",
            "type": "uint160"
          },
          {
            "internalType": "int24",
            "name": "tick",
            "type": "int24"
          },
          {
            "internalType": "uint16",
            "name": "observationIndex",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "observationCardinality",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "observationCardinalityNext",
            "type": "uint16"
          },
          {
            "internalType": "uint8",
            "name": "feeProtocol",
            "type": "uint8"
          },
          {
            "internalType": "bool",
            "name": "unlocked",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
          
        ],
        "name": "liquidity",
        "outputs": [
          {
            "internalType": "uint128",
            "name": "",
            "type": "uint128"
          }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
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
        "stateMutability": "view",
        "type": "function"
    },
    {
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
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
          
        ],
        "name": "slot0",
        "outputs": [
          {
            "internalType": "uint160",
            "name": "sqrtPriceX96",
            "type": "uint160"
          },
          {
            "internalType": "int24",
            "name": "tick",
            "type": "int24"
          },
          {
            "internalType": "uint16",
            "name": "observationIndex",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "observationCardinality",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "observationCardinalityNext",
            "type": "uint16"
          },
          {
            "internalType": "uint8",
            "name": "feeProtocol",
            "type": "uint8"
          },
          {
            "internalType": "bool",
            "name": "unlocked",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          },
          {
            "internalType": "int24",
            "name": "tickLower",
            "type": "int24"
          },
          {
            "internalType": "int24",
            "name": "tickUpper",
            "type": "int24"
          },
          {
            "internalType": "uint128",
            "name": "amount",
            "type": "uint128"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "name": "mint",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "amount0",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amount1",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
          {
            "internalType": "uint160",
            "name": "sqrtPriceX96",
            "type": "uint160"
          }
        ],
        "name": "initialize",
        "outputs": [
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

const nonFungiblePositionManagerAbi = [
    {
        "inputs": [
          {
            "components": [
              {
                "internalType": "address",
                "name": "token0",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "token1",
                "type": "address"
              },
              {
                "internalType": "uint24",
                "name": "fee",
                "type": "uint24"
              },
              {
                "internalType": "int24",
                "name": "tickLower",
                "type": "int24"
              },
              {
                "internalType": "int24",
                "name": "tickUpper",
                "type": "int24"
              },
              {
                "internalType": "uint256",
                "name": "amount0Desired",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "amount1Desired",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "amount0Min",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "amount1Min",
                "type": "uint256"
              },
              {
                "internalType": "address",
                "name": "recipient",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
              }
            ],
            "internalType": "struct INonfungiblePositionManager.MintParams",
            "name": "params",
            "type": "tuple"
          }
        ],
        "name": "mint",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "uint128",
            "name": "liquidity",
            "type": "uint128"
          },
          {
            "internalType": "uint256",
            "name": "amount0",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amount1",
            "type": "uint256"
          }
        ],
        "stateMutability": "payable",
        "type": "function"
      }
];

async function checkPoolExistence(factoryContract, token1Addr, token2Addr, feeLevel) {
    try {
        const poolAddr = await factoryContract.getPool(token1Addr, token2Addr, feeLevel);
        if (poolAddr !== "0x0000000000000000000000000000000000000000") {
            return poolAddr;
        }
    } catch (e) {
        console.error("Failed to check for existing pools", e);
        throw e;
    }
    return null;
}

async function getTokenDetails(provider, wallet, tokenAddr) {
    const contract = new ethers.Contract(tokenAddr, erc20TokenABI, provider).connect(wallet);
    const symbol = await contract.symbol();
    const decimals = await contract.decimals();
    const balance = await contract.balanceOf(config.WALLET_ADDRESS);

    return { contract, symbol, decimals, balance };
}

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

async function executePoolCreation(factoryContract, token1Addr, token2Addr, feeLevel) {
    console.log("Creating a new UniswapV3 pool ...");
    try {
        const tx = await factoryContract.createPool(
            token1Addr,
            token2Addr,
            feeLevel
        );
        const receipt = await tx.wait();
        console.log(`Transaction successful. Hash: ${receipt.hash}`);

        return;
    } catch (e) {
        console.error("Failed to create UniswapV3 pool", e);
    }
}

function getPoolFeeLevel() {
    console.log("\nPlease select pool fee level:");
    console.log("(1) 1%");
    console.log("(2) 0.3%");
    console.log("(3) 0.05%");
    console.log("(4) 0.01%");
    console.log("(0) Exit.")
    switch (readline.question("\nSelected fee level: ")) {
        case "1":
            return 10000;
        case "2":
            return 3000;
        case "3":
            return 500;
        case "4":
            return 100;
        case "0":
            process.exit(1);
    }
}

async function createPool(provider, wallet) {
    const uniswapFactory = new ethers.Contract(uniswapFactoryAddress, uniswapFactoryABI, provider);
    const factoryContract = uniswapFactory.connect(wallet);

    console.log("\nTo manage a UniswapV3 pool, you need to provide token addresses.\n");

    const token1Addr = readline.question("Enter address of the first token: ");
    const token2Addr = readline.question("Enter address of the second token: ");

    var feeLevel = getPoolFeeLevel();

    const token1 = await getTokenDetails(provider, wallet, token1Addr);
    const token2 = await getTokenDetails(provider, wallet, token2Addr);

    const poolAddr = await checkPoolExistence(factoryContract, token1Addr, token2Addr, feeLevel);
    if (poolAddr) {
        var poolAddress = await factoryContract.getPool(token1Addr, token2Addr, feeLevel);
        // Access pool contract to get current pool reserves.
        let uniswapPool = new ethers.Contract(poolAddress, uniswapPoolAbi, provider);
        let poolContract = uniswapPool.connect(wallet);

        var pool_token0 = await poolContract.token0();
        var pool_token1 = await poolContract.token1();
        var liquidity = await poolContract.liquidity();

        console.log(`Token 0: ${pool_token0}, Token 1: ${pool_token1}, Liquidity: ${liquidity}`);
        return;
    }

    await executePoolCreation(factoryContract, token1Addr, token2Addr, feeLevel);
}

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

    console.log("\nPlease specify token reserves to be added to the pool.");
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

async function approveToken(contract, spender, symbol, amount) {
    for (let i = 10; i >= 0; i--) {
        try {
            console.log(`Approving token ${symbol} transfer (${amount} tokens to approve)...`);
            await contract.approve(spender, amount);
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

function priceToSqrtPrice(price, token0Decimals, token1Decimals) {
    const decimalAdjustment = 10 ** (token0Decimals - token1Decimals);
    const mathPrice = price / decimalAdjustment;

    let sqrtPriceX96 = Math.floor(Math.sqrt(mathPrice) * 2 ** 96);
    return BigInt(sqrtPriceX96);
  };

async function executeInitializePool(poolContract, price, tokenA_decimals, tokenB_decimals) {
    try {
        const sqrtPriceX96 = priceToSqrtPrice(price, tokenA_decimals, tokenB_decimals);

        console.log(`Initializing pool with price = ${price} and sqrtPriceX96 = ${sqrtPriceX96}`);
        const tx = await poolContract.initialize(sqrtPriceX96);
        const receipt = await tx.wait();
        console.log('Pool successfully initialized');
    } catch (e) {
        console.error(`Failed to initialize pool: ${e}`);
        return;
    }
}

async function InitializePool(provider, wallet) {
    console.log("\nTo manage a UniswapV3 pool, you need to provide token addresses.\n");

    const token1Addr = readline.question("Enter address of the first token: ");
    const token2Addr = readline.question("Enter address of the second token: ");

    const token1 = await getTokenDetails(provider, wallet, token1Addr);
    const token2 = await getTokenDetails(provider, wallet, token2Addr);
    
    var feeLevel = getPoolFeeLevel();

    const uniswapFactory = new ethers.Contract(uniswapFactoryAddress, uniswapFactoryABI, provider);
    const factoryContract = uniswapFactory.connect(wallet);

    const poolAddress = await checkPoolExistence(factoryContract, token1Addr, token2Addr, feeLevel);
    if (poolAddress == null) {
        console.log("No UniswapV3 pool with target fee level exists for given tokens");
        return;
    }

    const poolReserves = readTokenAmounts(token1.symbol, token1.balance, token2.symbol, token2.balance);
    const tokenReserve1 = BigInt(poolReserves[0]);
    const tokenReserve2 = BigInt(poolReserves[1]);

    // Fetch the pool data
    let uniswapPool = new ethers.Contract(poolAddress, uniswapPoolAbi, provider);
    const poolContract = uniswapPool.connect(wallet);
    const [sqrtPriceX96, tick, tickSpacing] = await poolContract.slot0();

    var poolToken0 = await poolContract.token0();
    var poolToken1 = await poolContract.token1();

    var op_tokenA;
    var op_tokenA_amount;
    var op_tokenB;
    var op_tokenB_amount;
    var op_tokenA_decimals;
    var op_tokenB_decimals;

    if (poolToken0.toString().toLowerCase() == token1Addr.toLowerCase() &&
        poolToken1.toString().toLowerCase() == token2Addr.toLowerCase()) {
            op_tokenA = token1Addr;
            op_tokenB = token2Addr;
            op_tokenA_amount = tokenReserve1;
            op_tokenB_amount = tokenReserve2;
            op_tokenA_decimals = token1.decimals;
            op_tokenB_decimals = token2.decimals;
    } else if (poolToken0.toString().toLowerCase() == token2Addr.toLowerCase() &&
        poolToken1.toString().toLowerCase() == token1Addr.toLowerCase()) {
            op_tokenA = token2Addr;
            op_tokenB = token1Addr;
            op_tokenA_amount = tokenReserve2;
            op_tokenB_amount = tokenReserve1;
            op_tokenA_decimals = token2.decimals;
            op_tokenB_decimals = token1.decimals;
    } else {
        console.log("Token addresses don't match pool token0 / token1 values");
        return;
    }

    console.log(`Pool token0: ${poolToken0} (), token1: ${poolToken1}`);
    console.log(`Token 1 decimals: ${token1.decimals}, Token 2 decimals: ${token2.decimals}`);
    console.log(`op_tokenA = ${op_tokenA}, op_tokenA_amount = ${op_tokenA_amount}`);
    console.log(`op_tokenB = ${op_tokenB}, op_tokenB_amount = ${op_tokenB_amount}`);

    await approveToken(token1.contract, nonFungiblePositionManager, token1.symbol, tokenReserve1);
    await approveToken(token2.contract, nonFungiblePositionManager, token2.symbol, tokenReserve2);

    // Initialize pool before using it.
    const qa = new BigNumber(op_tokenA_amount);
    const qb = new BigNumber(op_tokenB_amount);
    let price = qa / qb;

    await executeInitializePool(poolContract, price, Number(op_tokenA_decimals), Number(op_tokenB_decimals));

    const positionManager = new ethers.Contract(
        nonFungiblePositionManager,
        nonFungiblePositionManagerAbi,
        provider,
    );
    const positionManagerContract = positionManager.connect(wallet);

    const tickLower = -887220;  // Min tick
    const tickUpper = 887220;   // Max tick

    // Mint the position
    for (let i = 10; i >= 0; i--) {
        try {
            console.log('Adding liquidity to Uniswap V3 pool ...');
            const tx = await positionManagerContract.mint({
                token0: op_tokenA,
                token1: op_tokenB,
                fee: feeLevel,  // 0.05% fee tier
                tickLower: tickLower,
                tickUpper: tickUpper,
                amount0Desired: op_tokenA_amount,
                amount1Desired: op_tokenB_amount,
                amount0Min: 0,
                amount1Min: 0,
                recipient: config.WALLET_ADDRESS,
                deadline: Math.floor(Date.now() / 1000) + 3600,  // 1 hour deadline
            });
            const receipt = await tx.wait();
            console.log(`Liquidity successfully added to UniswapV3 pool ! Transaction hash: ${receipt.hash}`);
            break;
        } catch (e) {
            if (i === 0) {
                console.error(`Failed to add liquidity to pool`);
                throw e;
            }
            console.warn(`Retrying pool liquidity addition ...`);
        }
    }
}

exports.createPool = createPool;
exports.InitializePool = InitializePool;
