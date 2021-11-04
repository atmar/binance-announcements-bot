import cron from "cron/cron";
import SyncTokens from "cron/sync/SyncTokens";
import realFs from "fs";
import gracefulFs from "graceful-fs";
import Binance from "lib/binance/Binance";
import TokenConvertor from "lib/tokens/TokenConvertor";
import PancakeswapProcessor from "lib/pancakeswap/PancakeswapProcessor";
import Helper from "lib/helpers/Helper";
import { MarketConfig } from "config/market.config";

gracefulFs.gracefulify(realFs);
cron;

async function run() {
  // Run sync tokens on startup
  const sync = new SyncTokens();
  await sync.execute();

  while (true) {
    const tokens = await Binance.checkAnnouncements();

    await Promise.all(
      tokens.map(async (token) => {
        await processToken(token);
      })
    );
    await Helper.sleep(MarketConfig.config.secondsDelayCheck * 1000);
  }
}

async function processToken(tokenSymbol: string) {
  const cakeswapProcessor = new PancakeswapProcessor();

  const bnbToken = await TokenConvertor.convert("WBNB");
  const buyToken = await TokenConvertor.convert(tokenSymbol);

  // Buy tokens
  await cakeswapProcessor.buy(bnbToken, buyToken);

  //TODO:  Wait X amount of minutes
  await cakeswapProcessor.sell(bnbToken, buyToken);

  // ?? Profit
}

run();
