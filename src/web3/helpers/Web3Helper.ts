import { Web3Config } from "config/web3.config";
import { TransactionConfig } from "interfaces/web3/transactions/TransactionConfig";
import Web3 from "singletons/Web3";
import Web3Instance from "singletons/Web3";

export default class Web3Helper {
  private web3: Web3;

  constructor() {
    this.web3 = Web3Instance.getInstance();
  }

  async send(transactionConfig: TransactionConfig): Promise<{txHash: string, status: boolean}> {
    return new Promise(async (resolve, reject) => {
      const signedTransaction = await this.web3.eth.accounts.signTransaction(transactionConfig, Web3Config.config.privateKey);
      if (!signedTransaction.rawTransaction) throw new Error("Error while signing transaction");
      this.web3.eth
        .sendSignedTransaction(signedTransaction.rawTransaction)
        .on("error", (error: any) => {
          reject(error);
          return;
        }).then((receipt: any) => {
          resolve({
            txHash: receipt.transactionHash,
            status: receipt.status,
          });
        });
    });
  }

  async estimateGas(transactionConfig: TransactionConfig) {
    return await this.web3.eth.estimateGas({
      from: transactionConfig.from,
      to: transactionConfig.to,
      data: transactionConfig.data,
      value: transactionConfig.value,
    })
  }

  async getTransactionConfig(params: TransactionConfig) {
    if (!params.from) throw new Error("Parameter 'from' is not defined.");
    if (!params.to) throw new Error("Parameter 'to' is not defined.");
    if (!params.data) throw new Error("Parameter 'data' is not defined.");

    const from = params.from;
    const to = params.to;
    const data = params.data !== "0x" ? params.data : "0x";
    const value = params.value ?? 0;
    const gas = params.gas ?? (await this.getGas({ from, to, data, value }));

    const transactionConfig: TransactionConfig = { from, to, data, value, gas };

    if (params.gasPrice) {
      transactionConfig.gasPrice = params.gasPrice;
    }

    transactionConfig.nonce = params.nonce ?? (await this.getNonce(from));

    return transactionConfig;
  }

  private async getGas(transactionConfig: TransactionConfig) {
    return ((await this.web3.eth.estimateGas(transactionConfig)) * 1.1).toFixed(0); // increasing gas cost by 10% for margin
  }

  private async getNonce(from: string | number) {
    return await this.web3.eth.getTransactionCount(String(from), "pending");
  }

  makeBatchRequest(calls: any) {
    const web3 = Web3Instance.getInstance();
    let batch = new web3.BatchRequest();

    let promises = calls.map((call: any) => {
      return new Promise((res, rej) => {
        let req = call.request({ from: "0x0000000000000000000000000000000000000000" }, (err: any, data: any) => {
          if (err) rej(err);
          else res(data);
        });
        batch.add(req);
      });
    });
    batch.execute();

    return Promise.all(promises);
  }
}
