import create from 'zustand';
import { persist } from 'zustand/middleware';

interface ITradingViewSettingState {
  selectedMarketSymbol: string;
  selectedExchange: 'BINANCE' | 'UPBIT';
  scriptLoaded: boolean;
}

interface ITradingViewSettingStore extends ITradingViewSettingState {
  setSelectedMarketSymbol: (symbol: string) => void;
  setSelectedExchange: (exchange: ITradingViewSettingState['selectedExchange']) => void;
}

const defaultState: ITradingViewSettingState = {
  selectedMarketSymbol: 'BTC',
  selectedExchange: 'BINANCE',
  scriptLoaded: false
};

export const useTradingViewSettingStore = create<ITradingViewSettingStore>(
  persist(
    (set, get) => ({
      ...defaultState,
      setSelectedMarketSymbol(symbol: ITradingViewSettingState['selectedMarketSymbol']) {
        set(() => ({
          selectedMarketSymbol: symbol
        }));
      },
      setSelectedExchange(exchange: ITradingViewSettingState['selectedExchange']) {
        set(() => ({
          selectedExchange: exchange
        }));
      }
    }),
    {
      name: 'tradingViewSetting', // unique name
      getStorage: () => localStorage, // (optional) by default, 'localStorage' is used
      partialize: (state) =>
        Object.fromEntries(Object.entries(state).filter(([key]) => !['scriptLoaded'].includes(key)))
    }
  )
);
