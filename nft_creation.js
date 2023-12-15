const {
    Client,
    TokenCreateTransaction,
    TokenType,
    TokenSupplyType,
    TokenInfoQuery,
    AccountBalanceQuery,
    PrivateKey,
    TokenMintTransaction,
} = require("@hashgraph/sdk");
require('dotenv').config();

//Grab your Hedera testnet account ID and private key from your .env file
const myAccountId = process.env.MY_ACCOUNT_ID;
const myPrivateKey = PrivateKey.fromStringDer(process.env.MY_PRIVATE_KEY); //const myPrivateKey = process.env.MY_PRIVATE_KEY;

// If we weren't able to grab it, we should throw a new error
if (!myAccountId || !myPrivateKey) {
    throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
}

//Create your Hedera Testnet client
const client = Client.forTestnet();

//Set your account as the client's operator
client.setOperator(myAccountId, myPrivateKey);

async function createNFT() {
    console.log("CreateNFT-------");
    let tokenCreateTx = await new TokenCreateTransaction()
            .setTokenName("MyNFT")
            .setTokenSymbol("MNFT")
            .setTokenType(TokenType.NonFungibleUnique)
            .setInitialSupply(0)
            .setTreasuryAccountId(myAccountId)
            .setSupplyType(TokenSupplyType.Finite)
            .setMaxSupply(4)
            .setSupplyKey(myPrivateKey)
            .setFreezeKey(myPrivateKey)
            .setPauseKey(myPrivateKey)
            .setAdminKey(myPrivateKey)
            .setWipeKey(myPrivateKey)
            .freezeWith(client);
    let tokenCreateSign = await tokenCreateTx.sign(myPrivateKey);
    let tokenCreateSubmit = await tokenCreateSign.execute(client);
    let tokenCreateRx = await tokenCreateSubmit.getReceipt(client);
    let tokenId = tokenCreateRx.tokenId;
    console.log(`Created token with ID: ${tokenId}`);
    console.log("----------------------------------");
    return tokenId;
}

async function queryTokenInfo(tokenId) {
    console.log("QueryTokenInfo----------------");
    const query = new TokenInfoQuery().setTokenId(tokenId);
    const tokenInfo = await query.execute(client);
    console.log(JSON.stringify(tokenInfo, null, 4));
    console.log("---------------------");
}

async function queryAccountBalance(accountId) {
    console.log("QueryAccountBalance-------------");
    const balanceQuery = new AccountBalanceQuery().setAccountId(accountId);
    const accountBalance = await balanceQuery.execute(client);
    console.log(JSON.stringify(accountBalance, null, 4));
    console.log("----------------------");
}

async function mintNFT(tokenId) {
    console.log("MintNFT---------------------------");
    //mint new NFT
    let mintTx = await new TokenMintTransaction()
            .setTokenId(tokenId)
            .setMetadata([
                Buffer.from("ipfs://QmTzWcVfk88JRqjTpVwHzBeULRTNzHY7mnBSG42CpwHmPa"),
                Buffer.from("mannou"),
                Buffer.from("thirdToken"),
                Buffer.from("fourthToken"),
            ])
            .execute(client);
    let mintRx = await mintTx.getReceipt(client);
    //log the serial number
    console.log(`Created NFT ${tokenId} with serial: ${mintRx.serials}`);
    console.log("--------------------");
}

async function main() {
    const tokenId = await createNFT();
    await queryTokenInfo(tokenId);
    await queryAccountBalance(myAccountId);
    await mintNFT(tokenId);
    await queryAccountBalance(myAccountId)
}

main();