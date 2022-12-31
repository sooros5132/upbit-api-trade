import create from 'zustand';
import { persist } from 'zustand/middleware';
import { apiUrls, PROXY_PATH } from 'src/lib/apiUrls';
import { v4 as uuidv4 } from 'uuid';
import {
  IUpbitAccount,
  IUpbitCreateOrderResponse,
  IUpbitCreateOrderRquestParameters,
  IUpbitDeleteOrderResponse,
  IUpbitDeleteOrderRquestParameters,
  IUpbitErrorMessage,
  IUpbitGetOrderResponse,
  IUpbitGetOrderRquestParameters,
  IUpbitOrdersChance
} from 'src/types/upbit';
import queryString from 'query-string';
import crypto from 'crypto';
import axios from 'axios';
import { useExchangeStore } from './exchangeSockets';
import { signJWT } from 'src/utils/utils';

export interface IUpbitApiState {
  isLogin: boolean;
  accessKey: string;
  secretKey: string;
  accounts: Array<IUpbitAccount>;
  orders: Array<IUpbitGetOrderResponse>;
  ordersChance?: IUpbitOrdersChance;
  upbitTradeMarket: string;
}

const defaultState: IUpbitApiState = {
  isLogin: false,
  accessKey: '',
  secretKey: '',
  accounts: [],
  orders: [],
  ordersChance: undefined,
  upbitTradeMarket: 'KRW-BTC'
};

type createJwtAuthorizationTokenParam = {
  querys: Record<string, any>;
  serializedQueryString?: string;
  accessKey: string;
  secretKey: string;
};

function createJwtAuthorizationToken({
  accessKey,
  secretKey,
  querys,
  serializedQueryString
}: createJwtAuthorizationTokenParam) {
  const query = serializedQueryString ? serializedQueryString : queryString.stringify(querys);

  const hash = crypto.createHash('sha512');
  const queryHash = hash.update(query, 'utf-8').digest('hex');

  const payload = {
    access_key: accessKey,
    nonce: uuidv4(),
    query_hash: queryHash,
    query_hash_alg: 'SHA512'
  };

  const token = signJWT(payload, secretKey);

  return token;
}

interface IUpbitApiStore extends IUpbitApiState {
  registerKey: (
    accessKey: string,
    secretKey: string
  ) => Promise<Array<IUpbitAccount> | IUpbitErrorMessage>;
  revalidateKeys: () => Promise<void>;
  resetAll: () => void;
  setUpbitTradeMarket: (code: string) => void;
  getOrdersChance: (market: string) => Promise<void>;
  getOrders: (querys: IUpbitGetOrderRquestParameters) => Promise<void>;
  createOrder: (querys: IUpbitCreateOrderRquestParameters) => Promise<IUpbitCreateOrderResponse>;
  deleteOrder: (querys: IUpbitDeleteOrderRquestParameters) => Promise<IUpbitDeleteOrderResponse>;
}

export const useUpbitApiStore = create(
  persist<IUpbitApiStore>(
    (set, get) => ({
      ...defaultState,
      async registerKey(accessKey: string, secretKey: string) {
        const payload = {
          access_key: accessKey,
          nonce: uuidv4()
        };

        const accounts = await axios
          .get<Array<IUpbitAccount> | IUpbitErrorMessage>(
            PROXY_PATH + apiUrls.upbit.path + apiUrls.upbit.accounts,
            {
              headers: {
                Authorization: `Bearer ${signJWT(payload, secretKey)}`
              }
            }
          )
          .then((res) => {
            return res.data;
          })
          .catch((res) => {
            return res?.response?.data || '알 수 없는 에러';
          });

        if (Array.isArray(accounts)) {
          set({
            accessKey,
            secretKey,
            accounts,
            isLogin: true
          });
        }
        return accounts;
      },
      async revalidateKeys() {
        const { accessKey, secretKey } = get();

        if (!accessKey || !secretKey) {
          set({ ...defaultState });
          return;
        }

        await this.registerKey(accessKey, secretKey);
      },
      resetAll() {
        set(() => ({
          ...defaultState
        }));
      },
      setUpbitTradeMarket(code) {
        set({
          upbitTradeMarket: code
        });
        useExchangeStore.getState().connectUpbitSocket();
      },
      async getOrdersChance(market: string) {
        const { accessKey, secretKey } = get();
        if (!accessKey || !secretKey) {
          return;
        }
        const token = createJwtAuthorizationToken({
          accessKey,
          secretKey,
          querys: { market }
        });

        const result = await axios
          .get<IUpbitOrdersChance>(PROXY_PATH + apiUrls.upbit.path + apiUrls.upbit.ordersChance, {
            params: {
              market
            },
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then((res) => res.data);
        set({
          ordersChance: result
        });
      },
      async getOrders(querys) {
        const { accessKey, secretKey } = get();
        if (!accessKey || !secretKey) {
          return;
        }
        const serializedQueryString = queryString.stringify(querys);
        const token = createJwtAuthorizationToken({
          accessKey,
          secretKey,
          querys,
          serializedQueryString
        });

        const result = await axios
          .get<Array<IUpbitGetOrderResponse>>(
            PROXY_PATH + apiUrls.upbit.path + apiUrls.upbit.orders + '?' + serializedQueryString,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          )
          .then((res) => res.data);

        set({
          orders: result
        });
      },
      async createOrder(querys) {
        const { accessKey, secretKey } = get();
        const serializedQueryString = queryString.stringify({ ...querys, identifier: uuidv4() });

        const token = createJwtAuthorizationToken({
          accessKey,
          secretKey,
          querys,
          serializedQueryString
        });
        const result = await axios
          .post<IUpbitCreateOrderResponse>(
            PROXY_PATH + apiUrls.upbit.path + apiUrls.upbit.orders + '?' + serializedQueryString,
            null,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          )
          .then((res) => res.data);

        return result;
      },
      async deleteOrder(querys) {
        const { accessKey, secretKey } = get();
        const serializedQueryString = queryString.stringify(querys);
        const token = createJwtAuthorizationToken({
          accessKey,
          secretKey,
          querys,
          serializedQueryString
        });
        const result = await axios
          .delete<IUpbitDeleteOrderResponse>(
            PROXY_PATH + apiUrls.upbit.path + apiUrls.upbit.order + '?' + serializedQueryString,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          )
          .then((res) => res.data);

        return result;
      }
    }),
    {
      name: 'upbitApi', // unique name,
      serialize: (state) => window.btoa(JSON.stringify(state)),
      deserialize: (str) => JSON.parse(window.atob(str)),
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => ['accessKey', 'secretKey'].includes(key))
        ) as IUpbitApiStore,
      getStorage: () => localStorage, // (optional) by default, 'localStorage' is used
      version: 0.1
    }
  )
);
