import axios from "axios";
import _ from "lodash";
import moment from "moment";
import Logger from "singletons/Logger";

export default class Binance {
  static async checkAnnouncements(): Promise<string[]> {
    Logger.getInstance().info("Checking Binance announcements");
    const queryString = this.randomizeQuery();
    const url = `https://www.binance.com/bapi/composite/v1/public/cms/article/catalog/list/query?${queryString}`;
    const result: any = await axios.get(url);
    const announcement = result.data["data"]["articles"][0]["title"];
    //const announcement = "Binance Will List BinaryX (ADA) in the Innovation Zone";
    let tokens = announcement.match(/\(([^)]+)/g);
    if (tokens === null) {
      return [];
    }
    tokens = tokens.map((token: any) => {
      return token.replace(")", "").replace("(", "");
    });
    return _.uniqBy(tokens, function (e: string) {
      return e;
    });
  }

  private static randomizeQuery(): string {
    let queries = [
      {
        query: "catalogId",
        value: 48,
      },
      {
        query: "pageNo",
        value: 1,
      },
      {
        query: "pageSize",
        value: 18,
      },
      {
        query: "rnd",
        value: moment().unix().toString(),
      },
      {
        query: (Math.random() + 1).toString(36).substring(7),
        value: (Math.random() + 1).toString(36).substring(7),
      }
    ];
    queries = _.shuffle(queries);
    return queries.map((query) => `${query.query}=${query.value}`).join("&");
  }
}
