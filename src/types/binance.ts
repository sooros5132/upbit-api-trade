export interface IBinanceSocketMessageTicker {
  data: {
    E: number; // 123456789  Event time
    T: number; // 123456785  Trade time
    a: number; // 5933014    Aggregate trade ID
    e: string; // "aggTrade" Event type
    f: number; // 100        First trade ID
    l: number; // 105        Last trade ID
    m: boolean; // true       Is the buyer the market maker?
    p: string; // "0.001"    Price
    q: string; // "100"      Quantity
    s: string; // "BTCUSDT"  Symbol
  };
  stream: string;
}
export interface IBinanceTickerPrice {
  symbol: string;
  price: string;
}
