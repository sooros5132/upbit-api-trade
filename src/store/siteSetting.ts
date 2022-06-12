import create from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_FONT_SIZE = 14;
const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 18;

interface ISiteSettingState {
  theme: 'dark' | 'light';
  fontSize: number;
  showMyAccounts: boolean;
}

interface ISiteSettingStore extends ISiteSettingState {
  setShowMyAccounts: (show: boolean) => void;
  changeTheme: (mode: ISiteSettingState['theme']) => void;
  changeFontSize: (fontSize: number) => void;
}

const defaultState: ISiteSettingState = {
  theme: 'dark',
  fontSize: 14,
  showMyAccounts: true
};

export const useSiteSettingStore = create<ISiteSettingStore>(
  persist(
    (set, get) => ({
      ...defaultState,
      setShowMyAccounts(show: boolean) {
        set(() => ({
          showMyAccounts: show
        }));
      },
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
    }),
    {
      name: 'siteSetting', // unique name
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
