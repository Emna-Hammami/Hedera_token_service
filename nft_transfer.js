const {
    Client,
    PrivateKey,
    TransferTransaction,
    TokenNftInfoQuery,
    TokenAssociateTransaction,
    TokenId,
    NftId,
} = require ("@hashgraph/sdk");
require("dotenv").config();

//Grab your Hedera testnet  account ID and private key from your .env file
const myAccountId = process.env.MY_ACCOUNT_ID;
const myPrivateKey = PrivateKey.fromStringDer(process.env.MY_PRIVATE_KEY);
const secondAccountId = process.env.SECOND_ACCOUNT_ID;
const secondPrivateKey = PrivateKey.fromStringDer(process.env.SECOND_PRIVATE_KEY);

//Create your Hedera Testnet client
const client = Client.forTestnet();

//Set your account as the client's operator
client.setOperator(myAccountId, myPrivateKey);

async function transferNFT(senderId, receiverId, nftId) {
    let tokenTransferTx = await new TransferTransaction()
            .addNftTransfer(nftId.tokenId, nftId.serial, senderId, receiverId)
            .execute(client);
    let tokenTransferRx = await tokenTransferTx.getReceipt(client);
    console.log(`NFT transfer: ${tokenTransferRx.status.toString()}`);
    console.log("--------------------");
}

async function nftInfoQuery(nftId) {
    console.log("NftInfoQuery-------------");
    const nftInfo = await new TokenNftInfoQuery().setNftId(nftId).execute(client);////Returns the info for the specified NFT ID
    console.log(JSON.stringify(nftInfo, null, 4));
    console.log("------------------");
}

async function associateToken(tokenId, accountId, accountPrivateKey) {
    console.log("AssociateToken-------------");
    let associateTokenTx = await new TokenAssociateTransaction()
            .setAccountId(accountId)
            .setTokenIds([tokenId])
            .freezeWith(client);
    let associationSign = await associateTokenTx.sign(accountPrivateKey);
    let associationSubmit = await associationSign.execute(client);
    let receipt = await associationSubmit.getReceipt(client);
    console.log("Associate Token: ", receipt.status.toString());
    console.log("-----------");
}

async function main() {
    const tokenId = "0.0.6782943";
    const nftId = new NftId(TokenId.fromString(tokenId), 2);
    console.log(nftId);
    await nftInfoQuery(nftId);
    await associateToken(tokenId, secondAccountId, secondPrivateKey);
    await transferNFT(myAccountId, secondAccountId, nftId);
    await nftInfoQuery(nftId);

}
main();