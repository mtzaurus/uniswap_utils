# Prerequisites

In order to start using utilities from this repository to manage Uniswap pools,
extra software components must be installed.

## Node.JS

Node.JS interpreter and npm/npx utilities must be installed and accessible
via PATH environment. Check accessibility of the binaries using the following
shell commands (actual software versions may differ).

```console
% node --version
v21.7.1
% npm --version
10.5.0
npx --version
10.5.0
```

## Node packages

Install required Node packages:

```console
% npm install --save-dev hardhat ethers readline-sync
```

In order to start using utilities from this repository, the following Node.JS

# Token smart contracts

Token smart contracts are stored inside ./contracts directory. It contains a sample
contract for a test ERC20 token which has 100 bln tokens in supply upon creation.

# Token creation/deployment

ERC20 token is created by deploying a smart contract for the token. It's important
to note that upon token creation all available token supply is transferred to the wallet
used for token deployment, i.e. such a wallet is the initial owner of the token.
Tokens can later be transferred from such a wallet to other wallets, if required.

To simplify interaction with smart contracts, the Hardhat package is used (consult online
documentation for details: https://hardhat.org/tutorial).

## Token deployment

Smart contracts for tokens get deployed using Hardhat Ignition, a declarative JS framework
(consult online documentation for details: https://hardhat.org/ignition/docs/getting-started).

Token deployment scenarios are located inside ignition/modules folder: there is an example
deployment module ignition/modules/USDT.js which deploys a test USDT token.

### Local Ethereum testnet

In order to test contract deployment, it's recommend to try deploying contract on local
Ethereum test network first:

1. Start local Ethereum in-memory single-node test network.

```console
% npx hardhat node
```

2. Deploy target token contract on local Ethereum network.
In this example we deploy existing test contract for our test USDT token.
Once deployment finishes, token address will be displayed on the screen

```console
% npx hardhat ignition deploy ./ignition/modules/USDT.js

...
USDT#TestToken - 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### Sepolia test network

In order to deploy target token contract on Sepolia test network, modify config.js
to configure WALLET_ADDRESS and WALLET_PRIVATE_KEY to be used for interation with
Sepolia testnet. Make sure you have enough Sepolia ETH in your wallet to deploy
smart contracts (0.5 ETH should be enough). Once deployment finishes, token address
will be displayed on the screen.

```console
% npx hardhat ignition deploy ./ignition/modules/USDT.js --network sepolia

...
USDT#TestToken - 0x876B76d55BB5DdCbD1c65352BFB4d503a62e1f96
```

To use other test networks/mainnet for token deployments, please consult Hardhat Ignition
documentation: https://hardhat.org/tutorial/deploying-to-a-live-network#deploying-to-remote-networks

# UniswapV2 pool management

Test tokens can be used for creating UniswapV2 pools, which can then be used for testing swap
operations.
UniswapV2 pools are managed via ./utils/pool_manager.js utility:

```console
% node utils/pool_manager.js
```

