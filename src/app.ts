import cron from "cron/cron";
import SyncTokens from "cron/sync/SyncTokens";
import realFs from "fs";
import gracefulFs from "graceful-fs";
import Binance from "lib/binance/Binance";
import TokenConvertor from "lib/tokens/TokenConvertor";
import PancakeswapProcessor from "lib/pancakeswap/PancakeswapProcessor";
import Helper from "lib/helpers/Helper";
import { MarketConfig } from "config/market.config";
import lockFile from "proper-lockfile";
import { TOKENS_BOUGHT_FILE, TOKENS_FILE } from "files";
import { promises as fs } from "fs";
import { TokenBought } from "interfaces/models/TokenBought";
import moment from "moment";
import { Token } from "interfaces/models/Token";

gracefulFs.gracefulify(realFs);
cron;

async function run() {
  // Run sync tokens on startup
  const sync = new SyncTokens();
  await sync.execute();

  await Helper.createFiles();

  while (true) {
    const tokens = await Binance.checkAnnouncements();

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      await addTokenToList(token);
    }

    const input = await fs.readFile(TOKENS_BOUGHT_FILE);
    let tokensBoughtAll: TokenBought[] = input.toString() !== "" ? JSON.parse(input.toString()) : [];

    tokensBoughtAll = tokensBoughtAll.filter((token) => {
      return token.status !== "sold";
    });

    for (let i = 0; i < tokensBoughtAll.length; i++) {
      const token = tokensBoughtAll[i];
      await processToken(token.token);
    }

    await Helper.sleep(MarketConfig.config.secondsDelayCheck * 1000);
  }
}

async function addTokenToList(tokenSymbol: string) {
  const tokensInput = await fs.readFile(TOKENS_FILE);
  const tokens: Token[] = JSON.parse(tokensInput.toString());
  const tokenExists = tokens.some((tokenObj) => tokenObj.symbol.toUpperCase() === tokenSymbol.toUpperCase());

  if (!tokenExists) {
    return;
  }

  await lockFile.lock(TOKENS_BOUGHT_FILE);

  const input = await fs.readFile(TOKENS_BOUGHT_FILE);
  let tokensBoughtAll: TokenBought[] = input.toString() !== "" ? JSON.parse(input.toString()) : [];
  let tokenBought: TokenBought = tokensBoughtAll.find((token: TokenBought) => token.token === tokenSymbol);
  if (tokenBought === undefined) {
    tokenBought = {
      token: tokenSymbol,
      success_bought: false,
      success_sold: false,
      status: "buying",
      attempts: 0,
      created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
    };
    tokensBoughtAll.push(tokenBought);
    await fs.writeFile(TOKENS_BOUGHT_FILE, JSON.stringify(tokensBoughtAll));
  }

  await lockFile.unlock(TOKENS_BOUGHT_FILE);
}

async function processToken(tokenSymbol: string) {
  const cakeswapProcessor = new PancakeswapProcessor();

  const bnbToken = await TokenConvertor.convert("WBNB");
  const buyToken = await TokenConvertor.convert(tokenSymbol);

  await lockFile.lock(TOKENS_BOUGHT_FILE);

  const input = await fs.readFile(TOKENS_BOUGHT_FILE);
  let tokensBoughtAll: TokenBought[] = input.toString() !== "" ? JSON.parse(input.toString()) : [];
  let tokenBought: TokenBought = tokensBoughtAll.find((token: TokenBought) => token.token === tokenSymbol);

  if (tokenBought.attempts <= MarketConfig.config.attempts) {
    if (tokenBought.status === "buying") {
      if (!tokenBought.success_bought) {
        const success = await cakeswapProcessor.buy(bnbToken, buyToken);
        let attempts = tokenBought.attempts;
        if (!success) {
          attempts += 1;
        }
        tokensBoughtAll = tokensBoughtAll.map((tokenBoughtObj) => {
          if (tokenBoughtObj.token === tokenBought.token) {
            return { ...tokenBoughtObj, status: success ? "selling" : "buying", success_bought: success, attempts: attempts, updated_at: moment().format("YYYY-MM-DD HH:mm:ss") };
          }
          return tokenBoughtObj;
        });
      }
      //TODO wait X amount oif minutes
    } else if (tokenBought.status === "selling" && tokenBought.created_at <= moment().subtract(MarketConfig.config.minuteWaitToSell, "m").format("YYYY-MM-DD HH:mm:ss")) {
      if (!tokenBought.success_sold) {
        const success = await cakeswapProcessor.sell(bnbToken, buyToken);
        let attempts = tokenBought.attempts;
        if (!success) {
          attempts += 1;
        }
        tokensBoughtAll = tokensBoughtAll.map((tokenBoughtObj) => {
          if (tokenBoughtObj.token === tokenBought.token) {
            return { ...tokenBoughtObj, status: success ? "sold" : "selling", success_sold: success, attempts: attempts, updated_at: moment().format("YYYY-MM-DD HH:mm:ss") };
          }
          return tokenBoughtObj;
        });
      }
    }
  }

  await fs.writeFile(TOKENS_BOUGHT_FILE, JSON.stringify(tokensBoughtAll));
  await lockFile.unlock(TOKENS_BOUGHT_FILE);
}

run();
