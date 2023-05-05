import create from 'zustand';
import { useExchangeStore } from './exchangeSockets';
import { cloneDeep } from 'lodash';
import { delay, upbitDecimalScale, upbitOrderPriceCorrection } from 'src/utils/utils';
import numeral from 'numeral';
import { useUpbitApiStore } from './upbitApi';
import { toast } from 'react-toastify';

type OrderFormType = {
  balanceRange: number;
  priceRange: number;
  volume: number;
  krwVolume: number;
  price: number;
};

export type OrderSideType = 'ask' | 'bid';
export type OrderType = 'price' | 'limit' | 'market' | 'spider';
export type RangeType = 'balance' | 'price';
export type NumericValueType = 'volume' | 'krwVolume' | 'price';

interface UpbitOrderFormState {
  // 지정가 = LIMIT
  // 시장가 = MARKET
  orderType: OrderType;
  ask: OrderFormType;
  bid: OrderFormType;
}

interface UpbitOrderFormStore extends UpbitOrderFormState {
  changeRange: (rangeType: RangeType, side: OrderSideType, value: number) => void;
  changeOrderType: (orderType: OrderType) => void;
  changeNumericValue: (
    valueKey: NumericValueType,
    side: OrderSideType,
    numericValue: string
  ) => void;
  createOrder: (side: OrderSideType) => Promise<void>;
  resetOrderValues: (side: OrderSideType, market?: string) => void;
}

const defaultState: UpbitOrderFormState = {
  orderType: 'limit',

  ask: {
    balanceRange: 0,
    priceRange: 0,
    volume: 0,
    krwVolume: 0,
    price: 0
  },
  bid: {
    balanceRange: 0,
    priceRange: 0,
    volume: 0,
    krwVolume: 0,
    price: 0
  }
};

