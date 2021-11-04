export default class Web3Error extends Error {
  block: number;
  data: string;

  constructor(message: string, data: string, block: number) {
    super();

    this.message = message;
    this.data = data;
    this.block = block;
  }
}
