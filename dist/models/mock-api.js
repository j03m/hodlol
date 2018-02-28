"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const order_1 = require("./order");
const utils_1 = require("../utils");
const uuid = require('uuid/v4');
class MockAPI {
    constructor(api) {
        this.api = api;
        this.candles = new Map();
        this.orders = new Map();
        this.name = api.name;
    }
    async loadTickers(feed) {
        for (const candle of feed.candles.values()) {
            let series = candle.seriesFromTicker();
            await series.read();
            this.candles.set(candle.symbol, series);
        }
    }
    async run() {
        this.thread = new utils_1.Thread();
        while (this.thread.isRunning()) {
            await this.thread.sleep(1);
            // fill any open orders
            this.orders.forEach((order) => {
                if (order.status == order_1.OrderStatus.OPEN) {
                    order.status = order_1.OrderStatus.CLOSED;
                    order.filled = order.amount;
                    order.remaining = 0;
                }
            });
        }
    }
    async loadMarkets() {
        return this.api.loadMarkets();
    }
    async fetchTicker(pair) {
        // not using this yet
        return;
    }
    async fetchOHLCV(symbol, period, since) {
        let series = this.candles.get(symbol);
        if (!series) {
            console.log("ok", this.candles);
            console.log("no symbol:", symbol);
            process.exit();
        }
        let [tick] = series.nearest(types_1.Scenario.getInstance().time);
        let serializer = series.serializer;
        return Promise.resolve(serializer.toCCXT(tick));
    }
    async createLimitBuyOrder(market, amount, price) {
        let order = {
            id: uuid(),
            timestamp: +new Date(),
            status: order_1.OrderStatus.OPEN,
            symbol: market,
            type: order_1.OrderType.LIMIT,
            side: order_1.OrderSide.BUY,
            price: price,
            amount: amount,
            cost: types_1.BN(price).times(amount),
            filled: 0.0,
            remaining: amount,
        };
        this.orders.set(order.id, order);
        return Promise.resolve(order);
    }
    createLimitSellOrder(market, amount, price) {
        let order = {
            id: uuid(),
            timestamp: +new Date(),
            status: order_1.OrderStatus.OPEN,
            symbol: market,
            type: order_1.OrderType.LIMIT,
            side: order_1.OrderSide.SELL,
            price: price,
            amount: amount,
            cost: types_1.BN(price).times(amount),
            filled: 0.0,
            remaining: amount,
        };
        this.orders.set(order.id, order);
        return Promise.resolve(order);
    }
    fetchOrders(symbol, since = -1, limit = 100) {
        let orders = [];
        this.orders.forEach((val) => {
            if (val.symbol == symbol && val.timestamp >= since)
                orders.push(val);
        });
        return Promise.resolve(orders.slice(0, limit));
    }
    fetchOrder(orderID, symbol) {
        return Promise.resolve(this.orders.get(orderID));
    }
    fetchBalance() {
        return Promise.resolve({ free: types_1.BN(0), reserved: types_1.BN(0) });
    }
}
exports.MockAPI = MockAPI;
//# sourceMappingURL=mock-api.js.map