export const useUpbitOrderFormStore = create<UpbitOrderFormStore>((set, get) => ({
  ...defaultState,
  changeRange(rangeType, side, percentage) {
    const state = get();
    const { orderType } = state;
    const ordersChance = useUpbitApiStore.getState().ordersChance;

    if (!ordersChance) {
      return;
    }
    const ORDER_FEE = Number(ordersChance[`${side}_fee`]);
    const BALANCE = Number(ordersChance[`${side}_account`].balance);
    const MARKET_CODE = ordersChance.market.id;
    let ask = cloneDeep(state.ask);
    let bid = cloneDeep(state.bid);
    let newPrice = 0;

    switch (orderType) {
      case 'price':
      case 'market': {
        const orderbook = useExchangeStore.getState()?.upbitOrderbook?.obu;
        if (!orderbook) {
          return;
        }
        switch (side) {
          case 'ask': {
            const currentPrice = orderbook[0]?.bp;
            newPrice = currentPrice ?? ask.price;
            break;
          }
          case 'bid': {
            const currentPrice = orderbook[0]?.ap;
            newPrice = currentPrice ?? bid.price;
            break;
          }
        }
        break;
      }
      case 'limit': {
        const orderbook = useExchangeStore.getState()?.upbitOrderbook?.obu;
        if (!orderbook) {
          return;
        }
        switch (side) {
          case 'ask': {
            const currentPrice = orderbook[0]?.bp;
            newPrice = upbitOrderPriceCorrection(currentPrice * (1 + percentage / 100));
            break;
          }
          case 'bid': {
            const currentPrice = orderbook[0]?.bp;
            newPrice = upbitOrderPriceCorrection(currentPrice * (1 + percentage / 100));
            break;
          }
        }
        break;
      }
    }

    switch (side) {
      case 'bid': {
        switch (rangeType) {
          case 'price': {
            bid.krwVolume = Math.round(bid.volume * newPrice * (1 + ORDER_FEE));

            const newBalanceRange = Math.round((bid.krwVolume / BALANCE) * 100);
            bid.balanceRange = newBalanceRange || 0;
            bid.priceRange = percentage || 0;
            bid.price = newPrice;
            break;
          }
          case 'balance': {
            let newVolume = (BALANCE / bid.price) * (1 - ORDER_FEE) * (percentage / 100);

            bid.volume = Number(numeral(newVolume).format(`0.[00000000]`, Math.floor)) || 0;

            bid.krwVolume = Math.floor(bid.volume * bid.price * (1 + ORDER_FEE));
            bid.balanceRange = percentage || 0;
            break;
          }
        }
        break;
      }
      case 'ask': {
        switch (rangeType) {
          case 'price': {
            ask.krwVolume = Math.round(BALANCE * newPrice * (1 + ORDER_FEE));

            const newBalanceRange = Math.round((ask.volume / BALANCE) * 100);
            ask.balanceRange = newBalanceRange || 0;
            ask.priceRange = percentage || 0;
            ask.price = newPrice;
            break;
          }
          case 'balance': {
            ask.volume = BALANCE * (percentage / 100) || 0;

            ask.krwVolume = Math.floor(ask.volume * ask.price);
            ask.balanceRange = percentage || 0;
            break;
          }
        }
        break;
      }
    }
    switch (side) {
      case 'ask': {
        set({ ask });
        return;
      }
      case 'bid': {
        set({ bid });
        return;
      }
    }
  },
  changeNumericValue(valueKey, side, numericValue) {
    const value = numericValue?.replaceAll(',', '');
    const numberValue = Number(value);
    const state = get();
    const { orderType } = state;
    const ordersChance = useUpbitApiStore.getState().ordersChance;

    if (!ordersChance) {
      return;
    }

    const ORDER_FEE = Number(ordersChance[`${side}_fee`]);
    const BALANCE = Number(side === 'ask' ? '0.1' : ordersChance[`${side}_account`].balance);
    // const BALANCE = Number(ordersChance[`${side}_account`].balance);
    // const MARKET_CODE = ordersChance.market.id;

    let ask = cloneDeep(state.ask);
    let bid = cloneDeep(state.bid);

    switch (orderType) {
      case 'price':
      case 'market': {
        switch (side) {
          case 'bid': {
            const currentPrice = useExchangeStore.getState()?.upbitOrderbook?.obu?.[0]?.ap;
            bid.price = currentPrice ?? bid.price;
            bid.priceRange = 0;
            break;
          }
          case 'ask': {
            const currentPrice = useExchangeStore.getState()?.upbitOrderbook?.obu?.[0]?.bp;
            ask.price = currentPrice ?? ask.price;
            ask.priceRange = 0;
            break;
          }
        }
        break;
      }
    }

    switch (side) {
      case 'bid': {
        switch (valueKey) {
          case 'price': {
            if (!['price', 'market'].includes(orderType)) {
              bid.price = Number(numberValue.toFixed(upbitDecimalScale(numberValue)));
            }
            bid.krwVolume = Math.round(bid.volume * bid.price * (1 + ORDER_FEE));
            break;
          }
          case 'volume': {
            bid.volume = numberValue;
            bid.krwVolume = Math.round(bid.volume * bid.price * (1 + ORDER_FEE));
            break;
          }
          case 'krwVolume': {
            bid.krwVolume = numberValue;
            bid.volume =
              Number(
                numeral((bid.krwVolume * (1 - ORDER_FEE)) / bid.price).format(
                  `0.[00000000]`,
                  Math.round
                )
              ) || 0;
            break;
          }
        }
        break;
      }
      case 'ask': {
        switch (valueKey) {
          case 'price': {
            if (!['price', 'market'].includes(orderType)) {
              ask.price = Number(numberValue.toFixed(upbitDecimalScale(numberValue)));
            }
            ask.krwVolume = Math.round(ask.volume * ask.price);
            break;
          }
          case 'volume': {
            ask.volume = numberValue;
            ask.krwVolume = Math.round(ask.volume * ask.price);
            break;
          }
          case 'krwVolume': {
            ask.krwVolume = numberValue;
            ask.volume =
              Number(numeral(ask.krwVolume / ask.price).format(`0.[00000000]`, Math.round)) || 0;
            break;
          }
        }
        break;
      }
    }

    switch (side) {
      case 'ask': {
        ask.balanceRange = Math.round((ask.krwVolume / BALANCE) * 100);
        set({ ask });
        return;
      }
      case 'bid': {
        bid.balanceRange = Math.round((bid.krwVolume / BALANCE) * 100);
        set({ bid });
        return;
      }
    }
  },
  changeOrderType(orderType: OrderType) {
    set({
      orderType
    });
  },
  resetOrderValues(side: OrderSideType, market?: string) {
    const currentPrice = market
      ? useExchangeStore.getState()?.upbitMarketDatas?.[market.toUpperCase()]?.tp || 0
      : 0;
    set({
      [side]: {
        balanceRange: 0,
        priceRange: 0,
        volume: 0,
        krwVolume: 0,
        price: currentPrice
      }
    });
  },
  async createOrder(side: OrderSideType) {
    const {
      ordersChance,
      upbitTradeMarket,
      revalidateOrders,
      revalidateOrdersChance,
      createOrder
    } = useUpbitApiStore.getState();

    if (!ordersChance) {
      return;
    }
    const state = get();
    const values = state[side];
    const orderType = state.orderType;
    const marketCode = ordersChance.market.id;

    switch (orderType) {
      case 'limit': {
        // 지정가 주문
        const { volume, price } = values;
        if (!side || volume === 0 || price === 0) {
          return;
        }
        const params = {
          market: marketCode,
          side,
          volume: volume.toString(),
          price: price.toString(),
          ord_type: 'limit'
        } as const;
        await createOrder(params)
          .then(async (res) => {
            toast.success(
              `${numeral(Number(res.price)).format(`0,0[.][0000]`)}가격에 ${numeral(
                Number(res.volume)
              ).format(`0,0[.][00000000]`)}만큼 주문을 넣었습니다.`
            );
            await delay(50);
            await Promise.all([revalidateOrdersChance(), revalidateOrders()]);
          })
          .catch((err) => {
            toast.error(err?.error?.message ?? '주문에 실패했습니다.');
          });
        break;
      }
      case 'price':
      case 'market': {
        // 시장가 주문
        switch (side) {
          case 'bid': {
            // 시장가 매수
            const { krwVolume } = values;
            if (!side || krwVolume === 0) {
              return;
            }
            const params = {
              market: marketCode,
              side,
              price: krwVolume.toString(),
              ord_type: 'price'
            } as const;

            const createResult = await createOrder(params).catch((err) => {
              toast.error(err?.error?.message ?? '시장가 매도주문을 실패했습니다.');
            });
            if (!createResult) {
              return;
            }
            toast.success(
              `${numeral(Number(createResult.price)).format(`0,0[.][0000]`)}가격에 ${numeral(
                Number(createResult.volume)
              ).format(`0,0[.][00000000]`)}만큼 시장가매수 주문을 넣었습니다.`
            );
            await delay(50);
            await Promise.all([revalidateOrdersChance(), revalidateOrders()]);
            break;
          }
          case 'ask': {
            // 시장가 매도
            const { volume } = values;
            if (!side || volume === 0) {
              return;
            }
            const params = {
              market: marketCode,
              side,
              volume: volume.toString(),
              ord_type: 'market'
            } as const;

            const createResult = await createOrder(params).catch((err) => {
              toast.error(err?.error?.message ?? '시장가 매수주문을 실패했습니다.');
            });
            if (!createResult) {
              return;
            }
            toast.success(
              `${numeral(Number(createResult.price)).format(`0,0[.][0000]`)}가격에 ${numeral(
                Number(createResult.volume)
              ).format(`0,0[.][00000000]`)}만큼 시장가매도 주문을 넣었습니다.`
            );
            await delay(50);
            await Promise.all([revalidateOrdersChance(), revalidateOrders()]);
            break;
          }
        }
        break;
      }
    }
  }
}));
