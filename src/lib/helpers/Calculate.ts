import BigNumber from "bignumber.js";

export default class Calculate {
  public static excludeDecimals(number: string, decimals: number): BigNumber {
    const bigNumber = new BigNumber(number);
    return bigNumber.div(10 ** decimals);
  }

  public static includeDecimals(number: string | number, decimals: number): BigNumber {
    const bigNumber = new BigNumber(number);
    return bigNumber.multipliedBy(10 ** decimals);
  }

  public static getReceivedAmount(buyAmount: BigNumber, coinReserve: BigNumber, tokenReserve: BigNumber, target: "coin"|"token"): BigNumber {
    BigNumber.set({ DECIMAL_PLACES: 40 })   
    const reserve0 = target === "coin" ? tokenReserve : coinReserve;
    const reserve1 = target === "coin" ? coinReserve : tokenReserve;
    const ratio = this.calculateRatioWithPriceImpact(buyAmount, reserve0, reserve1);
    const invertedRatio = new BigNumber(1).div(ratio);
    return buyAmount.multipliedBy(invertedRatio).multipliedBy(0.9975);
  }

  private static calculateRatioWithPriceImpact(buyAmount: BigNumber, reserve0: BigNumber, reserve1: BigNumber): BigNumber {
    const k = reserve0.multipliedBy(reserve1);
    const newReserve1 = reserve0.plus(buyAmount);
    const newReserve2 = k.div(newReserve1);
    return reserve0.div(newReserve2);
  }
}
