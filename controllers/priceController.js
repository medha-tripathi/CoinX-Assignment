const axios = require('axios');
const { EthPrice } = require('../models/model');

const fetchEthereumPrice = async () => {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
            params: {
                ids: 'ethereum',
                vs_currencies: 'inr'
            }
        });

        const priceInINR = response.data.ethereum.inr;
        const ethPrice = new EthPrice({ price: priceInINR, timestamp: new Date() });
        await ethPrice.save();
        console.log(`Ethereum price saved: ${priceInINR} INR`);
    } catch (error) {
        console.error('Error fetching Ethereum price:', error);
    }
};

module.exports = { fetchEthereumPrice };
