'use strict';
const ccxt = require('ccxt');
const config = require('./config');
const fin = require('./app/model/fin');
const Trader = require('./app/model/trader');
const Strategy = require('./app/model/strategy');

(async () => {
    let binance = new ccxt.binance({
      apiKey: config.binance_api_key,
      secret: config.binance_api_secret,
      enableRateLimit: true
    });
    let trader = new Trader(binance, 'BTC', 0.00001);
    await trader.connect();
    // trader.spoolFeeds(['ETH/BTC', 'LTC/BTC', 'XMR/BTC']);
    let strat = new Strategy();
    trader.initStrategies([strat], 'USDT');
    // trader.getToWork();

})();



// let kucoin = require('./app/client/kucoin');
//
// async function run() {
//   const pair = "VEN-BTC";
//   var res = await kucoin.getTicker(pair);
//   if (!res.success) {
//     console.log("Failed on get ticker:", res);
//     return;
//   }
//   var high = res.data.high;
//   var unreasonableTarget = high * 10;
//   console.log(pair + " high:", high, "-> creating sell order at", unreasonableTarget);
//
//   // res = await kucoin.createSellOrder(pair, unreasonableTarget, 1);
//   // if (!res.success) {
//   //   console.log("Failed on create sell order:", res);
//   //   return;
//   // }
//   // var orderID = res.data.orderOid;
//   // console.log("Created order", res.data);
//   //
//   // res = await kucoin.getSellOrderDetails(pair, orderID);
//   // if (!res.success) {
//   //   console.log("Failed on get order details:", res);
//   //   return;
//   // }
//   // console.log("Order details:", res.data);
//   //
//   // res = await kucoin.cancelSellOrder(pair, orderID);
//   // if (!res.success) {
//   //   console.log("Failed on cancel order:", res);
//   //   return;
//   // }
//   // console.log("Success!", res);
// }
//
// run();