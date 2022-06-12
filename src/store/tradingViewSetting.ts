import create from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_FONT_SIZE = 14;
const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 18;

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
