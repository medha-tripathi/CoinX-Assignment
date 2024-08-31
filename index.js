const express = require('express');
const axios = require('axios');
require('dotenv').config();
const cron = require('node-cron');
const connectDB = require('./db');
const { Transaction, EthPrice } = require('./model');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');

app.use(express.static('public'));

connectDB();

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/api/transactions/:address', async (req, res) => {
    const { address } = req.params;

    try {
        const response = await axios.get(`https://api.etherscan.io/api`, {
            params: {
                module: 'account',
                action: 'txlist',
                address: address,
                startblock: 0,
                endblock: 99999999,
                sort: 'asc',
                apikey: process.env.ETHERSCAN_API_KEY
            }
        });

        const transactions = response.data.result;

        await Transaction.deleteMany({ address });

        const transactionDocs = transactions.map(tx => ({
            address,
            blockNumber: tx.blockNumber,
            timeStamp: tx.timeStamp,
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: tx.value,
            gas: tx.gas,
            gasPrice: tx.gasPrice,
            gasUsed: tx.gasUsed,
            isError: tx.isError
        }));

        await Transaction.insertMany(transactionDocs);

        res.status(200).json({ message: 'Transactions fetched and stored successfully.' });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions.' });
    }
});

cron.schedule('*/10 * * * *', async () => {
    await fetchEthereumPrice();
});

async function fetchEthereumPrice() {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
            params: {
                ids: 'ethereum',
                vs_currencies: 'inr'
            }
        });

        const priceInINR = response.data.ethereum.inr;

        const ethPrice = new EthPrice({
            price: priceInINR,
            timestamp: new Date()
        });

        await ethPrice.save();

        console.log(`Ethereum price saved: ${priceInINR} INR`);
    } catch (error) {
        console.error('Error fetching Ethereum price:', error);
    }
}

app.get('/transaction-history', async (req, res) => {
    const { address } = req.query;

    if (!address) {
        return res.render('transaction-history', {
            address: '',
            totalExpenses: 'N/A',
            etherPrice: 'N/A',
            transactions: []
        });
    }

    try {
        const transactions = await Transaction.find({ address });

        let totalExpenses = 0;
        transactions.forEach(tx => {
            const gasUsed = parseFloat(tx.gasUsed);
            const gasPrice = parseFloat(tx.gasPrice);
            totalExpenses += (gasUsed * gasPrice) / 1e18;
        });

        const latestPrice = await EthPrice.findOne().sort({ timestamp: -1 });

        res.render('transaction-history', {
            address,
            totalExpenses: totalExpenses.toFixed(6), 
            etherPrice: latestPrice ? latestPrice.price : 'Price not available',
            transactions
        });
    } catch (error) {
        console.error('Error calculating expenses:', error);
        res.status(500).render('transaction-history', {
            address: '',
            totalExpenses: 'Error occurred',
            etherPrice: 'Error occurred',
            transactions: []
        });
    }
});

app.get('/expenses-and-price', async (req, res) => {
    const { address } = req.query;

    if (!address) {
        return res.render('expenses-and-price', {
            address: '',
            totalExpenses: 'N/A',
            etherPrice: 'N/A'
        });
    }

    try {
        const transactions = await Transaction.find({ address });

        let totalExpenses = 0;
        transactions.forEach(tx => {
            const gasUsed = parseFloat(tx.gasUsed);
            const gasPrice = parseFloat(tx.gasPrice);
            totalExpenses += (gasUsed * gasPrice) / 1e18;
        });

        const latestPrice = await EthPrice.findOne().sort({ timestamp: -1 });

        res.render('expenses-and-price', {
            address,
            totalExpenses: totalExpenses.toFixed(6),
            etherPrice: latestPrice ? latestPrice.price : 'Price not available'
        });
    } catch (error) {
        console.error('Error calculating expenses:', error);
        res.status(500).render('expenses-and-price', {
            address: '',
            totalExpenses: 'Error occurred',
            etherPrice: 'Error occurred'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // fetchEthereumPrice();
});
