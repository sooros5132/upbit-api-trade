import create from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_FONT_SIZE = 14;
const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 18;

interface ISiteSettingState {
  _hasHydrated: boolean;
  theme: 'dark' | 'light' | 'black';
  fontSize: number;
  showMyAccounts: boolean;
  headerHeight?: number;
  visibleBalances: boolean;
}

interface ISiteSettingStore extends ISiteSettingState {
  setHasHydrated: (_hasHydrated: boolean) => void;
  setShowMyAccounts: (show: boolean) => void;
  changeTheme: (mode: ISiteSettingState['theme']) => void;
  changeFontSize: (fontSize: number) => void;
  setVisibleBalances: (visible: boolean) => void;
}

const defaultState: ISiteSettingState = {
  _hasHydrated: false,
  theme: 'black',
  fontSize: 14,
  showMyAccounts: true,
  visibleBalances: true
};

export const useSiteSettingStore = create(
  persist<ISiteSettingStore>(
    (set, get) => ({
      ...defaultState,

      setHasHydrated(state) {
        set({
          _hasHydrated: state
        });
      },
      setShowMyAccounts(show: boolean) {
        set(() => ({
          showMyAccounts: show
        }));
      },
      changeTheme(theme: ISiteSettingState['theme']) {
        set(() => ({
          theme
        }));
      },
      changeFontSize(fontSize: number) {
        set(() => ({
          fontSize: isNaN(fontSize)
            ? DEFAULT_FONT_SIZE
            : fontSize < MIN_FONT_SIZE
            ? MIN_FONT_SIZE
            : fontSize > MAX_FONT_SIZE
            ? MAX_FONT_SIZE
            : fontSize
        }));
      },
      setVisibleBalances(visible) {
        set({ visibleBalances: visible });
      }
    }),
    {
      name: 'siteSetting', // unique name
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
        }
      },
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => !['_hasHydrated'].includes(key))
        ) as ISiteSettingStore,
      getStorage: () => localStorage // (optional) by default, 'localStorage' is used
      // partialize: (state) =>
      //   Object.fromEntries(
      //     Object.entries(state).filter(
      //       ([key]) => !['selectedMarketSymbol', 'selectedExchange'].includes(key)
      //     )
      //   )
    }
  )
);
