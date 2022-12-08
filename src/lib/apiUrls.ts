export const PROXY_ORIGIN = process.env.NEXT_PUBLIC_BASE_API_PROXY_ORIGIN || '';
export const PROXY_PATH = process.env.NEXT_PUBLIC_BASE_API_PROXY_ORIGIN ? '/api/proxy' : '';
export const API_PATH = process.env.NEXT_PUBLIC_BASE_API_PATH || '/api/v1';

export const apiUrls = {
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
  },
  coinmarketcap: {
    path: '/api/v1/coinmarketcap',
    cryptocurrency: {
      quotes: {
        latest: '/cryptocurrency/quotes/latest'
      }
    }
  },
  coincodex: {
    origin: 'https://coincodex.com/api',
    path: '/api/v1',
    rewritePath: '/api/coincodex',
    getCoin: '/coincodex/get_coin/',
    getMetadata: '/coincodex/get_metadata'
  }
} as const;
