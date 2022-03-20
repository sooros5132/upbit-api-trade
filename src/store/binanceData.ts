import create from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';
import createContext from 'zustand/context';
import { IBinanceSocketMessageTicker } from 'src/types/binance';

interface IBinanceDataState {
  marketSocketData: Record<string, IBinanceSocketMessageTicker>;
}

const defaultState: IBinanceDataState = {
  marketSocketData: {}
};

interface IBinanceDataStore extends IBinanceDataState {
  setMarketSocketData: (data: IBinanceDataState['marketSocketData']) => void;
}

export const initStore = () => {
  const createStore = () =>
    create<IBinanceDataStore>(
      // persist(
      devtools((set, get) => ({
        ...defaultState,
        setMarketSocketData: (data) => {
          set({ marketSocketData: { ...data } });
        }
      }))
    );

  return createStore;
};

export const { Provider: BinanceDataStoreProvider, useStore: useBinanceDataStore } =
  createContext<IBinanceDataStore>();
export const createBinanceDataStore = initStore();
