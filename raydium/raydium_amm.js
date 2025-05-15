import {
    createInitializeMintInstruction,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    MINT_SIZE,
    ACCOUNT_SIZE,
    getMinimumBalanceForRentExemptMint,
    createAssociatedTokenAccountInstruction,
    getMinimumBalanceForRentExemptAccount,
    getAssociatedTokenAddressSync,
    createInitializeAccountInstruction,
    createInitializeMetadataPointerInstruction,
    createMintToInstruction,
    getMint,
    getMetadataPointerState,
    getTokenMetadata,
    NATIVE_MINT,
} from "@solana/spl-token";
import {
    MARKET_STATE_LAYOUT_V3,
    AMM_V4,
    OPEN_BOOK_PROGRAM,
    FEE_DESTINATION_ID,
    DEVNET_PROGRAM_ID,
    TokenAmount,
    toToken,
    Percent,
} from '@raydium-io/raydium-sdk-v2'
import { initSdk, txVersion } from './config.js'
import BN from 'bn.js'
import Decimal from 'decimal.js'
import {
    Connection,
    Keypair,
    sendAndConfirmTransaction,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL,
    PublicKey
} from "@solana/web3.js";
import bs58 from 'bs58'
import { isValidAmm } from './utils.js';
import {
	createV1,
	findMetadataPda,
	mplTokenMetadata,
    TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import { generateSigner, signerIdentity, sol, keypairIdentity, percentAmount } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { base58 } from "@metaplex-foundation/umi/serializers";


export const createPool = async () => {
    const raydium = await initSdk()

    const marketId = new PublicKey(`A2wdXZqoiStVvJ3Jc4R7awvrYLxRJeW8RimVa8y5NBxe`)

    // if you are confirmed your market info, don't have to get market info from rpc below
    const marketBufferInfo = await raydium.connection.getAccountInfo(new PublicKey(marketId))
    const { baseMint, quoteMint } = MARKET_STATE_LAYOUT_V3.decode(marketBufferInfo.data)

    // check mint info here: https://api-v3.raydium.io/mint/list
    // or get mint info by api: await raydium.token.getTokenInfo('mint address')

    // amm pool doesn't support token 2022
    const baseMintInfo = await raydium.token.getTokenInfo(baseMint)
    const quoteMintInfo = await raydium.token.getTokenInfo(quoteMint)
    const baseAmount = new BN(2_000000_000000)
    const quoteAmount = new BN(4_000000_000000000)

    if (
        baseMintInfo.programId !== TOKEN_PROGRAM_ID.toBase58() ||
        quoteMintInfo.programId !== TOKEN_PROGRAM_ID.toBase58()
    ) {
        throw new Error(
            'amm pools with openbook market only support TOKEN_PROGRAM_ID mints, if you want to create pool with token-2022, please create cpmm pool instead'
        )
    }

    if (baseAmount.mul(quoteAmount).lte(new BN(1).mul(new BN(10 ** baseMintInfo.decimals)).pow(new BN(2)))) {
        throw new Error('initial liquidity too low, try adding more baseAmount/quoteAmount')
    }

    const { execute, extInfo } = await raydium.liquidity.createPoolV4({
        // programId: AMM_V4,
        programId: DEVNET_PROGRAM_ID.AmmV4, // devnet
        marketInfo: {
            marketId,
            //   programId: OPEN_BOOK_PROGRAM,
            programId: DEVNET_PROGRAM_ID.OPENBOOK_MARKET, // devent
        },
        baseMintInfo: {
            mint: baseMint,
            decimals: baseMintInfo.decimals, // if you know mint decimals here, can pass number directly
        },
        quoteMintInfo: {
            mint: quoteMint,
            decimals: quoteMintInfo.decimals, // if you know mint decimals here, can pass number directly
        },
        baseAmount: baseAmount,
        quoteAmount: quoteAmount,

        // sol devnet faucet: https://faucet.solana.com/
        // baseAmount: new BN(4 * 10 ** 9), // if devent pool with sol/wsol, better use amount >= 4*10**9
        // quoteAmount: new BN(4 * 10 ** 9), // if devent pool with sol/wsol, better use amount >= 4*10**9

        startTime: new BN(0), // unit in seconds
        ownerInfo: {
            useSOLBalance: true,
        },
        associatedOnly: false,
        txVersion,
        // feeDestinationId: FEE_DESTINATION_ID,
        feeDestinationId: DEVNET_PROGRAM_ID.FEE_DESTINATION_ID, // devnet
        // optional: set up priority fee here
        // computeBudgetConfig: {
        //   units: 600000,
        //   microLamports: 4659150,
        // },
    })

    // don't want to wait confirm, set sendAndConfirm to false or don't pass any params to execute
    const { txId } = await execute({ sendAndConfirm: true })
    console.log(
        'amm pool created! txId: ',
        txId,
        ', poolKeys:',
        Object.keys(extInfo.address).reduce(
            (acc, cur) => ({
                ...acc,
                [cur]: extInfo.address[cur].toBase58(),
            }),
            {}
        )
    )
}

export const createMarket = async () => {
    const raydium = await initSdk()

    // check mint info here: https://api-v3.raydium.io/mint/list
    // or get mint info by api: await raydium.token.getTokenInfo('mint address')

    let baseMint = new PublicKey('6WcCqjSj4xPhWqdQ1bpvZvLESez8ZL49wc7jQNuE9isN');
    let quoteMint = new PublicKey('2NJDyBgescMP4Kr14Li2TcSbaMTsxRDeQkqkMisDMaUs');

    const { execute, extInfo, transactions } = await raydium.marketV2.create({
        baseInfo: {
            // create market doesn't support token 2022
            mint: baseMint,
            decimals: 6,
        },
        quoteInfo: {
            // create market doesn't support token 2022
            mint: quoteMint,
            decimals: 9,
        },
        lotSize: 1,
        tickSize: 0.01,
        // dexProgramId: OPEN_BOOK_PROGRAM,
        dexProgramId: DEVNET_PROGRAM_ID.OPENBOOK_MARKET, // devnet

        // requestQueueSpace: 5120 + 12, // optional
        // eventQueueSpace: 262144 + 12, // optional
        // orderbookQueueSpace: 65536 + 12, // optional

        txVersion,
        // optional: set up priority fee here
        // computeBudgetConfig: {
        //   units: 600000,
        //   microLamports: 46591500,
        // },
    })

    console.log(
        `create market total ${transactions.length} txs, market info: `,
        Object.keys(extInfo.address).reduce(
            (acc, cur) => ({
                ...acc,
                [cur]: extInfo.address[cur].toBase58(),
            }),
            {}
        )
    )

    const txIds = await execute({
        // set sequentially to true means tx will be sent when previous one confirmed
        sequentially: true,
    })

    console.log(
        'note: create market does not support token 2022, if you need more detail error info, set txVersion to TxVersion.LEGACY'
    )
    console.log('create market txIds:', txIds)
}

export const createMint = async () => {
    // Create connection to local validator
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const recentBlockhash = await connection.getLatestBlockhash();

    // Generate a new keypair for the fee payer
    const feePayer = Keypair.fromSecretKey(bs58.decode(''))

    // Airdrop 1 SOL to fee payer
    const airdropSignature = await connection.requestAirdrop(
        feePayer.publicKey,
        LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction({
        blockhash: recentBlockhash.blockhash,
        lastValidBlockHeight: recentBlockhash.lastValidBlockHeight,
        signature: airdropSignature
    });

    // Generate keypair to use as address of mint
    const mint = Keypair.generate();

    const createAccountInstruction = SystemProgram.createAccount({
        fromPubkey: feePayer.publicKey,
        newAccountPubkey: mint.publicKey,
        space: MINT_SIZE,
        lamports: await getMinimumBalanceForRentExemptMint(connection),
        programId: TOKEN_PROGRAM_ID
    });

    const initializeMintInstruction = createInitializeMintInstruction(
        mint.publicKey, // mint pubkey
        9, // decimals
        feePayer.publicKey, // mint authority
        feePayer.publicKey, // freeze authority
        TOKEN_PROGRAM_ID
    );

    const transaction = new Transaction().add(
        createAccountInstruction,
        initializeMintInstruction
    );

    const transactionSignature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [feePayer, mint] // Signers
    );

    console.log("Mint Address: ", mint.publicKey.toBase58());
    console.log("Transaction Signature: ", transactionSignature);
}

export const addLiquidity = async () => {
    const raydium = await initSdk()

    const poolId = '4TApqMwAWboc22RQQQRtEdnZk5BobcuFSRDMhuc6hbm1'
    let poolKeys
    let poolInfo

    if (raydium.cluster === 'mainnet') {
        // note: api doesn't support get devnet pool info, so in devnet else we go rpc method
        // if you wish to get pool info from rpc, also can modify logic to go rpc method directly
        const data = await raydium.api.fetchPoolById({ ids: poolId })
        poolInfo = data[0]
    } else {
        // note: getPoolInfoFromRpc method only return required pool data for computing not all detail pool info
        const data = await raydium.liquidity.getPoolInfoFromRpc({ poolId })
        poolInfo = data.poolInfo
        poolKeys = data.poolKeys
    }

    if (!isValidAmm(poolInfo.programId)) throw new Error('target pool is not AMM pool')

    const inputAmount = '1'

    const r = raydium.liquidity.computePairAmount({
        poolInfo,
        amount: inputAmount,
        baseIn: true,
        slippage: new Percent(1, 100), // 1%
    })

    const { execute, transaction } = await raydium.liquidity.addLiquidity({
        poolInfo,
        poolKeys,
        amountInA: new TokenAmount(
            toToken(poolInfo.mintA),
            new Decimal(inputAmount).mul(10 ** poolInfo.mintA.decimals).toFixed(0)
        ),
        amountInB: new TokenAmount(
            toToken(poolInfo.mintB),
            new Decimal(r.maxAnotherAmount.toExact()).mul(10 ** poolInfo.mintB.decimals).toFixed(0)
        ),
        otherAmountMin: r.minAnotherAmount,
        fixedSide: 'a',
        txVersion,
        // optional: set up priority fee here
        // computeBudgetConfig: {
        //   units: 600000,
        //   microLamports: 46591500,
        // },

        // optional: add transfer sol to tip account instruction. e.g sent tip to jito
        // txTipConfig: {
        //   address: new PublicKey('96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5'),
        //   amount: new BN(10000000), // 0.01 sol
        // },
    })

    // don't want to wait confirm, set sendAndConfirm to false or don't pass any params to execute
    const { txId } = await execute({ sendAndConfirm: true })
    console.log('liquidity added:', { txId: `https://explorer.solana.com/tx/${txId}` })
}

export const fetchRpcPoolInfo = async () => {
    const raydium = await initSdk()

    const pool1 = '4TApqMwAWboc22RQQQRtEdnZk5BobcuFSRDMhuc6hbm1'

    const res = await raydium.liquidity.getRpcPoolInfos([pool1])

    console.log('amm pool infos:', res)
}

export const swap = async () => {
    const raydium = await initSdk();
    const amountIn = 100_000000;
    const inputMint = '6WcCqjSj4xPhWqdQ1bpvZvLESez8ZL49wc7jQNuE9isN';
    const poolId = '4TApqMwAWboc22RQQQRtEdnZk5BobcuFSRDMhuc6hbm1';

    let poolInfo;
    let poolKeys;
    let rpcData;

    if (raydium.cluster === 'mainnet') {
        // note: api doesn't support get devnet pool info, so in devnet else we go rpc method
        // if you wish to get pool info from rpc, also can modify logic to go rpc method directly
        const data = await raydium.api.fetchPoolById({ ids: poolId })
        poolInfo = data[0]
        if (!isValidAmm(poolInfo.programId)) throw new Error('target pool is not AMM pool')
        poolKeys = await raydium.liquidity.getAmmPoolKeys(poolId)
        rpcData = await raydium.liquidity.getRpcPoolInfo(poolId)
    } else {
        // note: getPoolInfoFromRpc method only return required pool data for computing not all detail pool info
        const data = await raydium.liquidity.getPoolInfoFromRpc({ poolId })
        poolInfo = data.poolInfo
        poolKeys = data.poolKeys
        rpcData = data.poolRpcData
    }
    const [baseReserve, quoteReserve, status] = [rpcData.baseReserve, rpcData.quoteReserve, rpcData.status.toNumber()]

    if (poolInfo.mintA.address !== inputMint && poolInfo.mintB.address !== inputMint)
        throw new Error('input mint does not match pool')

    const baseIn = inputMint === poolInfo.mintA.address
    const [mintIn, mintOut] = baseIn ? [poolInfo.mintA, poolInfo.mintB] : [poolInfo.mintB, poolInfo.mintA]

    const out = raydium.liquidity.computeAmountOut({
        poolInfo: {
            ...poolInfo,
            baseReserve,
            quoteReserve,
            status,
            version: 4,
        },
        amountIn: new BN(amountIn),
        mintIn: mintIn.address,
        mintOut: mintOut.address,
        slippage: 0.01, // range: 1 ~ 0.0001, means 100% ~ 0.01%
    })

    console.log(
        `computed swap ${new Decimal(amountIn)
            .div(10 ** mintIn.decimals)
            .toDecimalPlaces(mintIn.decimals)
            .toString()} ${mintIn.symbol || mintIn.address} to ${new Decimal(out.amountOut.toString())
                .div(10 ** mintOut.decimals)
                .toDecimalPlaces(mintOut.decimals)
                .toString()} ${mintOut.symbol || mintOut.address}, minimum amount out ${new Decimal(out.minAmountOut.toString())
                    .div(10 ** mintOut.decimals)
                    .toDecimalPlaces(mintOut.decimals)} ${mintOut.symbol || mintOut.address}`
    )

    console.log(poolKeys);

    // const { execute } = await raydium.liquidity.swap({
    const swapObj = await raydium.liquidity.swap({
        poolInfo,
        poolKeys,
        amountIn: new BN(amountIn),
        amountOut: out.minAmountOut, // out.amountOut means amount 'without' slippage
        fixedSide: 'in',
        inputMint: mintIn.address,
        txVersion,

        // optional: set up token account
        // config: {
        //   inputUseSolBalance: true, // default: true, if you want to use existed wsol token account to pay token in, pass false
        //   outputUseSolBalance: true, // default: true, if you want to use existed wsol token account to receive token out, pass false
        //   associatedOnly: true, // default: true, if you want to use ata only, pass true
        // },

        // optional: set up priority fee here
        // computeBudgetConfig: {
        //   units: 600000,
        //   microLamports: 1000000,
        // },

        // optional: add transfer sol to tip account instruction. e.g sent tip to jito
        // txTipConfig: {
        //   address: new PublicKey('96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5'),
        //   amount: new BN(10000000), // 0.01 sol
        // },
    })

    // console.log(swapObj.transaction);

    // console.log(await raydium.connection.simulateTransaction(swapObj.transaction));
    // console.log(await raydium.connection.getFeeForMessage(swapObj.transaction.message));
    printSimulateInfo()
    // return;
    // don't want to wait confirm, set sendAndConfirm to false or don't pass any params to execute
    const { txId } = await swapObj.execute({ sendAndConfirm: true })
    console.log(`swap successfully in amm pool:`, { txId: `https://explorer.solana.com/tx/${txId}` })
}

export const createAssociatedTokenAccount = async () => {
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const recentBlockhash = await connection.getLatestBlockhash();

    // Generate a new keypair for the fee payer
    const feePayer = Keypair.fromSecretKey(bs58.decode(''));

    const mintPublicKey = new PublicKey("6WcCqjSj4xPhWqdQ1bpvZvLESez8ZL49wc7jQNuE9isN");

    const associatedTokenAccount = getAssociatedTokenAddressSync(
        mintPublicKey,
        feePayer.publicKey,
        false, // allowOwnerOffCurve
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
    );

    // Create associated token account instruction
    const createAssociatedTokenAccountIx = createAssociatedTokenAccountInstruction(
        feePayer.publicKey, // payer
        associatedTokenAccount, // associated token account address
        feePayer.publicKey, // owner
        mintPublicKey, // mint
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
    );

    // Create and sign transaction with ATA creation
    const transaction = new Transaction({
        feePayer: feePayer.publicKey,
        blockhash: recentBlockhash.blockhash,
        lastValidBlockHeight: recentBlockhash.lastValidBlockHeight
    }).add(
        createAssociatedTokenAccountIx
    );

    // Sign transaction
    const transactionSignature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [feePayer]
    );

    console.log("Mint Address:", mintPublicKey.toBase58());
    console.log(
        "Associated Token Account Address:",
        associatedTokenAccount.toBase58()
    );
    console.log("Transaction Signature:", transactionSignature);
}

