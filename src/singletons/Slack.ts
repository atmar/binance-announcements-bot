import { App } from "@slack/bolt";

export default class Slack {
  
  private static instance: App;

  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor() { }

  /**
   * The static method that controls the access to the singleton instance.
   *
   * This implementation let you subclass the Singleton class while keeping
   * just one instance of each subclass around.
   */
  public static getInstance() {
    if (!Slack.instance) {
      const slack = new App({
        token: process.env.SLACK_BOT_TOKEN,
        signingSecret: process.env.SLACK_SIGNING_SECRET,
      });

      Slack.instance = slack;
    }

    return Slack.instance;
  }
}