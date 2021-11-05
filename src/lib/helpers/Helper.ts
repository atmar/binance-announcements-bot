import { TOKENS_BOUGHT_FILE, TRANSACTIONS_FILE } from "files";
import fs from "fs";
import { promises as fsPromise } from "fs";
export default class Helper {
  static sleep(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  static async createFiles() {
    if (!fs.existsSync(TOKENS_BOUGHT_FILE)) {
      await fsPromise.writeFile(TOKENS_BOUGHT_FILE, JSON.stringify([]));
    }
    if (!fs.existsSync(TRANSACTIONS_FILE)) {
      await fsPromise.writeFile(TRANSACTIONS_FILE, JSON.stringify([]));
    }
  }
}
