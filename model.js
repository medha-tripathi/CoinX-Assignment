const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    blockNumber: String,
    timeStamp: String,
    hash: String,
    nonce: String,
    blockHash: String,
    transactionIndex: String,
    from: String,
    to: String,
    value: String,
    gas: String,
    gasPrice: String,
    isError: String,
    txreceipt_status: String,
    input: String,
    contractAddress: String,
    cumulativeGasUsed: String,
    gasUsed: String,
    confirmations: String,
    address: { type: String, required: true },
}, { timestamps: true });

const ethPriceSchema = new mongoose.Schema({
    price: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);
const EthPrice = mongoose.model('EthPrice', ethPriceSchema);

module.exports = { Transaction, EthPrice };
