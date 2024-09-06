const axios = require('axios');
const { Transaction } = require('../models/model');

//Task 1: Fetching transaction history from ethereum address and storing it into db
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

        const transactionDocs = await Promise.all(transactions.map(async (tx) => {
            const date = new Date(tx.timeStamp * 1000);
            const formattedDate = `${('0' + date.getDate()).slice(-2)}-${('0' + (date.getMonth() + 1)).slice(-2)}-${date.getFullYear()}`; // Format to dd-mm-yyyy

            const priceResponse = await axios.get(`https://api.coingecko.com/api/v3/coins/ethereum/history`, {
                params: {
                    date: formattedDate
                }
            });
            const coinPrice = priceResponse.data.market_data.current_price.inr;

            return {
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
                isError: tx.isError,
                requiredCoinPrice: coinPrice
            };
        }));

        await Transaction.insertMany(transactionDocs);
        res.status(200).json({ message: 'Transactions fetched and stored successfully.' });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions.' });
    }
};

module.exports = { fetchTransactions };
