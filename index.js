const bitcoin = require('bitcoinjs-lib');
const {ECPairFactory} = require("ecpair");
const ecc = require("tiny-secp256k1");
const bip39 = require("bip39");
const HDKey = require("hdkey");
const CoinKey = require("coinkey");
const ethers = require("ethers");
const eu = require('ethereumjs-util');
var StellarSdk = require('@stellar/stellar-sdk');


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
        "rpc": "",
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


async function getBalance(chain,address){

    if(chain == 0 ){
        return 0
    }else if (chain == 60) {
        const provider = new ethers.JsonRpcProvider(chains[60].rpc);
        const balance_in_wei = await provider.getBalance(address);
        const balance = ethers.parseEther(balance_in_wei.toString());
        return balance.toString()
    }else {
        return 0
    }
}


async function create_wallet(chain, seed){
    if(chain == 0 ){
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

async function main(mnemonic){
    console.log(await bitcoin_wallet(mnemonic))
    console.log(await ethereum(mnemonic))
    console.log(await stellar(mnemonic))

}
let seed = generate_mnemonic()
main(seed).then(()=>{
})
.catch(err => {
    console.log(err)
})




