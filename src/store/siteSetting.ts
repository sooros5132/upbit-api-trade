import create from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_FONT_SIZE = 14;
const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 18;

interface ISiteSettingState {
  hydrated: boolean;
  theme: 'dark' | 'light' | 'black';
  isLastUpdatePage: boolean;
  fontSize: number;
  highlight: boolean;
  visibleMyAccounts: boolean;
  visibleCurrencyBalances: boolean;
  subscribeChartCodes: Array<{
    exchange: 'BINANCE' | 'UPBIT';
    code: string;
  }>;
}

export const defaultSubscribeChartCodes = [
  {
    exchange: 'UPBIT',
    code: 'BTC'
  },
  {
    exchange: 'UPBIT',
    code: 'ETH'
  },
  {
    exchange: 'BINANCE',
    code: 'BTC'
  },
  {
    exchange: 'BINANCE',
    code: 'ETH'
  }
] as const;

const defaultState: ISiteSettingState = {
  hydrated: false,
  theme: 'black',
  isLastUpdatePage: false,
  fontSize: 14,
  highlight: true,
  visibleMyAccounts: true,
  visibleCurrencyBalances: true,
  subscribeChartCodes: [...defaultSubscribeChartCodes].slice(2)
};

interface ISiteSettingStore extends ISiteSettingState {
  setHydrated: () => void;
  showMyAccounts: () => void;
  hideMyAccounts: () => void;
  changeTheme: (mode: ISiteSettingState['theme']) => void;
  changeFontSize: (fontSize: number) => void;
  showCurrencyBalances: () => void;
  hideCurrencyBalances: () => void;
  setSubscribeChartCodes: (chart: ISiteSettingState['subscribeChartCodes']) => void;
}

export const useSiteSettingStore = create(
  persist<ISiteSettingStore>(
    (set, get) => ({
      ...defaultState,
      setHydrated() {
        set({
          hydrated: true
        });
      },
      showMyAccounts() {
        set({
          visibleMyAccounts: true
        });
      },
      hideMyAccounts() {
        set({
          visibleMyAccounts: false
        });
      },
      changeTheme(theme: ISiteSettingState['theme']) {
        set({
          theme
        });
      },
      changeFontSize(fontSize: number) {
        set({
          fontSize: isNaN(fontSize)
            ? DEFAULT_FONT_SIZE
            : fontSize < MIN_FONT_SIZE
            ? MIN_FONT_SIZE
            : fontSize > MAX_FONT_SIZE
            ? MAX_FONT_SIZE
            : fontSize
        });
      },
      showCurrencyBalances() {
        set({ visibleCurrencyBalances: true });
      },
      hideCurrencyBalances() {
        set({ visibleCurrencyBalances: false });
      },
      setSubscribeChartCodes(subscribeChartCodes) {
        set({ subscribeChartCodes });
      }
    }),
    {
      name: 'siteSetting', // unique name
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => !['hydrated', 'theme', 'isLastUpdatePage'].includes(key)
          )
        ) as ISiteSettingStore,
      getStorage: () => localStorage, // (optional) by default, 'localStorage' is used
      version: 0.1
      // partialize: (state) =>
      //   Object.fromEntries(
      //     Object.entries(state).filter(
      //       ([key]) => !['selectedMarketSymbol', 'selectedExchange'].includes(key)
      //     )
      //   )
    }
  )
);
