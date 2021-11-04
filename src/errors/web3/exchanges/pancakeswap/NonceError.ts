import Web3Error from "errors/web3/Web3Error";

export default class NonceError extends Web3Error {
  constructor(data: string, block: number) {
    super("NONCE_ERROR", data, block);

    Object.setPrototypeOf(this, NonceError.prototype);
  }
}