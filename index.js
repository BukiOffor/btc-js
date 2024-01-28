const bitcoin = require('bitcoinjs-lib');
const {ECPairFactory} = require("ecpair");
const ecc = require("tiny-secp256k1");
const bip39 = require("bip39");
const HDKey = require("hdkey");
const CoinKey = require("coinkey");
const ethers = require("ethers");
const eu = require('ethereumjs-util')




//const seed = bip39.generateMnemonic();
const seed_phrase = "monster biology normal element armor subject misery coyote run basket pony grow"

const TESTNET = bitcoin.networks.testnet;
const ECPair = ECPairFactory(ecc);


async function btc_addr(mnemonic){    
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
    console.log(info)
    return info
}


async function eth_addr(mnemonic){
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
    console.log(info)
    return info


}






async function main(mnemonic){
    //await btc_addr(mnemonic)
    let buffer = await eth_addr(mnemonic);

}

main(seed_phrase).then(()=>{

})
.catch(err => {
    console.log(err)
})