export const createTokenAccount = async () => {
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const recentBlockhash = await connection.getLatestBlockhash();

    // Generate a new keypair for the fee payer
    const feePayer = Keypair.fromSecretKey(bs58.decode(''));

    const mintPublicKey = new PublicKey("2NJDyBgescMP4Kr14Li2TcSbaMTsxRDeQkqkMisDMaUs");

    // Generate keypair to use as address of token account
    const tokenAccount = Keypair.generate();

    // Get minimum balance for rent exemption for token account
    const tokenAccountRent =
        await getMinimumBalanceForRentExemptAccount(connection);

    // Create token account instruction
    const createTokenAccountInstruction = SystemProgram.createAccount({
        fromPubkey: feePayer.publicKey,
        newAccountPubkey: tokenAccount.publicKey,
        space: ACCOUNT_SIZE,
        lamports: tokenAccountRent,
        programId: TOKEN_PROGRAM_ID
    });

    // Initialize token account instruction
    const initializeTokenAccountInstruction = createInitializeAccountInstruction(
        tokenAccount.publicKey, // token account
        mintPublicKey, // mint
        feePayer.publicKey, // owner
        TOKEN_PROGRAM_ID
    );

    // Create and sign transaction for token account
    let tokenAccountTransaction = new Transaction({
        feePayer: feePayer.publicKey,
        blockhash: recentBlockhash.blockhash,
        lastValidBlockHeight: recentBlockhash.lastValidBlockHeight
    }).add(createTokenAccountInstruction, initializeTokenAccountInstruction);

    // Sign and send transaction
    const tokenAccountTxSignature = await sendAndConfirmTransaction(
        connection,
        tokenAccountTransaction,
        [feePayer, tokenAccount]
    );

    console.log("Token Account Address:", tokenAccount.publicKey.toBase58());
    console.log("Transaction Signature:", tokenAccountTxSignature);
}

