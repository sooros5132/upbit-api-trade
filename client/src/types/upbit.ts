export interface IUpbitForex {
  code: string; // "FRX.KRWUSD"
  currencyCode: string; // "USD"
  currencyName: string; // "달러"
  country: string; // "미국"
  name: string; // "미국 (KRW/USD)"
  date: string; // "2022-02-28"
  time: string; // "21:01:28"
  recurrenceCount: number; // 332
  basePrice: number; // 1204.5
  openingPrice: number; // 1202.7
  highPrice: number; // 1208.4
  lowPrice: number; // 1198
  change: string; // "EVEN"
  changePrice: number; // 0
  cashBuyingPrice: number; // 1225.57
  cashSellingPrice: number; // 1183.43
  ttBuyingPrice: number; // 1192.7
  ttSellingPrice: number; // 1216.3
  tcBuyingPrice: number; // null
  fcSellingPrice: number; // null
  exchangeCommission: number; // 2.045
  usDollarRate: number; // 1
  high52wPrice: number; // 1211.5
  high52wDate: string; // "2022-01-28"
  low52wPrice: number; // 1105.2
  low52wDate: string; // "2021-06-01"
  currencyUnit: number; // 1
  provider: string; // "하나은행"
  timestamp: number; // 1646049689346
  id: number; // 79
  createdAt: string; // "2016-10-21T06:13:34.000+0000"
  modifiedAt: string; // "2022-02-28T12:01:29.000+0000"
  signedChangePrice: number; // 0
  signedChangeRate: number; // 0
  changeRate: number; // 0
}

export interface IUpbitMarket {
  market: string;
  korean_name: string;
  english_name: string;
}
export interface IUpbitSocketMessageTicker {
  type: string;
  code: string;
  opening_price: number;
  high_price: number;
  low_price: number;
  trade_price: number;
  prev_closing_price: number;
  change: string;
  change_price: number;
  signed_change_price: number;
  change_rate: number;
  signed_change_rate: number;
  trade_volume: number;
  acc_trade_volume: number;
  acc_trade_volume_24h: number;
  acc_trade_price: number;
  acc_trade_price_24h: number;
  trade_date: string;
  trade_time: string;
  trade_timestamp: number;
  ask_bid: string;
  acc_ask_volume: number;
  acc_bid_volume: number;
  highest_52_week_price: number;
  highest_52_week_date: string;
  lowest_52_week_price: number;
  lowest_52_week_date: string;
  // trade_status: string;
  market_state: string;
  market_warning: string;
  is_trading_suspended: boolean;
  delisting_date: string | null;
  timestamp: number;
  stream_type: string;
}

export interface IUpbitApiTicker {
  market: string;
  trade_date: string;
  trade_time: string;
  trade_date_kst: string;
  trade_time_kst: string;
  trade_timestamp: number;
  opening_price: number;
  high_price: number;
  low_price: number;
  trade_price: number;
  prev_closing_price: number;
  change: "RISE" | "EVEN" | "FALL";
  change_price: number;
  change_rate: number;
  signed_change_price: number;
  signed_change_rate: number;
  trade_volume: number;
  acc_trade_price: number;
  acc_trade_price_24h: number;
  acc_trade_volume: number;
  acc_trade_volume_24h: number;
  highest_52_week_price: number;
  highest_52_week_date: string;
  lowest_52_week_price: number;
  lowest_52_week_date: string;
  timestamp: number;
}

export interface IUpbitSocketMessageTickerSimple {
  ty: string;
  cd: string;
  op: number;
  hp: number;
  lp: number;
  tp: number;
  pcp: number;
  c: "RISE" | "EVEN" | "FALL";
  cp: number;
  scp: number;
  cr: number;
  scr: number;
  tv: number;
  atv: number;
  atv24h: number;
  atp: number;
  atp24h: number;
  tdt: string;
  ttm: string;
  ttms: number;
  ab: "ASK" | "BID";
  aav: number;
  abv: number;
  h52wp: number;
  h52wdt: string;
  l52wp: number;
  l52wdt: string;
  // trade_status: string;
  ms: "PREVIEW" | "ACTIVE" | "DELISTED";
  mw: "NONE" | "CAUTION";
  its: boolean;
  dd: string | null;
  tms: number;
  st: string;
}
