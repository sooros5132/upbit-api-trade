export interface ICoinmarketcapSuccess<T> {
  status: {
    timestamp: string;
    error_code: number;
    error_message: string;
    elapsed: number;
    credit_count: number;
    notice: string;
  };
  data: T;
}

export interface ICoinmarketcapCryptocurrencyQuote {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  num_market_pairs: number;
  date_added: string;
  tags: Array<{
    slug: string;
    name: string;
    category: string;
  }>;
  max_supply: number;
  circulating_supply: number;
  total_supply: number;
  is_active: number;
  platform: null;
  cmc_rank: number;
  is_fiat: number;
  self_reported_circulating_supply: null;
  self_reported_market_cap: null;
  tvl_ratio: null;
  last_updated: string;
  quote: Record<
    string,
    {
      price: number;
      volume_24h: number;
      volume_change_24h: number;
      percent_change_1h: number;
      percent_change_24h: number;
      percent_change_7d: number;
      percent_change_30d: number;
      percent_change_60d: number;
      percent_change_90d: number;
      market_cap: number;
      market_cap_dominance: number;
      fully_diluted_market_cap: number;
      tvl: null;
      last_updated: string;
    }
  >;
}
