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

export const useBinanceDataStore = create<IBinanceDataStore>(
  // persist(
  devtools((set, get) => ({
    ...defaultState,
    setMarketSocketData: (data) => {
      set({ marketSocketData: { ...data } });
    }
  }))
);
