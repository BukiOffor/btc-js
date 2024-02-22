# Wallet Service

## Overview

This repository contains a simple wallet service implemented using Node.js and Express.js. The service exposes endpoints for generating mnemonic seeds and creating wallets for Bitcoin, Ethereum, and other blockchains. Additionally, it allows checking the balance of Bitcoin and Ethereum wallets based on their addresses.

## Prerequisites

Before running the service, ensure you have the following prerequisites installed:

- [Node.js](https://nodejs.org/) - JavaScript runtime
- [npm](https://www.npmjs.com/) - Node.js package manager

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/your-repo.git
    ```

2. Change into the project directory:

    ```bash
    cd your-repo
    ```

3. Install dependencies:

    ```bash
    npm install
    ```

## Configuration

Make sure to set the necessary environment variables. Create a `.env` file in the project root and add the following:

```plaintext
# .env
PORT=8000
```

## Running the Service

To start the wallet service, run the following command:

```bash
npm start
```

The service will be accessible at `http://localhost:8000` by default. You can change the port by modifying the `PORT` variable in the `.env` file.

## Endpoints

### 1. Generate Mnemonic Seed

#### Endpoint

- **GET** `/seed`

#### Description

Generates a random mnemonic seed.

#### Request

```bash
curl http://localhost:8000/seed
```
#### Response
```json
{
    "seed": "expose dune dilemma angry blood interest claw slow method clerk flag fluid"
}
```


### 2. Create Bitcoin Wallet

#### Endpoint

- **POST** `/bitcoin_wallet`

#### Request Body

```json
{
  "seed": "your-mnemonic-seed"
}
```

#### Description

Creates a Bitcoin wallet using the provided mnemonic seed.

#### Example

```bash
curl -X POST -H "Content-Type: application/json" -d '{"seed": "your-mnemonic-seed"}' http://localhost:8000/bitcoin_wallet
```
#### Response
```json
{
    "address": "15jZcRuwuX8oDsZ9vZngQBvf1smAh3nZH6",
    "path": "m/44'/0'/0'/0/0",
    "privateKey": "5b494742c688a7bbede2e775e453b4d2d0e30c64e81cbb88849ad1c2c9e395c5",
    "WIF": "KzHACWUXMsTebyDadg9Kn8Gu8tCeo92HUBijz9PTUoq2zRvrW6Ys"
}

```


### 3. Create Ethereum Wallet

#### Endpoint

- **POST** `/ethereum_wallet`

#### Request Body

```json
{
  "seed": "your-mnemonic-seed"
}
```

#### Description

Creates an Ethereum wallet using the provided mnemonic seed.

#### Example

```bash
curl -X POST -H "Content-Type: application/json" -d '{"seed": "your-mnemonic-seed"}' http://localhost:8000/ethereum_wallet
```

#### Response
```json
{
    "address": "0xB2A5F2CCe57a4761e4dDCd1f78b860798A70d4a0",
    "path": "m/44'/60'/0'/0/0",
    "privateKey": "0x711f94e004fdfaab2acc29177151ead454750614bcb07bfd88be4328d0f3c865"
}
```


### 4. Create Stellar Wallet

#### Endpoint

- **POST** `/stellar_wallet`

#### Request Body

```json
{
  "seed": "your-mnemonic-seed"
}
```

#### Description

Creates a Stellar wallet using the provided mnemonic seed.

#### Example

```bash
curl -X POST -H "Content-Type: application/json" -d '{"seed": "your-mnemonic-seed"}' http://localhost:8000/stellar_wallet
```

### 5. Get Bitcoin Wallet Balance

#### Endpoint

- **GET** `/bitcoin_balance/:address`

#### Parameters

- `address`: Bitcoin wallet address

#### Description

Retrieves the balance of a Bitcoin wallet based on its address.

#### Example

```bash
curl http://localhost:8000/bitcoin_balance/your-wallet-address
```

### 6. Get Ethereum Wallet Balance

#### Endpoint

- **GET** `/ethereum_balance/:address`

#### Parameters

- `address`: Ethereum wallet address

#### Description

Retrieves the balance of an Ethereum wallet based on its address.

#### Example

```bash
curl http://localhost:8000/ethereum_balance/your-wallet-address
```



### 7. Transfer Bitcoin

#### Endpoint

- **POST** `/bitcoin/transfer`

#### Request Body

```json
{
    "privateKey": "<your private key>",
    "amount": "0.0000001",
    "sourceAddress": "<address of the sender>",
    "destinationAddress": "n2Bbspn1D6UQZXKgo6j3vihaeFQbRXnc94"
}
```

#### Description

Sends a transaction to an bitcoin address using the provided key.

#### Example

```bash
curl -X POST -H "Content-Type: application/json" -d '{privateKey ... }' http://localhost:8000/bitcoin/transfer
```

#### Response
```json
/// Transaction hash
"711f94e004fdfaab2acc29177151ead454750614bcb07bfd88be4328d0f3c865"
```


### 8. Transfer Ethereum

#### Endpoint

- **POST** `/ethereum/transfer`

#### Request Body

```json
{
    "privateKey": "your private key",
    "amount": "0.0000001",
    "toAddress": "0xB2A5F2CCe57a4761e4dDCd1f78b860798A70d4a0",
}
```

#### Description

Sends a transaction to an Ethereum wallet using the provided key.

#### Example

```bash
curl -X POST -H "Content-Type: application/json" -d '{"privateKey ..."}' http://localhost:8000/ethereum/transfer
```

#### Response
```json
/// Transaction hash
0x711f94e004fdfaab2acc29177151ead454750614bcb07bfd88be4328d0f3c865

```



## Conclusion

The wallet service provides simple endpoints for generating mnemonic seeds, creating wallets for Bitcoin, Ethereum, and Stellar, and checking the balance of Bitcoin and Ethereum wallets. Also sends a transaction when the private key is provided. Use the provided examples to interact with the service.