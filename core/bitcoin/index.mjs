import { networks } from 'bitcoinjs-lib';
import { mnemonicToSeedSync } from 'bip39';
import HDkey from 'hdkey';
import CoinKey from 'coinkey';
import axios, { get } from 'axios';
import { Transaction, Script } from 'bitcore-lib';
import { key, validate_mnemonic } from '../key/index.mjs';

const TESTNET = networks.testnet;

/// This function takes the chain id of the blockchain
/// and the address of the user whose balance is being fetched.
/// it returns the balance in a string format
async function getBalance(address) {
  try {
    // MAINNET
    const response = await get(
      `https://blockchain.info/balance?active=${address}`,
    );
    console.log(response);
    const balance = response.data[address].final_balance / 100000000;

    // // TESTNET
    // let url = `https://api.blockcypher.com/v1/btc/test3/addrs/${address}/full?limit=50`
    // const response = await axios.get(url);
    // // console.log(response)
    // const balance = response.data.final_balance / 100000000;

    return balance.toString();
  } catch (error) {
    return null;
  }
}

async function bitcoin_wallet(mnemonic) {
  if (validate_mnemonic(mnemonic)) {
    try {
      const seed = mnemonicToSeedSync(mnemonic);
      const hdKey = HDkey.fromMasterSeed(Buffer.from(seed, 'hex'));
      const path = "m/44'/0'/0'/0/0";
      const child = hdKey.derive(path);
      const coinKey = new CoinKey(child.privateKey, networks.bitcoin);

      //MainNet Account

      const info = {
        address: coinKey.publicAddress, // Bitcoin public address
        path, // BIP44 path
        privateKey: coinKey.privateKey.toString('hex'), // Private key in hexadecimal
        WIF: coinKey.privateWif, // Wallet Import Format (WIF) private key
      };

      // Generate a testnet address
      // const { address } = bitcoin.payments.p2pkh({ pubkey: child.publicKey, network: TESTNET, });
      // const info = {
      //     address: address,          // Bitcoin public address
      //     path,                                    // BIP44 path
      //     privateKey: coinKey.privateKey.toString("hex"), // Private key in hexadecimal
      //     WIF: coinKey.privateWif,                 // Wallet Import Format (WIF) private key
      //     };

      // generate a segwit Address
      //const { address } = bitcoin.payments.p2wpkh({ pubkey: child.publicKey });
      return info;
    } catch (error) {
      return null;
    }
  }
  return null;
}

async function sendBitcoin(recieverAddress, amountToSend, testnet = true) {
  try {
    const { privateKey, address, ...others } = bitcoin_wallet(key);
    const satoshiToSend = amountToSend * 100000000;
    let fee = 0;
    let inputCount = 0;
    let outputCount = 2;

    //const recommendedFee =  1 // await axios.get("https://bitcoinfees.earn.com/api/v1/fees/recommended");
    const recommendedFee = await get(
      'https://api.blockchain.info/mempool/fees',
    );

    const transaction = new Transaction();
    let totalAmountAvailable = 0;

    let inputs = [];

    // TESTNET
    // const resp = await axios({
    //     method: "GET",
    //     url: `https://blockstream.info/testnet/api/address/${address}/utxo`,
    // });

    // MAINNET
    const resp = await axios({
      method: 'GET',
      url: `https://blockstream.info/testnet/api/address/${address}/utxo`,
    });

    const utxos = resp.data;
    if (utxos.length === 0) {
      throw new Error('Balance is too low for this transaction');
    }

    for (const utxo of utxos) {
      let input = {};
      input.satoshis = utxo.value;
      input.script = Script.buildPublicKeyHashOut(address).toHex();
      input.address = address;
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

    //fee = transactionSize * 1 //recommendedFee.data.hourFee / 3; // satoshi per byte
    fee = transactionSize * recommendedFee.regular;

    if (testnet) {
      fee = transactionSize * 1; // 1 sat/byte is fine for testnet
    }
    if (totalAmountAvailable - satoshiToSend - fee < 0) {
      throw new Error('Balance is too low for this transaction');
    }
    //Set transaction input
    transaction.from(inputs);

    // set the recieving address and the amount to send
    transaction.to(recieverAddress, satoshiToSend);

    // Set change address - Address to receive the left over funds after transfer
    transaction.change(address);

    //manually set transaction fees: 20 satoshis per byte
    //transaction.fee(Math.round(fee));

    // automatically calculate the fees
    transaction.getFee();

    // Sign transaction with your private key
    transaction.sign(privateKey);

    // serialize Transactions
    const serializedTransaction = transaction.serialize({
      disableDustOutputs: true,
    });

    // Send Test transaction

    // const result = await axios({
    //   method: "POST",
    //   url: `https://blockstream.info/testnet/api/tx`,
    //   data: serializedTransaction,
    // });

    // MainNet
    const result = await axios({
      method: 'POST',
      url: `https://blockstream.info/api/tx`,
      data: serializedTransaction,
    });

    return result.data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

// batch transactions while charging a fee

export default {
  getBalance,
  sendBitcoin,
};
