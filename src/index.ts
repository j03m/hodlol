import { Trader, TraderJSON } from "./models/trader";
import { LoggerApi } from "./utils/logger";
const logger = new LoggerApi("main");
const path = require("path");
const web = require("./alive.js");
web.listen();

const commandLineArgs = require("command-line-args");
// const Trader = require("./app/model/trader");
const rs = require('readline-sync');
const chrono = require('chrono-node');

//throw unhandled rejections for a stack until node does by default
process.on('unhandledRejection', e => { throw e; } );

import * as fs from "fs";
import { formatTimestamp } from "./utils";
import { Backfiller } from "./models/backfiller";

export { Trader, TraderJSON } from "./models/trader"

const optionDefinitions = [
  { name: 'help', alias: 'h', type: Boolean },
  { name: 'symbol', alias: 's', type: String, defaultValue: "BTC" },
  { name: 'quote', alias: 'q', type: String, defaultValue: "USDT" },
  { name: 'amount', alias: 'a', type: Number },
  { name: 'trader', alias: 't', type: String, defaultOption: true},
  { name: 'backtest', alias: 'b', type: String},
  { name: 'mock', alias: 'm', type: Boolean, defaultValue: false}
];

const opts = commandLineArgs(optionDefinitions);
logger.info("interpreted options: ", opts);
logger.info("cwd: ", process.cwd());
logger.info("trader: ", opts.trader);
const resolvedTraderPath = path.resolve(process.cwd(), opts.trader);
logger.info("resolve to: ", resolvedTraderPath);


(async () => {
  const foundTrader =  fs.existsSync(resolvedTraderPath);
  if (!foundTrader){
    logger.fatal("We couldn't find trader. Fully resolved path: " + resolvedTraderPath, " supplied opts:", opts, " current cwd: ", process.cwd());
  }

  let traderJSON:TraderJSON = JSON.parse(fs.readFileSync(opts.trader).toString());
  
  // if we're asking to backtest without providing a scenario file,
  // we need to go grab the backtest data
  if (opts.backtest === null) {
    let dateInput = rs.question("What time range? (This can be written naturally, e.g. 'Saturday 4pm to Monday 9am'): ");
    let [parsed] = chrono.parse(dateInput);
    let start = parsed.start.date();
    let end = parsed.end.date();
    let name = rs.question("Give this backtest a name (default is data start date): ");
    if (!name || name.length < 1) name = formatTimestamp(+start);
    const backfiller:Backfiller = new Backfiller(traderJSON, opts);
    opts.backtest = await backfiller.run(name, +start, +end);
  }

  // don't require explicit mock
  if (!opts.mock && opts.backtest) opts.mock = true;
  
  new Trader(traderJSON, opts).run();
})();
