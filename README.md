# binance-announcements-bot
Begin the bot with installing Node.js on your OS. A quick google search will give you the link to do so.

Pull this repository by pulling it or downloading the ZIP file on Github.

To run the program you must use the following commands: 

`npm install` to install all the requirements.

`npm run start` to start the program and let it run

If your node.js program crashes after X amount of time for unknown reasons, you can use a node.js process manager.
Go to https://pm2.keymetrics.io/ to install PM2 that will auto restart your node.js application.

`pm2 start ecosystem.config.js` to run the PM2 process.

You must copy the .env.example file to .env file and fill in the datails
```
NODE_ENV=development // This is best set to "production" for maximum performance

ENABLE_CRON=true // Should always be true to retrieve new BSC tokens on coingecko

WEB3_LOCAL=http://localhost:8545 // Your local BSC node, currently not used
WEB3_REMOTE=https://bsc-dataseed1.binance.org:443 // The remote BSC node, you don't need a private one for this bot

MARKET_SLIPPAGE=10 // Slippage on orders. If set to 10 it gives you a 10% slippage. If you buy 100 tokens you will receive a minimum of 90 tokens
MARKET_BNB_TO_SELL=0.001 // This is the amount of BNB you risk to sell for tokens
MARKET_WAIT_TO_SELL_MINUTES=10 // This is the amount of times it waits before selling your token after the initial buy
MARKET_CHECK_ANNOUNCEMENTS_DELAY_SECONDS=60 // This is the delay to check for announcements on binance, can be set to 1
MARKET_ATTEMPTS=5; // This is the amount of times it will try to buy/sell your token on pancakeswap before it gives up because of errors

TEST_MODE=true // If set to true, no money will be used and no pancake transactions will be run

PRIVATE_KEY= // This is your private key of your wallet
PUBLIC_KEY= // This is your public key of your wallet (your public address)

```

We have 3 files: 
- tokens.json
- tokens_bought.json
- transactions.json

Tokens.json is your database of all BSC coins that are available on Coingecko.

Tokens_bought.json contain all the tokens found in binance announcements 

Transactions.json contains all your transaction data.

# Failed Transaction
If your transaction failed, you must check your transactions.json log. There you can find data and blocknumber. You must give me this data. I will simulate the transaction with your exact data and blocknumber to find out what caused it. If your error is "INSUFFICIENT_OUTPUT_AMOUNT" I can't help you. It means your slippage was set too low. Try selling it manually on pancakeswap.


# IMPORTANT Before buying
This bot uses WBNB, not BNB. You must have WBNB in your wallet in order to buy and sell tokens. Pancakeswap must also be approved to sell/buy WBNB. If you never did a transaction before with WBNB on pancakeswap you must go to Pancakeswap, click on a random token to trade and set your WNBN in the sell position. Pancakeswap will ask you to **approve** Pancakeswap to use your WBNB token. Click on that button and run the transaction. Now pancakeswap is approved to take care of your WBNB. If you do not see the approve button you're already good to go.

NOTE: If you really want to be sure your WBNB is approved to use. Go to https://bscscan.com/token/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c#readContract , go to Read Contract, go to allowance.
In allowance set the first input address to your public address and the second input address to 0x10ED43C718714eb63d5aA57B78B54704E256024E . If the result is greater than 0 you're good to go!