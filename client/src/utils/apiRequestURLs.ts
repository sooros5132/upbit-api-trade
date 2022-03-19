export const apiRequestURLs = {
  upbit: {
    forex:
      "https://quotation-api-cdn.dunamu.com/v1/forex/recent?codes=FRX.KRWUSD",
    marketList: "https://api.upbit.com/v1/market/all?isDetails=false",
    marketTicker: "https://api.upbit.com/v1/ticker",
    websocket: "wss://api.upbit.com/websocket/v1",
  },
  binance: {
    websocket: "wss://fstream.binance.com/stream",
  },
} as const;
