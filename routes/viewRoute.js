const express = require('express');
const { renderHome, renderTransactionHistory, renderExpensesAndPrice, renderLatestPrice } = require('../controllers/viewController');

const router = express.Router();

router.get('/', renderHome);
router.get('/transaction-history', renderTransactionHistory);
router.get('/expenses-and-price', renderExpensesAndPrice);
router.get('/latest-price', renderLatestPrice); 

module.exports = router;
