# Multichain Wallets
>One Seed to rule them all, One Key to find them, One Path to bring them all, And in cryptography bind them.

## Abstract

A protocol that maintain one single (mnemonic) seed backup for all keychains used across various blockchains.

1. BIP32 root key is the root extended private key that is represented as the top root of the keychain in BIP32.

2. BIP39 mnemonic is the mnemonic phrase that is calculated from the entropy used before hashing of the mnemonic in BIP39.

3. BIP39 seed is the result of hashing the BIP39 mnemonic seed.
4. Path is the key derivation path for each blockchain having bitcoin at `"m/44'/0'/0'/0/0"` and ethereum at `"m/44'/60'/0'/0/0"`


[Read BIP Proposal](https://github.com/bitcoin/bips/blob/master/bip-0085.mediawiki)
