const express = require('express');
const cron = require('node-cron');
require('dotenv').config();
const connectDB = require('./db');
const transactionRoute = require('./routes/transactionRoute');
const priceRoute = require('./routes/priceRoute');
const viewRoute = require('./routes/viewRoute');
const { fetchEthereumPrice } = require('./controllers/priceController');

const app = express();
const PORT = process.env.PORT;

app.set('view engine', 'ejs');
app.use(express.static('public'));

connectDB();

app.use('/', viewRoute);
app.use('/api/transactions', transactionRoute);
app.use('/api/price', priceRoute);


//scheduling the fucntion call every 10 minutes
cron.schedule('*/10 * * * *', async () => {
    await fetchEthereumPrice();
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    fetchEthereumPrice()
});
