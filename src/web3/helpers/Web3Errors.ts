import InsufficientInputAmountError from "errors/web3/exchanges/pancakeswap/InsufficientInputAmountError";
import InsufficientOutputAmountError from "errors/web3/exchanges/pancakeswap/InsufficientOutputAmountError";
import NonceError from "errors/web3/exchanges/pancakeswap/NonceError";
import PancakeKError from "errors/web3/exchanges/pancakeswap/PancakeKError";
import TransferFromFailedError from "errors/web3/exchanges/pancakeswap/TransferFailedFromError";
import TransferFailedError from "errors/web3/exchanges/pancakeswap/TransferFailedFromError";
import Web3Error from "errors/web3/Web3Error";

export default class Web3Errors {

  static throwExchangeError(err: any, data: string, block: number) {
    if (err.message.includes("INSUFFICIENT_OUTPUT_AMOUNT")) {
      throw new InsufficientOutputAmountError(data, block);
    }
    if (err.message.includes("INSUFFICIENT_INPUT_AMOUNT")) {
      throw new InsufficientInputAmountError(data, block);
    }
    if (err.message.includes("TRANSFER_FROM_FAILED")) {
      throw new TransferFromFailedError(data, block);
    }
    if (err.message.includes("TRANSFER_FAILED")) {
      throw new TransferFailedError(data, block);
    }
    if (err.message.includes("Pancake: K")) {
      throw new PancakeKError(data, block);
    }
    if (err.message.includes("nonce")) {
      throw new NonceError(data, block);
    }
    throw new Web3Error(err.message, data, block);
  }
}