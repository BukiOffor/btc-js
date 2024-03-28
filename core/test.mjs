import { binance, getBalance } from './binance/index.mjs';
import { env } from 'node:process';
import { phrase } from './key/index.mjs';

async function main() {
  const { address } = binance(phrase);
  console.log(address);
  const balance = await getBalance(address);
  console.log(balance);
}

main().then().catch(console.error);
