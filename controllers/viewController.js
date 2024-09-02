const { Transaction, EthPrice } = require('../models/model');


//Rendering the home page
exports.renderHome = (req, res) => {
    res.render('index');
};

//Fetching the transaction history from the database and rendering it on the page.
exports.renderTransactionHistory = async (req, res) => {
    const { address } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; 
    const skip = (page - 1) * limit;

    if (!address) {
        return res.render('transaction-history', {
            address: '',
            totalExpenses: 'N/A',
            etherPrice: 'N/A',
            transactions: [],
            currentPage: page,
            totalPages: 0,
            limit
        });
    }

    try {
        const [transactions, totalTransactions] = await Promise.all([
            Transaction.find({ address })
                .skip(skip)
                .limit(limit),
            Transaction.countDocuments({ address })
        ]);

        let totalExpenses = 0;
        transactions.forEach(tx => {
            const gasUsed = parseFloat(tx.gasUsed);
            const gasPrice = parseFloat(tx.gasPrice);
            totalExpenses += (gasUsed * gasPrice) / 1e18;
        });

        const latestPrice = await EthPrice.findOne().sort({ timestamp: -1 });

        const totalPages = Math.ceil(totalTransactions / limit);

        res.render('transaction-history', {
            address,
            totalExpenses: totalExpenses.toFixed(6),
            etherPrice: latestPrice ? latestPrice.price : 'Price not available',
            transactions,
            currentPage: page,
            totalPages,
            limit
        });
    } catch (error) {
        console.error('Error calculating expenses:', error);
        res.status(500).render('transaction-history', {
            address: '',
            totalExpenses: 'Error occurred',
            etherPrice: 'Error occurred',
            transactions: [],
            currentPage: page,
            totalPages: 0
        });
    }
};


//Task 3: Calculating the total expense using formula gasUsed * gasPrice / 1e18;
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


//Fetching the latest price from the database and rendering it on the page.
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


//Fetching the data and showing the aanlysis in form of chart and graph.
exports.renderAnalysis = async (req, res) => {
    try {
        const prices = await EthPrice.find().sort({ timestamp: 1 }).exec();
        const transactions = await Transaction.aggregate([
            {
                $addFields: {
                    date: {
                        $toDate: {
                            $multiply: [
                                { $convert: { input: "$timeStamp", to: "double" } }, 
                                1000
                            ]
                        }
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    volume: { $sum: { $toDouble: "$value" } }
                }
            },
            { $sort: { _id: 1 } }
        ]).exec();

        res.render('analysis', {
            prices,
            transactions
        });
    } catch (error) {
        console.error('Error fetching analysis data:', error);
        res.status(500).send('Internal Server Error');
    }
}
