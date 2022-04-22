import { IMarketTableItem } from 'src/components/market-table/MarketTable';
import create from 'zustand';
import { devtools } from 'zustand/middleware';
import { persist } from 'zustand/middleware';

const DEFAULT_FONT_SIZE = 14;
const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 18;

interface ITradingViewSettingState {
  selectedMarketSymbol: string;
  selectedExchange: 'BINANCE' | 'UPBIT';
}

interface ITradingViewSettingStore extends ITradingViewSettingState {
  setSelectedMarketSymbol: (symbol: string) => void;
  setSelectedExchange: (exchange: ITradingViewSettingState['selectedExchange']) => void;
}

const defaultState: ITradingViewSettingState = {
  selectedMarketSymbol: 'BTC',
  selectedExchange: 'BINANCE'
};

export const useTradingViewSettingStore = create<ITradingViewSettingStore>(
  persist(
    devtools((set, get) => ({
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
    })),
    {
      name: 'tradingViewSetting', // unique name
      getStorage: () => localStorage // (optional) by default, 'localStorage' is used
    }
  )
);
