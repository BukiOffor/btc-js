import dotenv from 'dotenv';
dotenv.config(process.env.DOTENV_CONFIG_PATH || '../.env');

import { validateMnemonic, generateMnemonic } from 'bip39';

export function validate_mnemonic(mnemonic) {
  return validateMnemonic(mnemonic);
}

export function generate_mnemonic(rng = null) {
  let mnemonic = generateMnemonic(rng);
  const valid = validate_mnemonic(mnemonic);
  return valid ? mnemonic : null;
}

export const phrase = process.env.PHRASE;
