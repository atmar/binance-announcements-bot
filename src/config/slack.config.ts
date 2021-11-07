import dotenv from 'dotenv'

dotenv.config()

export namespace SlackConfig {
  export const config = {
    token: process.env.SLACK_BOT_TOKEN,
    secret: process.env.SLACK_SIGNING_SECRET,
    channel: process.env.SLACK_CHANNEL,
    useSlack: JSON.parse(process.env.USE_SLACK) as boolean,
  }
}