export interface IUpbitAccounts {
  avg_buy_price: string;
  avg_buy_price_modified: boolean;
  balance: string;
  currency: string;
  locked: string;
  unit_currency: string;
}

export interface IUpbitOrdersChance {
  ask_fee: string;
  market: {
    id: string;
    name: string;
    order_types: Array<string>;
    order_sides: Array<string>;
    bid: {
      currency: string;
      price_unit: string;
      min_total: number;
    };
    ask: {
      currency: string;
      price_unit: string;
      min_total: number;
    };
    max_total: string;
    state: string;
  };
  bid_account: {
    currency: string;
    balance: string;
    locked: string;
    avg_buy_price: string;
    avg_buy_price_modified: boolean;
    unit_currency: string;
  };
  ask_account: {
    currency: string;
    balance: string;
    locked: string;
    avg_buy_price: string;
    avg_buy_price_modified: boolean;
    unit_currency: string;
  };
}
