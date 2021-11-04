import dotenv from 'dotenv'

dotenv.config()

export namespace Web3Config {
  export const config = {
    remote: process.env.WEB3_REMOTE,
    local: process.env.WEB3_LOCAL,
    privateKey: process.env.PRIVATE_KEY,
    publicKey: process.env.PUBLIC_KEY,
  }
}