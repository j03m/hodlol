import { Strategy, StrategyJSON, TraderStrategyInterface } from '../src/models/strategy';
const ccxt = require('ccxt');
import { Num } from '../src/models/types';
import { IMarket, Marketplace } from '../src/models/market';
import { Portfolio } from '../src/models/portfolio';
import { Exchange } from '../src/models/exchange';
import { Trader, TraderParams, TraderJSON } from '../src/models/trader';
import { OrderRequest, OrderSide, OrderStatus } from '../src/models/order';

import { expect } from 'chai';
import 'mocha';
import { sleep } from '../src/utils';

const BTC:string = "BTC";
const amount:Num = 10;

let opts:TraderParams = {
  symbol: BTC,
  amount: amount,
  backtest: undefined,
  fake: true
}

let json:TraderJSON = {
  "name": "dummy",
  "exchange": "binance",
  "strategies": [
    {
      fileName: "index",
      className: "Strategy",
      weight: 1,
      indicators: [
        {fileName: "macd", className: "MACD"}
      ]
    },
  ],
  "tickers": [
    "ETH/BTC", "BTC/USDT"
  ]
}

let trader:Trader = new Trader(json, opts);

describe('Trader tests', async () => {
  after(() => {
    trader.kill();
  })

  it('should', async () => {
    trader.run();
    await sleep(2000);
  }).timeout(10000)
});