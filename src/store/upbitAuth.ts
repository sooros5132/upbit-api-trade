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

interface IAuthState {
  isUpbitLogined: boolean;
  accessKey: string;
  secretKey: string;
  accounts: Array<IUpbitAccount>;
}

const defaultState: IAuthState = {
  isUpbitLogined: false,
  accessKey: '',
  secretKey: '',
  accounts: []
};

interface AuthStore extends IAuthState {
  registerKey: (
    accessKey: string,
    secretKey: string
  ) => Promise<Array<IUpbitAccount> | IUpbitErrorMessage>;
  revalidate: () => Promise<void>;
  deleteKeys: () => void;
  createJwtAuthorizationToken: (
    querys: Record<string, any>,
    serializedQueryString?: string
  ) => string;
  getOrdersChange: (market: string) => Promise<IUpbitOrdersChance>;
  getOrders: (querys: IUpbitGetOrderRquestParameters) => Promise<Array<IUpbitGetOrderResponse>>;
  createOrder: (querys: IUpbitCreateOrderRquestParameters) => Promise<IUpbitCreateOrderResponse>;
  deleteOrder: (querys: IUpbitDeleteOrderRquestParameters) => Promise<IUpbitDeleteOrderResponse>;
}

export const useUpbitAuthStore = create(
  persist<AuthStore>(
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
      async revalidate() {
        const { accessKey, secretKey } = get();

        if (!accessKey || !secretKey) {
          set({ ...defaultState });
          return;
        }

        await this.registerKey(accessKey, secretKey);
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
      },
      deleteKeys() {
        set(() => ({
          ...defaultState
        }));
      }
    }),
    {
      name: 'upbitAuth', // unique name,
      serialize: (state) => window.btoa(JSON.stringify(state)),
      deserialize: (str) => JSON.parse(window.atob(str)),
      getStorage: () => localStorage, // (optional) by default, 'localStorage' is used
      version: 0.1
    }
  )
);
