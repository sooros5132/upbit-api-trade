export const clientApiUrls = {
  upbit: {
    origin: 'https://api.upbit.com/v1',
    path: '/api/v1/upbit',
    rewriteUrl: '/api/upbit',
    websocket: 'wss://api.upbit.com/websocket/v1',
    marketHref: 'https://upbit.com/exchange?code=CRIX.UPBIT.',
    forex: {
      recent: '/forex/recent'
    },
    market: {
      all: '/market/all'
    },
    ticker: '/ticker',
    accounts: '/accounts',
    ordersChance: '/orders/chance',
    order: '/order',
    orders: '/orders',
    withdraw: '/withdraw',
    withdraws: '/withdraws',
    withdrawsChance: '/withdraws/chance',
    withdrawsCoin: '/withdraws/coin',
    withdrawsKrw: '/withdraws/krw',
    deposits: '/deposits',
    deposit: '/deposit',
    depositsGenerateCoinAddress: '/deposits/generate_coin_address',
    depositsCoinAddresses: '/deposits/coin_addresses',
    depositsCoinAddress: '/deposits/coin_address',
    depositsKrw: '/deposits/krw',
    statusWallet: '/status/wallet',
    apiKeys: '/api_keys'
  },
  binance: {
    origin: 'https://www.binance.com/api/v3',
    rewriteUrl: '/api/binance',
    websocket: 'wss://stream.binance.com/stream',
    marketHref: 'https://www.binance.com/en/trade',
    ticker: {
      price: '/ticker/price'
    }
  }
} as const;
