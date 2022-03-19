import create from "zustand";
import { devtools } from "zustand/middleware";
import createContext from "zustand/context";
import { persist } from "zustand/middleware";
import { sign } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

interface IAuthState {
  accessKey: string;
  secretKey: string;
  authToken: string;
}

interface ITokenPayload {
  access_key: string;
  nonce: string;
}

const defaultState: IAuthState = {
  accessKey: "",
  secretKey: "",
  authToken: "",
};

interface AuthStore extends IAuthState {
  createToken: (accessKey: string, secretKey: string) => void;
  logout: () => void;
}

export const initStore = () => {
  const createStore = () =>
    create<AuthStore>(
      persist(
        devtools((set, get) => ({
          ...defaultState,
          createToken: (accessKey, secretKey) =>
            set(() => {
              const payload: ITokenPayload = {
                access_key: accessKey,
                nonce: uuidv4(),
              };
              return {
                accessKey,
                secretKey,
                authToken: sign(payload, secretKey),
              };
            }),
          logout: () =>
            set(() => ({
              ...defaultState,
            })),
        })),
        {
          name: "upbitAuth", // unique name
          getStorage: () => localStorage, // (optional) by default, 'localStorage' is used
        }
      )
    );

  return createStore;
};

export const { Provider: UpbitAuthStoreProvider, useStore: useUpbitAuthStore } =
  createContext<AuthStore>();
export const createUpbitAuthStore = initStore();
