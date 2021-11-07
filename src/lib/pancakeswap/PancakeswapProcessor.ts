import BigNumber from "bignumber.js";
import { AppConfig } from "config/app.config";
import { MarketConfig } from "config/market.config";
import InsufficientInputAmountError from "errors/web3/exchanges/pancakeswap/InsufficientInputAmountError";
import InsufficientOutputAmountError from "errors/web3/exchanges/pancakeswap/InsufficientOutputAmountError";
import NonceError from "errors/web3/exchanges/pancakeswap/NonceError";
import TransferFailedError from "errors/web3/exchanges/pancakeswap/TransferFailedError";
import TransferFailedFromError from "errors/web3/exchanges/pancakeswap/TransferFailedFromError";
import { Token } from "interfaces/models/Token";
import { Transaction } from "interfaces/models/Transaction";
import { TokenTransfer } from "interfaces/web3/exchanges/cakeswap/TokenTransfer";
import Calculate from "lib/helpers/Calculate";
import Helper from "lib/helpers/Helper";
import moment from "moment";
import Logger from "singletons/Logger";
import Cakeswap from "web3/exchanges/Cakeswap";
import Bep20 from "web3/tokens/Bep20";
import lockFile from "proper-lockfile";
import { TRANSACTIONS_FILE } from "files";
import { promises as fs } from "fs";

export default class PancakeswapProcessor {
  private cakeswap: Cakeswap;
  private bep20: Bep20;

  private BNB_TO_SELL = MarketConfig.config.bnbToSell;

  constructor() {
    this.cakeswap = new Cakeswap();
    this.bep20 = new Bep20();
  }

  async buy(bnbToken: Token, buyToken: Token): Promise<boolean> {
    const tokensToReceiveTotal = await this.cakeswap.getAmountsOut(Calculate.includeDecimals(this.BNB_TO_SELL, bnbToken.decimals), buyToken.address, bnbToken.address);
    const tokensToReceive = Calculate.excludeDecimals(tokensToReceiveTotal.toString(), buyToken.decimals);

    //TODO: save the transaction in json file
    let transaction: Transaction = {
      token_sold: bnbToken.symbol,
      token_bought: buyToken.symbol,
      type: "buy",
      sold_amount: this.BNB_TO_SELL,
      bought_amount: tokensToReceive.toNumber(),
      total_amount_bought: tokensToReceiveTotal,
      timestamp: moment().format("YYYY-MM-DD HH:mm:ss"),
    };

    if (!AppConfig.config.testMode) {
      const transfer = await this.buyTokenOnCakeswap(Calculate.includeDecimals(this.BNB_TO_SELL, bnbToken.decimals), tokensToReceiveTotal, buyToken.address, bnbToken.address);
      if (transfer.error === null) {
        const tokenBalanceAmountTotal = await this.getBalanceOfToken(buyToken.address);
        const tokenBalanceAmount = Calculate.excludeDecimals(tokenBalanceAmountTotal.toString(), buyToken.decimals);
        transaction = { ...transaction, success: transfer.status, tx: transfer.txHash, bought_amount: tokenBalanceAmount.toNumber(), total_amount_bought: tokenBalanceAmountTotal };
        await this.writeTransaction(transaction);

        return transfer.status;
      } else {
        transaction = { ...transaction, success: false, error: transfer.error, data: transfer.data, block: transfer.block };
        await this.writeTransaction(transaction);

        return false;
      }
    }

    await this.writeTransaction(transaction);
    return true;
  }

  async sell(bnbToken: Token, sellToken: Token): Promise<boolean> {
    const input = await fs.readFile(TRANSACTIONS_FILE);
    let transactions: Transaction[] = input.toString() !== "" ? JSON.parse(input.toString()) : [];
    const buyTransaction = transactions.find((transaction) => transaction.token_bought === sellToken.symbol && transaction.type == "buy");
    const sellAmount = buyTransaction.total_amount_bought;

    const bnbToReceiveTotal = await this.cakeswap.getAmountsOut(sellAmount, bnbToken.address, sellToken.address);
    const bnbToReceive = Calculate.excludeDecimals(bnbToReceiveTotal.toString(), bnbToken.decimals);

    let transaction: Transaction = {
      token_sold: sellToken.symbol,
      token_bought: bnbToken.symbol,
      type: "sell",
      sold_amount: Calculate.excludeDecimals(sellAmount.toString(), sellToken.decimals).toNumber(),
      bought_amount: bnbToReceive.toNumber(),
      timestamp: moment().format("YYYY-MM-DD HH:mm:ss"),
    };

    //TODO: save the transaction in json file
    if (!AppConfig.config.testMode) {
      await this.approveToken(sellToken.address, new BigNumber(sellAmount));
      const transfer = await this.sellTokenOnCakeswap(bnbToReceiveTotal, sellAmount, sellToken.address, bnbToken.address);
      if (transfer.error === null) {
        transaction = { ...transaction, success: transfer.status, tx: transfer.txHash };
        await this.writeTransaction(transaction);

        return transfer.status;
      } else {
        transaction = { ...transaction, success: false, error: transfer.error, data: transfer.data, block: transfer.block };
        await this.writeTransaction(transaction);

        return false;
      }
    }

    await this.writeTransaction(transaction);
    return true;
  }

