export interface TokenBought {
  token: string;
  status: "selling" | "buying" | "sold";
  success_bought: boolean;
  success_sold: boolean;
  attempts: number;
  created_at: string;
  updated_at: string;
}
