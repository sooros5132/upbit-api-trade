export const clientApiUrls = {
  upbit: {
    forexRecent: '/upbit/forex/recent',
    marketAll: '/upbit/market/all',
    marketHref: 'https://upbit.com/exchange?code=CRIX.UPBIT.',
    ticker: '/upbit/ticker',
    websocket: 'wss://api.upbit.com/websocket/v1',
    accounts: '/upbit/accounts',
    ordersChance: '/upbit/orders/chance',
    order: '/upbit/order',
    orders: '/upbit/orders',
    withdraw: '/upbit/withdraw',
    withdraws: '/upbit/withdraws',
    withdrawsChance: '/upbit/withdraws/chance',
    withdrawsCoin: '/upbit/withdraws/coin',
    withdrawsKrw: '/upbit/withdraws/krw',
    deposits: '/upbit/deposits',
    deposit: '/upbit/deposit',
    depositsGenerateCoinAddress: '/upbit/deposits/generate_coin_address',
    depositsCoinAddresses: '/upbit/deposits/coin_addresses',
    depositsCoinAddress: '/upbit/deposits/coin_address',
    depositsKrw: '/upbit/deposits/krw',
    statusWallet: '/upbit/status/wallet',
    apiKeys: '/upbit/api_keys'
  },
  binance: {
    websocket: 'wss://fstream.binance.com/stream',
    marketHref: 'https://www.binance.com/en/trade/'
  }
} as const;
