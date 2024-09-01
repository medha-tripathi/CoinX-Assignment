const { Transaction, EthPrice } = require('../models/model');

exports.renderHome = (req, res) => {
    res.render('index');
};

exports.renderTransactionHistory = async (req, res) => {
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
};

exports.renderExpensesAndPrice = async (req, res) => {
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
};


exports.renderLatestPrice = async (req, res) => {
    try {
        const latestPriceEntry = await EthPrice.findOne().sort({ timestamp: -1 });

        res.render('latest-price', {
            etherPrice: latestPriceEntry ? latestPriceEntry.price : 'Price not available',
            timestamp: latestPriceEntry ? latestPriceEntry.timestamp.toLocaleString() : 'Timestamp not available'
        });
    } catch (error) {
        console.error('Error fetching the latest price:', error);
        res.status(500).render('latest-price', {
            etherPrice: 'Error occurred',
            timestamp: 'Error occurred'
        });
    }
};
