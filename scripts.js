const bitcoin = require('bitcoinjs-lib');
const {ECPairFactory} = require("ecpair");
const ecc = require("tiny-secp256k1");
const bip39 = require("bip39");
const HDKey = require("hdkey");
const CoinKey = require("coinkey");
var StellarSdk = require('@stellar/stellar-sdk');
const axios = require('axios');
const {ethers} = require("ethers");
const bitcore = require("bitcore-lib");




//const seed = bip39.generateMnemonic(256); // 24 words seed
const seed_phrase = "monster biology normal element armor subject misery coyote run basket pony grow"

const TESTNET = bitcoin.networks.testnet;
const ECPair = ECPairFactory(ecc);

function validate_mnemonic(mnemonic){
   return bip39.validateMnemonic(mnemonic)
}

function generate_mnemonic(rng=null){
    let mnemonic = bip39.generateMnemonic(rng)
    const valid = validate_mnemonic(mnemonic);
   return valid? mnemonic : null
}


let chains = {
    0 : {
        "rpc": "https://go.getblock.io/13da34445b75410990d6396a19e172dc",
        "name": "bitcoin"
    },
    60 : {
        "rpc": "https://eth-goerli.g.alchemy.com/v2/JUd33W6MxjKFCz0rLRrFrsCTpdsXLPZk",
        "name": "ethereum"
    },
    148: {
        "rpc": "",
        "name": "stellar"
    }
}

/// This function takes the chain id of the blockchain 
/// and the address of the user whose balance is being fetched.
/// it returns the balance in a string format
async function getBalance(chain,address){

    if (chain == 0 ) {
        try{

            const response = await axios.get(`https://blockchain.info/balance?active=${address}`);
            console.log(response)
            const balance = response.data[address].final_balance / 100000000;
            return balance.toString()
            
        } catch (error) {
                return null
            }
    }else if (chain == 60) {
        try{
            const provider = new ethers.JsonRpcProvider(chains[60].rpc);
            const balance_in_wei = await provider.getBalance(address);
            const balance = ethers.parseEther(balance_in_wei.toString());
            return balance.toString()
        } catch (error){
            return null
        }
    }else if (chain == 148) {
        return 0
    }
        
    return null
    
}



async function create_wallet(chain, seed){
    if (chain == 0 ) {
        const info = await bitcoin_wallet(seed);
        return info
    }else if (chain == 60) {
        const info = await ethereum(seed);
        return info
    }else if (chain == 148) {
        const info = await stellar(seed);
        return info
    }
}

async function bitcoin_wallet(mnemonic){ 
    if (validate_mnemonic(mnemonic)){
        try {
            const seed = bip39.mnemonicToSeedSync(mnemonic);
            const hdKey = HDKey.fromMasterSeed(Buffer.from(seed, "hex"));
            const path = "m/44'/0'/0'/0/0";
            const child = hdKey.derive(path);
            const coinKey = new CoinKey(child.privateKey, bitcoin.networks.bitcoin);
            const info = {
            address: coinKey.publicAddress,          // Bitcoin public address
            path,                                    // BIP44 path
            privateKey: coinKey.privateKey.toString("hex"), // Private key in hexadecimal
            WIF: coinKey.privateWif,                 // Wallet Import Format (WIF) private key
            }; 

            // Generate a testnet address  
            //const { address } = bitcoin.payments.p2pkh({ pubkey: child.publicKey, network: TESTNET, });
    
            // generate a segwit Address
            //const { address } = bitcoin.payments.p2wpkh({ pubkey: child.publicKey });  
            return info
        }catch (error) {
            return null
        }
    }
    return null  
    
}

async function ethereum(mnemonic){
    if (validate_mnemonic(mnemonic)){
        try{
            const seed = bip39.mnemonicToSeedSync(mnemonic);
            const hdKey = HDKey.fromMasterSeed(Buffer.from(seed, "hex"));
            const path = "m/44'/60'/0'/0/0"
            const child = hdKey.derive(path);
            const address = new ethers.Wallet(`0x${child.privateKey.toString("hex")}`).address
            const info = {
                address,
                path,                                   
                privateKey: `0x${child.privateKey.toString("hex")}`, // Private key in hexadecimal
            };    
            return info
    } catch(error){
        return null
        }
    }
    return null
}

