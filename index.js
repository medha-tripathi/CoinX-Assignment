const express = require('express');
const axios = require('axios');
require('dotenv').config();
const cron = require('node-cron');
const connectDB = require('./db');
const { Transaction, EthPrice } = require('./model');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

async function fetchEthereumPrice() {
    try {
        const response = await axios.get(
            'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr'
        );

        const ethPrice = response.data.ethereum.inr;

        const newPrice = new EthPrice({ price: ethPrice });
        await newPrice.save();

        console.log(`Ethereum price of INR ${ethPrice} stored at ${new Date().toLocaleString()}`);
    } catch (error) {
        console.error('Error fetching Ethereum price:', error);
    }
}

cron.schedule('*/10 * * * *', fetchEthereumPrice);

app.get('/api/transactions/:address', async (req, res) => {
    const { address } = req.params;
    const apiKey = process.env.ETHERSCAN_API_KEY;

    try {
        const response = await axios.get(
            `https://api.etherscan.io/api`,
            {
                params: {
                    module: 'account',
                    action: 'txlist',
                    address: address,
                    startblock: 0,
                    endblock: 99999999,
                    sort: 'asc',
                    apikey: apiKey,
                },
            }
        );

        if (response.data.status !== '1') {
            return res.status(400).json({ error: response.data.message });
        }

        const transactions = response.data.result;

        await Transaction.deleteMany({ address });

        await Transaction.insertMany(
            transactions.map(tx => ({ ...tx, address }))
        );

        res.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/expenses/:address', async (req, res) => {
    const { address } = req.params;

    try {
        const transactions = await Transaction.find({ address });

        let totalExpenses = 0;
        transactions.forEach(tx => {
            const gasUsed = parseFloat(tx.gasUsed);
            const gasPrice = parseFloat(tx.gasPrice);
            totalExpenses += (gasUsed * gasPrice) / 1e18; 
        });

        const latestPrice = await EthPrice.findOne().sort({ timestamp: -1 });

        res.json({
            address,
            totalExpenses: totalExpenses.toFixed(6), 
            etherPrice: latestPrice ? latestPrice.price : 'Price not available'
        });
    } catch (error) {
        console.error('Error calculating expenses:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

    fetchEthereumPrice();
});
