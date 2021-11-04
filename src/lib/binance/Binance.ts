import axios from "axios";
import _ from "lodash";
import moment from "moment";

export default class Binance {
  static async checkAnnouncements(): Promise<string[]> {
    const { data }: any = await axios.get(`https://www.binance.com/bapi/composite/v1/public/cms/article/catalog/list/query?catalogId=48&pageNo=1&pageSize=15&rnd=${moment().unix().toString()}`);
    //  const announcement = data['data']['articles'][0]['title'];
    const announcement = "Binance Will List BinaryX (BNX) in the Innovation Zone";
    const tokens = announcement.match(/\(([^)]+)/).map((token) => {
      return token.replace(")", "").replace("(", "");
    });
    return _.uniqBy(tokens, function (e: string) {
      return e;
    });
  }
}
