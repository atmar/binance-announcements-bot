import Web3Instance from "singletons/Web3";
import Web3 from "web3";
import PairAbi from "web3/smartcontracts/abi/exchangePairABI.json";
import FactoryAbi from "web3/smartcontracts/abi/exchangeFactoryABI.json";
import RouterAbi from "web3/smartcontracts/abi/exchangeRouterABI.json";
import { AbiItem } from "web3-utils";
import { CakeswapFactoryAddress, CakeswapRouterAddress } from "web3/smartcontracts/addresses";
import IExchange from "interfaces/web3/exchanges/IExchange";
import BigNumber from "bignumber.js";
import { Web3Config } from "config/web3.config";
import { now } from "moment";
import Web3Helper from "web3/helpers/Web3Helper";
import Web3Errors from "web3/helpers/Web3Errors";
import { TokenTransfer } from "interfaces/web3/exchanges/cakeswap/TokenTransfer";

export default class Cakeswap implements IExchange {
  private web3: Web3;
  private web3Helper: Web3Helper;

  constructor() {
    this.web3 = Web3Instance.getInstance();
    this.web3Helper = new Web3Helper();
  }

  async getReserves(address: string): Promise<{ reserve0: string; reserve1: string }> {
    const contract = new this.web3.eth.Contract(PairAbi as AbiItem[], address);

    const reserves = await contract.methods.getReserves().call();
    return { reserve0: reserves._reserve0, reserve1: reserves._reserve1 };
  }

  async getReservesInBatch(addresses: string[]): Promise<{ reserve0: string; reserve1: string }[]> {
    const requests = addresses.map((address: string) => {
      const contract = new this.web3.eth.Contract(PairAbi as AbiItem[], address);
      return contract.methods.getReserves().call;
    });

    const results = await this.web3Helper.makeBatchRequest(requests);
    return results.map((result: any) => {
      return { reserve0: result._reserve0, reserve1: result._reserve1 };
    });
  }

  async getPairs(blockBegin: number, blockEnd: number) {
    const contract = new this.web3.eth.Contract(FactoryAbi as AbiItem[], CakeswapFactoryAddress);
    return await contract.getPastEvents("PairCreated", { fromBlock: blockBegin, toBlock: blockEnd });
  }

  async getAmountsOut(buyAmount: BigNumber, buyAddress: string, sellAddress: string): Promise<BigNumber> {
    const contract = new this.web3.eth.Contract(RouterAbi as AbiItem[], CakeswapRouterAddress);
    const result = await contract.methods.getAmountsOut(buyAmount, [sellAddress, buyAddress]).call();
    return new BigNumber(result[1]);
  }

  async getAmountsIn(sellAmount: BigNumber, buyAddress: string, sellAddress: string): Promise<BigNumber> {
    const contract = new this.web3.eth.Contract(RouterAbi as AbiItem[], CakeswapRouterAddress);
    const result = await contract.methods.getAmountsIn(sellAmount, [sellAddress, buyAddress]).call();
    return new BigNumber(result[1]);
  }

  async buyTokens(sellAmount: BigNumber, expectedAmount: BigNumber, buyAddress: string, sellAddress: string): Promise<TokenTransfer> {
    const contract = new this.web3.eth.Contract(RouterAbi as AbiItem[], CakeswapRouterAddress);
    const data = contract.methods.swapExactTokensForTokensSupportingFeeOnTransferTokens(sellAmount, expectedAmount, [sellAddress, buyAddress], Web3Config.config.publicKey, now() + 1).encodeABI();
    const currentBlock = await this.web3.eth.getBlockNumber();
    try {
      const config = await this.web3Helper.getTransactionConfig({
        from: Web3Config.config.publicKey,
        to: CakeswapRouterAddress,
        data: data,
      });
      await this.web3Helper.estimateGas(config);
      const txHash = await this.web3Helper.send(config);
      return {
        txHash: txHash as string,
        data: data,
        block: currentBlock,
        error: null,
      };
    } catch (err) {
      Web3Errors.throwExchangeError(err, data, currentBlock);
    }
  }

  async sellTokens(sellAmount: BigNumber, expectedAmount: BigNumber, buyAddress: string, sellAddress: string): Promise<TokenTransfer> {
    const contract = new this.web3.eth.Contract(RouterAbi as AbiItem[], CakeswapRouterAddress);
    const data = contract.methods.swapExactTokensForTokensSupportingFeeOnTransferTokens(sellAmount, expectedAmount, [sellAddress, buyAddress], Web3Config.config.publicKey, now() + 1).encodeABI();
    const currentBlock = await this.web3.eth.getBlockNumber();
    try {
      const config = await this.web3Helper.getTransactionConfig({
        from: Web3Config.config.publicKey,
        to: CakeswapRouterAddress,
        data: data,
      });
      await this.web3Helper.estimateGas(config);
      const txHash = await this.web3Helper.send(config);
      return {
        txHash: txHash as string,
        data: data,
        block: currentBlock,
        error: null,
      };
    } catch (err) {
      Web3Errors.throwExchangeError(err, data, currentBlock);
    }
  }
}