async function stellar(mnemonic){
    if (validate_mnemonic(mnemonic)){
        try{
            const seed = bip39.mnemonicToSeedSync(mnemonic);
            const hdKey = HDKey.fromMasterSeed(Buffer.from(seed, "hex"));
            console.log(hdKey)
            const path = "m/44'/148'/0'/0/0";
            const child = hdKey.derive(path);
            const KeyPair = StellarSdk.Keypair.fromRawEd25519Seed(child.privateKey)
            const privateKey = KeyPair.secret()   
            const info = {address: KeyPair.publicKey(),path,privateKey,}; 
            return info
        } catch (error){
            return null
        }
    }
    return null
}


async function sendTransactionEth(privateKey,amount,toAddress){
    try{
        const provider = new ethers.JsonRpcProvider(chains[60].rpc);
        // Create a wallet from the private key
        const wallet = new ethers.Wallet(privateKey, provider);
        //const wallet = new ethers.Wallet.fromPhrase(privateKey);

        // Validate the toAddress
        if (!ethers.isAddress(toAddress)) {
            throw new Error('Invalid Ethereum address');
        }

        // Convert amount to Wei (1 Ether = 1e18 Wei)
        const amountWei = ethers.parseEther(amount.toString());

        // Create a transaction
        const transaction = {
            to: toAddress,
            value: amountWei,
        };

        // Send the transaction
        const tx = await wallet.sendTransaction(transaction);
        // Wait for the transaction to be mined
        await tx.wait();

        console.log(`Successfully transferred ${amount} Ether to ${toAddress}`);
        return tx;
    }
    catch(error){
        console.log(error)
        return error
    }

}



async function sendBitcoin (privateKey,sourceAddress,recieverAddress, amountToSend, testnet=true) {
  try {
    // const privateKey =
    //   "6756e6564d3c74b857d5800113f35878e5a854f2fce09c780265b94e53b6bc93";
    // const sourceAddress = "mvWqrftxCJa5eSKp229gkZbMf2XXrfZe9p";
    const satoshiToSend = amountToSend * 100000000;
    let fee = 0;
    let inputCount = 0;
    let outputCount = 2;

    const recommendedFee = await axios.get(
      "https://bitcoinfees.earn.com/api/v1/fees/recommended"
    );

    const transaction = new bitcore.Transaction();
    let totalAmountAvailable = 0;

    let inputs = [];
    const resp = await axios({
        method: "GET",
        url: `https://blockstream.info/testnet/api/address/${sourceAddress}/utxo`,
    });
    const utxos = resp.data

    for (const utxo of utxos) {
      let input = {};
      input.satoshis = utxo.value;
      input.script = bitcore.Script.buildPublicKeyHashOut(sourceAddress).toHex();
      input.address = sourceAddress;
      input.txId = utxo.txid;
      input.outputIndex = utxo.vout;
      totalAmountAvailable += utxo.value;
      inputCount += 1;
      inputs.push(input);
    }

    /**
     * In a bitcoin transaction, the inputs contribute 180 bytes each to the transaction,
     * while the output contributes 34 bytes each to the transaction. Then there is an extra 10 bytes you add or subtract
     * from the transaction as well.
     * */

    const transactionSize =
      inputCount * 180 + outputCount * 34 + 10 - inputCount;

    fee = transactionSize * recommendedFee.data.hourFee / 3; // satoshi per byte
    if (testnet) {
      fee = transactionSize * 1 // 1 sat/byte is fine for testnet
    }
    if (totalAmountAvailable - satoshiToSend - fee < 0) {
      throw new Error("Balance is too low for this transaction");
    }
    //Set transaction input
    transaction.from(inputs);

    // set the recieving address and the amount to send
    transaction.to(recieverAddress, satoshiToSend);

    // Set change address - Address to receive the left over funds after transfer
    transaction.change(sourceAddress);

    //manually set transaction fees: 20 satoshis per byte
    transaction.fee(Math.round(fee));

    // Sign transaction with your private key
    transaction.sign(privateKey);

    // serialize Transactions
    const serializedTransaction = transaction.serialize();

    // Send transaction
    const result = await axios({
      method: "POST",
      url: `https://blockstream.info/testnet/api/tx`,
      data: serializedTransaction,
    });
    return result.data;
  } catch (error) {
    return error;
  }
};

module.exports = {
    getBalance,
    create_wallet,
    generate_mnemonic,
    sendTransactionEth,
    sendBitcoin
}



