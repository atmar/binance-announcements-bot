import axios from "axios";
import ICron from "interfaces/cron/ICron";
import Logger from "singletons/Logger";
import { promises as fs } from "fs";
import { TOKENS_FILE } from "files";
import { Token } from "interfaces/models/Token";

export default class SyncTokens implements ICron {
  async execute(): Promise<void> {
    try {
      const { data }: any = await axios.get("https://api.coingecko.com/api/v3/coins/list?include_platform=true");

      const bscTokens: Token[] = data
        .filter((token: any) => {
          return token.platforms["binance-smart-chain"] !== undefined;
        })
        .map((token: any) => {
          return {
            id: token.id,
            symbol: token.symbol,
            name: token.name,
            address: token.platforms["binance-smart-chain"],
          };
        });

      await fs.writeFile(TOKENS_FILE, JSON.stringify(bscTokens));
    } catch (err: any) {
      Logger.getInstance().error(`Sync tokens - ${err.message}`);
    }
  }
}
