const express = require('express');
const cors =  require('cors'); 
const { 
    create_wallet, 
    generate_mnemonic, 
    getBalance,
    sendTransactionEth, 
    sendBitcoin ,
    sendErcTokens,
    getErcTokensBalance
} 
= require('./scripts');

require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }));

app.get('/seed', async (req, res) => {
    const data = generate_mnemonic();
    res.send({ seed: data })
})

app.post('/bitcoin_wallet', async (req, res) => {
    const { seed } = req.body;
    const data = await create_wallet(0, seed);
    if (data) {
        res.send(data)
    } else {
        res.status(400).send("Something Went Wrong");
    }
})

app.post('/ethereum_wallet', async (req, res) => {
    const { seed } = req.body;
    const data = await create_wallet(60, seed);
    if (data) {
        res.send(data)
    } else {
        res.status(400).send("Something Went Wrong");
    }
})

app.post('/stellar_wallet', async (req, res) => {
    const { seed } = req.body;
    const data = await create_wallet(148, seed);
    if (data) {
        res.send(data)
    } else {
        res.status(400).send("Something Went Wrong");
    }
})

app.get('/bitcoin_balance/:address', async (req, res) => {
    const { address } = req.params;
    const data = await getBalance(0, address);
    if (data) {
        res.send(data)
    } else {
        res.status(400).send("Something Went Wrong");
    }
})

app.get('/ethereum_balance/:address', async (req, res) => {
    const { address } = req.params;
    const data = await getBalance(60, address);
    if (data) {
        res.send(data)
    } else {
        res.status(400).send("Something Went Wrong");
    }
})

app.post('/bitcoin/transfer', async (req, res) => {
    const { privateKey, sourceAddress, destinationAddress, amount } = req.body;
    const data = await sendBitcoin(privateKey, sourceAddress, destinationAddress, amount);
    if (data) {
        res.send(data)
    } else {
        res.status(400).send("Something Went Wrong");
    }
})

app.post('/ethereum/transfer', async (req, res) => {
    const { privateKey, amount, toAddress } = req.body;
    const data = await sendTransactionEth(privateKey, amount, toAddress);
    if (data) {
        res.send(data)
    } else {
        res.status(400).send("Something Went Wrong");
    }
})

app.post('/tokens/transfer', async (req, res) => {
    const { contractTokenAddress,privateKey, amount, toAddress } = req.body;
    const data = await sendErcTokens(privateKey, contractTokenAddress, amount, toAddress);
    if (data) {
        res.send(data)
    } else {
        res.status(400).send("Something Went Wrong");
    }
})

app.get('/token/balance/:contractTokenAddress/:address', async (req, res) => {
    const { contractTokenAddress,address } = req.params;
    console.log(contractTokenAddress,address)
    const data = await getErcTokensBalance(contractTokenAddress, address);
    if (data) {
        res.send(data)
    } else {
        res.status(400).send("Something Went Wrong");
    }
})



const port = 8000
app.listen(port, () => {
    console.log(`Server is running on port ${port}!.`)
})




