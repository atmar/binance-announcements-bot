import Web3Error from "errors/web3/Web3Error";

export default class TransferFailedError extends Web3Error {
  constructor(data: string, block: number) {
    super("TRANSFER_FAILED", data, block);

    Object.setPrototypeOf(this, TransferFailedError.prototype);
  }
}