export const mintToTokenAccount = async () => {
    // Create connection to local validator
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");

    // Generate a new keypair for the fee payer
    const feePayer = Keypair.fromSecretKey(bs58.decode(''))

    // Generate keypair to use as address of mint
    const mintPublicKey = new PublicKey("2NJDyBgescMP4Kr14Li2TcSbaMTsxRDeQkqkMisDMaUs");

    // Get the associated token account address
    const associatedTokenAccount = getAssociatedTokenAddressSync(
        mintPublicKey,
        feePayer.publicKey,
        false, // allowOwnerOffCurve
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
    );

    // Create a separate transaction for minting tokens
    // Create mint to instruction (mint 100 tokens = 1.00 with 2 decimals)
    const mintAmount = 1_0000000_000000000;
    const mintToInstruction = createMintToInstruction(
        mintPublicKey, // mint
        associatedTokenAccount, // destination
        feePayer.publicKey, // authority
        mintAmount, // amount
        [], // multiSigners
        TOKEN_PROGRAM_ID // programId
    );

    // Get a new blockhash for the mint transaction
    const mintBlockhash = await connection.getLatestBlockhash();

    // Create and sign transaction for minting tokens
    const mintTransaction = new Transaction({
        feePayer: feePayer.publicKey,
        blockhash: mintBlockhash.blockhash,
        lastValidBlockHeight: mintBlockhash.lastValidBlockHeight
    }).add(mintToInstruction);

    // Sign and send mint transaction
    const mintTransactionSignature = await sendAndConfirmTransaction(
        connection,
        mintTransaction,
        [feePayer]
    );

    console.log("Transaction Signature:", mintTransactionSignature);
}

