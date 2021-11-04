import { Web3Config } from "config/web3.config";
import Web3 from "web3";

export default class Web3Instance {
  
  private static instance: Web3;
  eth: any;

  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor() { }

  /**
   * The static method that controls the access to the singleton instance.
   *
   * This implementation let you subclass the Singleton class while keeping
   * just one instance of each subclass around.
   */
  public static getInstance(): Web3 {
    if (!Web3Instance.instance) {
      const web3 = new Web3(new Web3.providers.HttpProvider(Web3Config.config.remote))

      Web3Instance.instance = web3;
    }

    return Web3Instance.instance;
  }
}