export interface IBinanceSocketMessage<T> {
  data: T;
  stream: string; // "sxpusdt@ticker" symbol
}

export interface IBinanceSocketTicker {
  e: string; // "24hrTicker", Event type
  E: number; // 123456789,    Event time
  s: string; // "BNBBTC",     Symbol
  p: string; // "0.0015",     Price change
  P: string; // "250.00",     Price change percent
  w: string; // "0.0018",     Weighted average price
  x: string; // "0.0009",     First trade(F)-1 price (first trade before the 24hr rolling window)
  c: string; // "0.0025",     Last price
  Q: string; // "10",         Last quantity
  b: string; // "0.0024",     Best bid price
  B: string; // "10",         Best bid quantity
  a: string; // "0.0026",     Best ask price
  A: string; // "100",        Best ask quantity
  o: string; // "0.0010",     Open price
  h: string; // "0.0025",     High price
  l: string; // "0.0010",     Low price
  v: string; // "10000",      Total traded base asset volume
  q: string; // "18",         Total traded quote asset volume
  O: number; // 0,            Statistics open time
  C: number; // 86400000,     Statistics close time
  F: number; // 0,            First trade ID
  L: number; // 18150,        Last trade Id
  n: number; // 18151         Total number of trades
}

export interface IBinanceSocketAggTrade {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  a: number; // Aggregate trade ID
  p: string; // Price
  q: string; // Quantity
  f: number; // First trade ID
  l: number; // Last trade ID
  T: number; // Trade time
  m: boolean; // Is the buyer the market maker?
  M: boolean; // Ignore
}

export interface IBinanceTickerPrice {
  symbol: string;
  price: string;
}

export type IBinanceFilterType =
  | 'PRICE_FILTER'
  | 'PERCENT_PRICE'
  | 'LOT_SIZE'
  | 'MIN_NOTIONAL'
  | 'ICEBERG_PARTS'
  | 'MARKET_LOT_SIZE'
  | 'TRAILING_DELTA'
  | 'MAX_NUM_ORDERS'
  | 'MAX_NUM_ALGO_ORDERS';

export interface IBinanceFilterPriceFilter {
  filterType: 'PRICE_FILTER'; // 'PRICE_FILTER';
  minPrice: string; // '0.01000000';
  maxPrice: string; // '1000000.00000000';
  tickSize: string; // '0.01000000';
}
export interface IBinanceFilterPercentPrice {
  filterType: 'PERCENT_PRICE'; // 'PERCENT_PRICE';
  multiplierUp: string; // '5';
  multiplierDown: string; // '0.2';
  avgPriceMins: number; // 5;
}

export interface IBinanceFilterLotSize {
  filterType: 'LOT_SIZE';
  minQty: string; //'0.00001000';
  maxQty: string; //'9000.00000000';
  stepSize: string; //'0.00001000';
}

export interface IBinanceFilterMinNotional {
  filterType: 'MIN_NOTIONAL';
  minNotional: string; // '10.00000000'
  applyToMarket: boolean; // true
  avgPriceMins: number; // 5
}

export interface IBinanceFilterIcebergParts {
  filterType: 'ICEBERG_PARTS';
  limit: number; // 10;
}

export interface IBinanceFilterMarketLotSize {
  filterType: 'MARKET_LOT_SIZE';
  minQty: string; // '0.00000000';
  maxQty: string; // '265.41425204';
  stepSize: string; // '0.00000000';
}

export interface IBinanceFilterTrailingDelta {
  filterType: 'TRAILING_DELTA';
  minTrailingAboveDelta: number; // 10;
  maxTrailingAboveDelta: number; // 2000;
  minTrailingBelowDelta: number; // 10;
  maxTrailingBelowDelta: number; // 2000;
}

export interface IBinanceFilterMaxNumOrders {
  filterType: 'MAX_NUM_ORDERS';
  maxNumOrders: number; // 200;
}

export interface IBinanceFilterMaxNumAlgoOrders {
  filterType: 'MAX_NUM_ALGO_ORDERS';
  maxNumAlgoOrders: number; // 5;
}

export type IBinanceFilter =
  | IBinanceFilterPriceFilter
  | IBinanceFilterPercentPrice
  | IBinanceFilterLotSize
  | IBinanceFilterMinNotional
  | IBinanceFilterIcebergParts
  | IBinanceFilterMarketLotSize
  | IBinanceFilterTrailingDelta
  | IBinanceFilterMaxNumOrders
  | IBinanceFilterMaxNumAlgoOrders;

export type IBinancePermission =
  | 'SPOT'
  | 'MARGIN'
  | 'LEVERAGED'
  | 'TRD_GRP_002'
  | 'TRD_GRP_003'
  | 'TRD_GRP_004'
  | 'TRD_GRP_005';

export type IBinanceOrderType =
  | 'LIMIT'
  | 'LIMIT_MAKER'
  | 'MARKET'
  | 'STOP_LOSS_LIMIT'
  | 'TAKE_PROFIT_LIMIT';

export interface IBinanceSymbol {
  symbol: string;
  status: string;
  baseAsset: string;
  baseAssetPrecision: number;
  quoteAsset: string;
  quotePrecision: number;
  quoteAssetPrecision: number;
  baseCommissionPrecision: number;
  quoteCommissionPrecision: number;
  orderTypes: Array<IBinanceOrderType>;
  icebergAllowed: boolean;
  ocoAllowed: boolean;
  quoteOrderQtyMarketAllowed: boolean;
  allowTrailingStop: boolean;
  cancelReplaceAllowed: boolean;
  isSpotTradingAllowed: boolean;
  isMarginTradingAllowed: boolean;
  filters: Array<IBinanceFilter>;
  permissions: Array<IBinancePermission>;
}

export interface IBinanceExchangeInfo {
  timezone: string;
  serverTime: number;
  rateLimits: Array<{
    rateLimitType: string;
    interval: string;
    intervalNum: number;
    limit: number;
  }>;
  exchangeFilters: string[];
  symbols: IBinanceSymbol[];
}
export type IBinanceUiKline = Array<
  [
    number, //  0	number	// 1669530900000			// Kline open time
    string, //  1	string	// "16568.24000000"		// Open price
    string, //  2	string	// "16573.25000000"		// High price
    string, //  3	string	// "16567.55000000"		// Low price
    string, //  4	string	// "16572.41000000"		// Close price
    string, //  5	string	// "94.02252000"			// Volume
    number, //  6	number	// 1669530959999			// Kline close time
    string, //  7	string	// "1558086.05928610"	// Quote asset volume
    number, //  8	number	// 2253								// Number of trades
    string, //  9	string	// "45.24841000"			// Taker buy base asset volume
    string, // 10	string	// "749823.36320890"	// Taker buy quote asset volume
    string //  11	string	// "0"								// Unused field. Ignore.
  ]
>;
