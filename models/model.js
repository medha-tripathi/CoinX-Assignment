const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    blockNumber: { type: Number },
    timeStamp: { type: Number },
    hash: { type: String },
    from: { type: String },
    to: { type: String },
    value: { type: Number },
    gas: { type: Number },
    gasPrice: { type: Number },
    isError: { type: Number },
    gasUsed: { type: Number },
    address: { type: String }
}, { timestamps: true });

const ethPriceSchema = new mongoose.Schema({
    price: { type: Number, required: true }, 
    timestamp: { type: Date, default: Date.now } 
});

const Transaction = mongoose.model('Transaction', transactionSchema);
const EthPrice = mongoose.model('EthPrice', ethPriceSchema);

module.exports = { Transaction, EthPrice };
