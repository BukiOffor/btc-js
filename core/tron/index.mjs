import TronWeb from 'tronweb';
import { mnemonicToSeedSync } from 'bip39';
import { fromMasterSeed } from 'hdkey';
import { phrase } from '../key/index.mjs';

const rpc = 'https://nile.trongrid.io';
//const rpc = "https://api.shasta.trongrid.io";

const tronWeb = new TronWeb({
  fullHost: rpc, // Use a suitable provider
});

function getKey(mnemonic) {
  try {
    const seed = mnemonicToSeedSync(mnemonic);
    const hdKey = fromMasterSeed(Buffer.from(seed,'hex'));
    const path = "m/44'/195'/0'/0/0";
    const child = hdKey.derive(path);
    return child.privateKey.toString('hex');
  } catch (error) {
    return null;
  }
}

//TBk9Qzm8nKL2XWLvxftoe4tB91hjtkv43s
async function sendTransaction(toAddress, amount) {
  const privateKey = getKey(phrase);
  const sourceAddress = await tronWeb.address.fromPrivateKey(privateKey);
  const transaction = await tronWeb.transactionBuilder.sendTrx(
    toAddress,
    amount * 1e6, // TRX amount in SUN (1 TRX = 1,000,000 SUN)
    sourceAddress,
  );
  const signedTransaction = await tronWeb.trx.sign(transaction, privateKey);
  const receipt = await tronWeb.trx.sendRawTransaction(signedTransaction);
  console.log('Transaction ID:', receipt.txid);
}

sendTransaction('TSjKAVkh4GFewm6c3G4ATj5Hkr8GE7GJB8', '0.00001')
  .then()
  .catch((err) => {
    console.log(err);
  });

// https://developers.tron.network/v4.4.0/reference/address

// https://tronweb.network/docu/docs/API%20List/utils/address
