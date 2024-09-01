const axios = require('axios');
const { Transaction } = require('../models/model');

const fetchTransactions = async (req, res) => {
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
};

module.exports = { fetchTransactions };
