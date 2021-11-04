import Web3Error from "errors/web3/Web3Error";

export default class InsufficientInputAmountError extends Web3Error {
  constructor(data: string, block: number) {
    super("INSUFFICIENT_INPUT_AMOUNT", data, block);

    Object.setPrototypeOf(this, InsufficientInputAmountError.prototype);
  }
}