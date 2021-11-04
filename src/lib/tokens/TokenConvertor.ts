import { TOKENS_FILE } from "files";
import { promises as fs } from "fs";
import { Token } from "interfaces/models/Token";
import Bep20 from "web3/tokens/Bep20";

export default class TokenConvertor {
  static async convert(tokenSymbol: string) {
    const input = await fs.readFile(TOKENS_FILE);
    const tokens: Token[] = JSON.parse(input.toString());

    const token = tokens.find((tokenObj) => tokenObj.symbol.toUpperCase() === tokenSymbol.toUpperCase());

    const bep20 = new Bep20();
    const decimals = await bep20.getDecimals(token.address);
    return { ...token, decimals };
  }
}
