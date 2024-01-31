const express = require('express');
const cors =  require('cors'); 
const { create_wallet, generate_mnemonic, getBalance } = require('./scripts')

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

const port = 8000
app.listen(port, () => {
    console.log(`Server is running on port ${port}!.`)
})




