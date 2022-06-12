import create from 'zustand';
import { persist } from 'zustand/middleware';
import { clientApiUrls } from 'src/utils/clientApiUrls';
import { IUpbitAccounts } from 'src-server/types/upbit';
import { v4 as uuidv4 } from 'uuid';
import { sign } from 'jsonwebtoken';
import { IUpbitErrorMessage } from 'src/types/upbit';

interface IAuthState {
  _hasHydrated: boolean;
  accessKey: string;
  secretKey: string;
  accounts: Array<IUpbitAccounts>;
}

const defaultState: IAuthState = {
  _hasHydrated: false,
  accessKey: '',
  secretKey: '',
  accounts: []
};

interface AuthStore extends IAuthState {
  setHasHydrated: (_hasHydrated: boolean) => void;
  registerKey: (
    accessKey: string,
    secretKey: string
  ) => Promise<Array<IUpbitAccounts> | IUpbitErrorMessage>;
  deleteKeys: () => void;
}

export const useUpbitAuthStore = create<AuthStore>(
  persist(
    (set, get) => ({
      ...defaultState,
      _hasHydrated: false,

      async registerKey(accessKey: string, secretKey: string) {
        const payload = {
          access_key: accessKey,
          nonce: uuidv4()
        };
        const res = await fetch(process.env.NEXT_PUBLIC_SOOROS_API + clientApiUrls.upbit.accounts, {
          headers: {
            Authorization: `Bearer ${sign(payload, secretKey)}`
          }
        });

        const accounts = (await res.json()) as Array<IUpbitAccounts> | IUpbitErrorMessage;
        if (Array.isArray(accounts)) {
          set({
            accessKey,
            secretKey,
            accounts
          });
        }
        return accounts;
      },
      deleteKeys() {
        set(() => ({
          ...defaultState
        }));
      },
      setHasHydrated(state) {
        set({
          _hasHydrated: state
        });
      }
    }),
    {
      name: 'upbitAuth', // unique name,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      serialize: (state) => window.btoa(JSON.stringify(state)),
      deserialize: (str) => JSON.parse(window.atob(str)),
      getStorage: () => localStorage // (optional) by default, 'localStorage' is used
    }
  )
);