  private async buyTokenOnCakeswap(bnbAmount: BigNumber, tokensToReceiveAmount: BigNumber, tokenAddress: string, bnbAddress: string, attempt: number = 0): Promise<TokenTransfer> {
    try {
      return await this.cakeswap.buyTokens(bnbAmount, tokensToReceiveAmount, tokenAddress, bnbAddress);
    } catch (err: any) {
      if (err instanceof InsufficientOutputAmountError || NonceError || TransferFailedError) {
        Logger.getInstance().error(`Buy token error - ${tokenAddress} - ${err.message}`);
        attempt += 1;
        if (attempt <= 10) {
          await Helper.sleep(1000 * 1);
          const tokensToReceiveAmount = await this.cakeswap.getAmountsOut(bnbAmount, tokenAddress, bnbAddress);
          return await this.buyTokenOnCakeswap(bnbAmount, tokensToReceiveAmount, tokenAddress, bnbAddress, attempt);
        }
      }
      return {
        error: err.message,
        data: err.data,
        block: err.block,
      };
    }
  }

  private async getBalanceOfToken(tokenAddress: string, attempt: number = 0): Promise<BigNumber> {
    const balance = await this.bep20.getBalance(tokenAddress);
    if (balance.isGreaterThan(0)) {
      return balance;
    } else {
      attempt += 1;
      if (attempt <= 10) {
        await Helper.sleep(1000 * 1);
        return await this.getBalanceOfToken(tokenAddress, attempt);
      }
    }
    return new BigNumber(0);
  }

  private async sellTokenOnCakeswap(bnbAmount: BigNumber, tokensToSellAmount: BigNumber, tokenAddress: string, bnbAddress: string, attempt: number = 0): Promise<TokenTransfer> {
    try {
      return await this.cakeswap.sellTokens(tokensToSellAmount, bnbAmount, bnbAddress, tokenAddress);
    } catch (err: any) {
      Logger.getInstance().error(`Sell token error - ${tokenAddress} - ${err.message}`);
      if (err instanceof TransferFailedFromError || NonceError || InsufficientInputAmountError) {
        attempt += 1;
        if (attempt <= 10) {
          await Helper.sleep(1000 * 1);
          const bnbToReceiveTotal = await this.cakeswap.getAmountsOut(tokensToSellAmount, bnbAddress, tokenAddress);
          return await this.sellTokenOnCakeswap(bnbToReceiveTotal, tokensToSellAmount, tokenAddress, bnbAddress, attempt);
        }
      }
      return {
        error: err.message,
        data: err.data,
        block: err.block,
      };
    }
  }

  private async approveToken(tokenAddress: string, tokenAmount: BigNumber, attempt: number = 0): Promise<boolean> {
    const allowance = await this.bep20.getAllowance(tokenAddress);
    if (allowance.isEqualTo(0)) {
      await this.bep20.approve(tokenAddress, tokenAmount);
      attempt += 1;
      if (attempt <= 5) {
        await Helper.sleep(1000 * 8);
        return await this.approveToken(tokenAddress, tokenAmount, attempt);
      }
      return false;
    }
    return true;
  }

  private async writeTransaction(transaction: Transaction) {
    await lockFile.lock(TRANSACTIONS_FILE);

    const input = await fs.readFile(TRANSACTIONS_FILE);
    let transactions: Transaction[] = input.toString() !== "" ? JSON.parse(input.toString()) : [];
    transactions.push(transaction);
    await fs.writeFile(TRANSACTIONS_FILE, JSON.stringify(transactions));

    await lockFile.unlock(TRANSACTIONS_FILE);
  }
}
