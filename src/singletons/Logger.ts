import { AppConfig } from "config/app.config";
import moment from "moment";
import { createLogger, format, transports, Logger as WinstonLogger } from "winston";
const { combine, timestamp, label, printf } = format;

export default class Logger {
  private static instance: WinstonLogger;

  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor() {}

  /**
   * The static method that controls the access to the singleton instance.
   *
   * This implementation let you subclass the Singleton class while keeping
   * just one instance of each subclass around.
   */
  public static getInstance(): WinstonLogger {
    if (!Logger.instance) {
      const myFormat = printf(({ level, message, label }) => {
        return `${moment().format('YYYY-MM-DD HH:mm:ss')} ${level}: ${message}`;
      });

      const logger = createLogger({
        level: "info",
        format: myFormat,
        transports: [
          //
          // - Write all logs with level `error` and below to `error.log`
          // - Write all logs with level `info` and below to `combined.log`
          //
          new transports.File({ filename: "error.log", level: "error" }),
          new transports.File({ filename: "combined.log", level: "info" }),
        ],
      });

      if (AppConfig.config.environment !== "production") {
        logger.add(
          new transports.Console({
            format: format.simple(),
          })
        );
      }

      Logger.instance = logger;
    }

    return Logger.instance;
  }
}
