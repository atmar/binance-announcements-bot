import Web3Error from "errors/web3/Web3Error";

export default class InsufficientOutputAmountError extends Web3Error {
  constructor(data: string, block: number) {
    super("INSUFFICIENT_OUTPUT_AMOUNT", data, block);

    Object.setPrototypeOf(this, InsufficientOutputAmountError.prototype);
  }
}