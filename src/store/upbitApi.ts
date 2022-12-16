import create from 'zustand';
import { persist } from 'zustand/middleware';
import { apiUrls, PROXY_PATH } from 'src/lib/apiUrls';
import { v4 as uuidv4 } from 'uuid';
import { sign } from 'jsonwebtoken';
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

export interface IUpbitApiState {
  isUpbitLogined: boolean;
  accessKey: string;
  secretKey: string;
  accounts: Array<IUpbitAccount>;
  upbitTradeMarket: string;
}

const defaultState: IUpbitApiState = {
  isUpbitLogined: false,
  accessKey: '',
  secretKey: '',
  accounts: [],
  upbitTradeMarket: 'KRW-BTC'
};

interface IUpbitApiStore extends IUpbitApiState {
  registerKey: (
    accessKey: string,
    secretKey: string
  ) => Promise<Array<IUpbitAccount> | IUpbitErrorMessage>;
  revalidateKeys: () => Promise<void>;
  resetAll: () => void;
  setUpbitTradeMarket: (code: string) => void;
  createJwtAuthorizationToken: (
    querys: Record<string, any>,
    serializedQueryString?: string
  ) => string;
  getOrdersChange: (market: string) => Promise<IUpbitOrdersChance>;
  getOrders: (querys: IUpbitGetOrderRquestParameters) => Promise<Array<IUpbitGetOrderResponse>>;
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
                Authorization: `Bearer ${sign(payload, secretKey)}`
              }
            }
          )
          .then((res) => res.data)
          .catch((res) => {
            return res?.response?.data || '알 수 없는 에러';
          });

        if (Array.isArray(accounts)) {
          set({
            accessKey,
            secretKey,
            accounts,
            isUpbitLogined: true
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
      },
      async getOrdersChange(market: string) {
        const { createJwtAuthorizationToken } = get();
        const token = createJwtAuthorizationToken({ market });

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

        return result;
      },
      async getOrders(querys) {
        const { createJwtAuthorizationToken } = get();
        const serializedQueryString = queryString.stringify(querys);
        const token = createJwtAuthorizationToken(querys, serializedQueryString);
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

        return result;
      },
      async createOrder(querys) {
        const { createJwtAuthorizationToken } = get();
        const serializedQueryString = queryString.stringify({ ...querys, identifier: uuidv4() });
        const token = createJwtAuthorizationToken(querys, serializedQueryString);
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
        const { createJwtAuthorizationToken } = get();
        const serializedQueryString = queryString.stringify(querys);
        const token = createJwtAuthorizationToken(querys);

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
      },
      createJwtAuthorizationToken(querys, serializedQueryString) {
        const { accessKey, secretKey } = get();
        const query = serializedQueryString ? serializedQueryString : queryString.stringify(querys);

        const hash = crypto.createHash('sha512');
        const queryHash = hash.update(query, 'utf-8').digest('hex');

        const payload = {
          access_key: accessKey,
          nonce: uuidv4(),
          query_hash: queryHash,
          query_hash_alg: 'SHA512'
        };

        const token = sign(payload, secretKey);

        return token;
      }
    }),
    {
      name: 'upbitApi', // unique name,
      serialize: (state) => window.btoa(JSON.stringify(state)),
      deserialize: (str) => JSON.parse(window.atob(str)),
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => !['hydrated', 'theme', 'upbitTradeMarket'].includes(key)
          )
        ) as IUpbitApiStore,
      getStorage: () => localStorage, // (optional) by default, 'localStorage' is used
      version: 0.1
    }
  )
);
