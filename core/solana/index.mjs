import {
  clusterApiUrl,
  Connection,
  Keypair,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { mnemonicToSeed } from 'bip39';
import { phrase } from '../key/index';

const rpc = clusterApiUrl('devnet');
const connection = new Connection(rpc, {
  commitment: 'confirmed',
});

export async function getKey(mnemonic) {
  const seed = await mnemonicToSeed(mnemonic);
  const bytes = seed.slice(0, 32);
  const keypair = Keypair.fromSeed(bytes);
  return keypair;
}

export async function sendTransaction(toAddress, amount) {
  const account = await getKey(phrase);

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: account.publicKey,
      toPubkey: toAddress,
      lamports: amount * LAMPORTS_PER_SOL,
    }),
  );
  const signature = await sendAndConfirmTransaction(connection, transaction, [
    account,
  ]);
  return signature;
}
