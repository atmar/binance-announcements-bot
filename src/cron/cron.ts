import { AppConfig } from "config/app.config";
import cron from "node-cron";
import SyncTokens from "./sync/SyncTokens";

if (AppConfig.config.cron) {
  cron.schedule('0 0 * * *', () => {
    const sync = new SyncTokens();
    sync.execute();
  });
}

export default cron;