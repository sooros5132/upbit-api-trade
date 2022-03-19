import create from 'zustand';
import { devtools } from 'zustand/middleware';
import createContext from 'zustand/context';
import { persist } from 'zustand/middleware';

export interface Theme {
  mode: 'dark' | 'light';
  fontSize: number;
  useDarkTheme: () => void;
  useLightTheme: () => void;
  changeFontSize: (fontSize: number) => void;
}

const DEFAULT_FONT_SIZE = 14;
const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 18;

const defaultState = {
  mode: 'dark' as Theme['mode'],
  fontSize: DEFAULT_FONT_SIZE
};

const initialState = { ...defaultState };

export const initStore = () => {
  const createStore = () =>
    create<Theme>(
      persist(
        devtools((set, get) => ({
          ...initialState,
          useDarkTheme: () =>
            set(() => ({
              mode: 'dark'
            })),
          useLightTheme: () =>
            set(() => ({
              mode: 'light'
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
          name: 'theme', // unique name
          getStorage: () => localStorage // (optional) by default, 'localStorage' is used
        }
      )
    );

  return createStore;
};

export const { Provider: ThemeStoreProvider, useStore: useThemeStore } = createContext<Theme>();
export const createThemeStore = initStore();
