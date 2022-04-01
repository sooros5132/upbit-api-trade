import create, { GetState } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';
import createContext from 'zustand/context';
import { persist } from 'zustand/middleware';
import { IUpbitAccounts } from 'src-server/type/upbit';

const DEFAULT_FONT_SIZE = 14;
const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 18;

interface ISiteSettingState {
  theme: 'dark' | 'light';
  fontSize: number;
  selectedMarketSymbol: string;
  selectedExchange: 'BINANCE' | 'UPBIT';
  showMyAccounts: boolean;
}

interface ISiteSettingStore extends ISiteSettingState {
  setSelectedMarketSymbol: (symbol: string) => void;
  setSelectedExchange: (exchange: ISiteSettingState['selectedExchange']) => void;
  setShowMyAccounts: (show: boolean) => void;
  changeTheme: (mode: ISiteSettingState['theme']) => void;
  changeFontSize: (fontSize: number) => void;
}

const defaultState: ISiteSettingState = {
  theme: 'dark',
  fontSize: 14,
  selectedMarketSymbol: 'BTC',
  selectedExchange: 'BINANCE',
  showMyAccounts: true
};

export const useSiteSettingStore = create<ISiteSettingStore>(
  persist(
    devtools((set, get) => ({
      ...defaultState,
      setSelectedMarketSymbol: (symbol: ISiteSettingState['selectedMarketSymbol']) =>
        set(() => ({
          selectedMarketSymbol: symbol
        })),
      setSelectedExchange: (exchange: ISiteSettingState['selectedExchange']) =>
        set(() => ({
          selectedExchange: exchange
        })),
      setShowMyAccounts: (show: boolean) =>
        set(() => ({
          showMyAccounts: show
        })),
      changeTheme: (theme: ISiteSettingState['theme']) =>
        set(() => ({
          theme
        })),

      changeFontSize: (fontSize: number) =>
        set(() => ({
          fontSize: isNaN(fontSize)
            ? DEFAULT_FONT_SIZE
            : fontSize < MIN_FONT_SIZE
            ? MIN_FONT_SIZE
            : fontSize > MAX_FONT_SIZE
            ? MAX_FONT_SIZE
            : fontSize
        }))
    })),
    {
      name: 'siteSetting', // unique name
      getStorage: () => localStorage, // (optional) by default, 'localStorage' is used
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => !['selectedMarketSymbol', 'selectedExchange'].includes(key)
          )
        )
    }
  )
);
