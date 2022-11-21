import create from 'zustand';
import { persist } from 'zustand/middleware';
import { apiUrls, PROXY_PATH } from 'src/lib/apiUrls';
import { IUpbitAccounts } from 'src-server/types/upbit';
import { v4 as uuidv4 } from 'uuid';
import { sign } from 'jsonwebtoken';
import { IUpbitErrorMessage } from 'src/types/upbit';
import axios from 'axios';

interface IAuthState {
  accessKey: string;
  secretKey: string;
  accounts: Array<IUpbitAccounts>;
}

const defaultState: IAuthState = {
  accessKey: '',
  secretKey: '',
  accounts: []
};

interface AuthStore extends IAuthState {
  registerKey: (
    accessKey: string,
    secretKey: string
  ) => Promise<Array<IUpbitAccounts> | IUpbitErrorMessage>;
  revalidate: () => Promise<void>;
  deleteKeys: () => void;
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
          .get<Array<IUpbitAccounts> | IUpbitErrorMessage>(
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
            accounts
          });
        }
        return accounts;
      },
      async revalidate() {
        const { accessKey, secretKey } = get();

        if (!accessKey || !secretKey) {
          set({ ...defaultState });
          return;
        }

        await this.registerKey(accessKey, secretKey);
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
      getStorage: () => localStorage // (optional) by default, 'localStorage' is used
    }
  )
);
