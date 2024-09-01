const express = require('express');
const { fetchEthereumPrice } = require('../controllers/priceController');

const router = express.Router();

router.get('/fetch', async (req, res) => {
    await fetchEthereumPrice();
    res.status(200).send('Price fetched and stored successfully.');
});

module.exports = router;
