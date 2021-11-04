import dotenv from 'dotenv'

dotenv.config()

export namespace AppConfig {
  export const config = {
    environment: process.env.NODE_ENV || 'development',
    cron: JSON.parse(process.env.ENABLE_CRON) as boolean,
    testMode: JSON.parse(process.env.TEST_MODE) as boolean,
  }
}