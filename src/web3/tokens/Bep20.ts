import Web3Instance from "singletons/Web3";
import Web3 from "web3";
import PairAbi from "web3/smartcontracts/abi/exchangePairABI.json";
import BEP20Abi from "web3/smartcontracts/abi/bep20TokenAbi.json";
import { AbiItem } from "web3-utils";
import BigNumber from "bignumber.js";
import { Web3Config } from "config/web3.config";
import { CakeswapRouterAddress } from "web3/smartcontracts/addresses";
import Web3Helper from "web3/helpers/Web3Helper";
import Logger from "singletons/Logger";

export default class Bep20 {
  private web3: Web3;
  private web3Helper: Web3Helper;

  constructor() {
    this.web3 = Web3Instance.getInstance();
    this.web3Helper = new Web3Helper();
  }

  async getDetails(address: string): Promise<{ name: string; symbol: string; decimals: number; totalSupply: BigNumber; owner: string | null; code: string }> {
    const contract = new this.web3.eth.Contract(BEP20Abi as AbiItem[], address);

    const requests = [contract.methods.name().call, contract.methods.symbol().call, contract.methods.decimals().call, contract.methods.totalSupply().call];

    const results: any = await this.web3Helper.makeBatchRequest(requests);
    const code = await this.getByteCode(address);
    let owner = null;
    try {
      owner = await contract.methods.owner().call();
    } catch (err) {}
    return { name: results[0], symbol: results[1], decimals: results[2], totalSupply: new BigNumber(results[3]), owner: owner, code: code };
  }

  async getOwner(address: string): Promise<string | null> {
    const contract = new this.web3.eth.Contract(BEP20Abi as AbiItem[], address);

    try {
      return await contract.methods.owner().call();
    } catch (err) {
      return null;
    }
  }

  async getDecimals(address: string): Promise<number | null> {
    const contract = new this.web3.eth.Contract(BEP20Abi as AbiItem[], address);

    try {
      return parseInt(await contract.methods.decimals().call());
    } catch (err) {
      return null;
    }
  }

  async getTotalSupply(address: string): Promise<BigNumber> {
    const contract = new this.web3.eth.Contract(BEP20Abi as AbiItem[], address);

    const balance = await contract.methods.totalSupply().call();
    return new BigNumber(balance);
  }

  async getTransfers(blockBegin: number, blockEnd: number, pairAddress: string) {
    const contract = new this.web3.eth.Contract(PairAbi as AbiItem[], pairAddress);
    return await contract.getPastEvents("Transfer", { fromBlock: blockBegin, toBlock: blockEnd });
  }

  async getBalance(address: string): Promise<BigNumber> {
    const contract = new this.web3.eth.Contract(BEP20Abi as AbiItem[], address);

    const balance = await contract.methods.balanceOf(Web3Config.config.publicKey).call();
    return new BigNumber(balance);
  }

  async getAllowance(address: string) {
    const contract = new this.web3.eth.Contract(BEP20Abi as AbiItem[], address);

    const allowance = await contract.methods.allowance(Web3Config.config.publicKey, CakeswapRouterAddress).call();
    return new BigNumber(allowance);
  }

  async getByteCode(address: string): Promise<string> {
    return this.web3.eth.getCode(address);
  }

  async approve(tokenAddress: string, amount: BigNumber): Promise<string | null> {
    try {
      const contract = new this.web3.eth.Contract(BEP20Abi as AbiItem[], tokenAddress);
      const data = contract.methods.approve(CakeswapRouterAddress, amount.multipliedBy(100000)).encodeABI();

      const config = await this.web3Helper.getTransactionConfig({
        from: Web3Config.config.publicKey,
        to: tokenAddress,
        data: data,
      });

      await this.web3Helper.estimateGas(config);
      const txHash = await this.web3Helper.send(config);
      Logger.getInstance().info(`BEP20 Approval txHash - ${tokenAddress} - ${txHash}`);
      return txHash.txHash;
    } catch (err: any) {
      Logger.getInstance().error(`BEP20 Approval - ${err.message}`);
    }
  }
}
