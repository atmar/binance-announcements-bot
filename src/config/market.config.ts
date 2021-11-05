import dotenv from 'dotenv'

dotenv.config()

export namespace MarketConfig {
  export const config = {
    slippage: parseInt(process.env.MARKET_SLIPPAGE),
    bnbToSell:  parseFloat(process.env.MARKET_BNB_TO_SELL),
    minuteWaitToSell: parseInt(process.env.MARKET_WAIT_TO_SELL_MINUTES),
    secondsDelayCheck: parseInt(process.env.MARKET_CHECK_ANNOUNCEMENTS_DELAY_SECONDS),
    attempts: parseInt(process.env.MARKET_ATTEMPTS),
  }
}