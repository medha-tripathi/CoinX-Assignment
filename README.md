This project is a Node.js application that tracks Ethereum transactions and prices using the Etherscan and CoinGecko APIs. The data is stored in a MongoDB database.

Installation-->

Clone the repository:
git clone https://github.com/medha-tripathi/KoinX-Assignment.git
cd ethereum-tracker


Install dependencies:
npm install


Set up environment variables: 
Create a .env file in the root directory and add the following variables:
MONGODB_URI=your_mongodb_connection_string
ETHERSCAN_API_KEY=your_etherscan_api_key
PORT=your_port


Run the application:
npm start


Access the application: 
Open your browser and navigate to http://localhost:3000.



Project Structure-->

controllers/: Contains the logic for handling requests and interfacing with the database.
transactionController.js: Handles fetching and storing Ethereum transactions.
priceController.js: Handles fetching and storing Ethereum prices.
viewController.js: Handles rendering views for the frontend.


routes/: Defines the routes for the application.
transactionRoute.js: Routes related to Ethereum transactions.
priceRoute.js: Routes related to Ethereum prices.
viewRoute.js: Routes for rendering views.


models/: Defines the MongoDB models using Mongoose.
model.js: contains the schema for both Transactions and Ethereum Price.


views/: Contains EJS templates for the frontend.
index.ejs: Main landing page.
transactions-history.ejs: Page for viewing Ethereum transaction history.
latest-price.ejs: Page for viewing latest Ethereum prices.
expenses-ans-price.ejs: Page for viewing total expense for any address.
analysis.ejs: Page for visualizing Ethereum price trends and transaction volumes.


public/: Contains CSS files.

index.js: The main entry point for the application.

db.js: The connection to MongoDB Atlas.