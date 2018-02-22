import { Exchange } from "./exchange";
import { Series, Tick, Serializer, TickerSerializer, CandleSerializer, OrderSerializer } from "./series";
import { sleep, Thread } from "../utils";
import { Order } from "./order";
import { ID, Scenario, ScenarioMode } from "./types";

export class Ticker {
  protected _kill:boolean = false;
  readonly series:Series;
  protected thread:Thread;
  protected timeout:number;
  constructor(protected exchange:Exchange, readonly symbol:string, readonly record:boolean=false) {
    this.series = new Series(this.filepath(), this.generateSerializer(), record);
    this.thread = new Thread();
    this.timeout = Scenario.getInstance().mode == ScenarioMode.PLAYBACK ? 1 : 5000;
  }
  
  /** 
   * Kicks off the ticker process. This runs asynchronously
  */
  public async run() {
    while (this.thread.isRunning()) {
      await this.step();
      await this.thread.sleep(this.timeout);
    }
  }

  protected async step() {
    const tick = await this.exchange.fetchTicker(this.symbol);
    this.series.append(tick);
    this.exchange.invalidate();
  }

  /** 
   * Gets the length of the series
   * 
   * @returns series length
  */
  public length():number {
    return this.series.length();
  }

  /**
   * Gets the tick at @idx
   * 
   * @param idx index of tick to grab
   * 
   * @returns tick 
   */
  public getAt(idx:number):Tick {
    return this.series.getAt(idx);
  }

  /** 
   * Gets the last tick
   * 
   * @returns the last tick in the series
  */
  public last():Tick {
    return this.series.last();
  }

  public kill():void {
    this.thread.kill();
  }

  protected filename():string {
    return `${this.symbol.replace("/", "-")}.${this.extension()}`;
  }

  protected subdir():string {
    return Scenario.getInstance().id;
  }

  protected filepath():string {
    return `./data/${this.exchange.name()}/${this.subdir()}/${this.filename()}`;
  }

  protected extension():string {
    return 'ticker';
  }

  protected generateSerializer():Serializer {
    return new TickerSerializer();
  }

  public seriesFromTicker() {
    return new Series(this.filepath(), this.generateSerializer());
  }
}

export class CandleTicker extends Ticker {
  constructor(exchange:Exchange, symbol:string, record:boolean=false, private period:string="1m") {
    super(exchange, symbol, record);
    this.timeout = Scenario.getInstance().mode == ScenarioMode.PLAYBACK ? 1 : 35000;
  }

  protected async step() {
    let last:Tick = this.last();
    let since:number = last ? last.timestamp : this.exchange.time;
    const tick = await this.exchange.fetchOHLCV(this.symbol, this.period, since);
    tick.forEach((candlestick:Array<number>) => {
      let csv:string = candlestick.join(",");
      this.series.appendFromCSV(csv, true);
      this.exchange.invalidate();
    });
    if (this.series.autowrite) this.series.write();
  }

  protected extension():string {
    return 'ohlcv';
  }

  protected generateSerializer():Serializer {
    return new CandleSerializer();
  }
}

export class OrderTicker extends Ticker {
  readonly orderID:ID;
  constructor(exchange:Exchange, readonly order:Order, record:boolean=false) {
    super(exchange, order.symbol, record);
    this.orderID = order.id;
  }

  protected async step() {
    const tick = await this.exchange.fetchOrder(this.orderID, this.symbol);
    if (this.hasChanged(tick)) {
      this.series.append(tick);
      this.order.status = tick.status;
      this.exchange.invalidate();
    }
  }

  private hasChanged(tick:Tick):boolean {
    let last:Tick = this.last();
    if (!last) return true;
    if (last.status != tick.status) return true;
    if (last.filled != tick.filled) return true;
    return false;
  }

  protected extension():string {
    return 'order';
  }

  protected generateSerializer():Serializer {
    return new OrderSerializer();
  }
}