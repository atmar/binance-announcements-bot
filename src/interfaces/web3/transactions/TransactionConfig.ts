export interface TransactionConfig {
  from: string | number
  to: string
  data: string
  value?: string | number
  gas?: string | number
  gasPrice?: string | number
  nonce?: string
}