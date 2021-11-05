import BigNumber from "bignumber.js";

export interface Transaction {
  token_sold: string;
  token_bought: string;
  type: "sell" | "buy";
  sold_amount: number;
  bought_amount: number;
  total_amount_bought?: BigNumber;
  tx?: string;
  error?: string;
  success?: boolean;
  data?: string;
  block?: number;
  timestamp: string;
}