export const addMetadata = async () => {
    // Create connection to local validator
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");

    // Generate a new keypair for the fee payer
    const feePayer = Keypair.fromSecretKey(bs58.decode(''))

    // Generate keypair to use as address of mint
    const mint = new PublicKey("2NJDyBgescMP4Kr14Li2TcSbaMTsxRDeQkqkMisDMaUs");
    
    const umi = createUmi("https://api.devnet.solana.com")
        .use(mplTokenMetadata())
        .use(mplToolbox());

    let keypair = umi.eddsa.createKeypairFromSecretKey(bs58.decode(''));

    umi.use(keypairIdentity(keypair));

    const tokenMetadata = {
        name: "GRWT",
        symbol: "GRWT",
        uri: "",
    };

    // derive the metadata account that will store our metadata data onchain
	const metadataAccountAddress = await findMetadataPda(umi, {
		mint: mint,
	});

    const tx = await createV1(umi, {
		mint,
		authority: umi.identity,
		payer: umi.identity,
		updateAuthority: umi.identity,
		name: tokenMetadata.name,
		symbol: tokenMetadata.symbol,
		uri: tokenMetadata.uri,
		sellerFeeBasisPoints: percentAmount(5.5), // 5.5%
		tokenStandard: TokenStandard.Fungible,
	}).sendAndConfirm(umi);

	let txSig = base58.deserialize(tx.signature);
	console.log(`https://explorer.solana.com/tx/${txSig[0]}?cluster=devnet`);
}

export const printSimulateInfo = () => {
    console.log(
        'you can paste simulate tx string here: https://explorer.solana.com/tx/inspector and click simulate to check transaction status'
    )
    console.log(
        'if tx simulate successful but did not went through successfully after running execute(xxx), usually means your txs were expired, try set up higher priority fees'
    )
    console.log('strongly suggest use paid rpcs would get you better performance')
}