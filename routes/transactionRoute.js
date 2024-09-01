const express = require('express');
const { fetchTransactions } = require('../controllers/transactionController');

const router = express.Router();

router.get('/:address', fetchTransactions);

module.exports = router;
