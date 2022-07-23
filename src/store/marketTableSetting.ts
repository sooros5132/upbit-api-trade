import { IMarketTableItem } from 'src/components/market-table/MarketTable';
import create from 'zustand';
import { persist } from 'zustand/middleware';

interface IMarketTableSettingState {
  hydrated: boolean;
  sortColumn: keyof IMarketTableItem;
  sortType: 'ASC' | 'DESC';
  favoriteSymbols: Record<string, boolean>;
  highlight: boolean;
}

interface IMarketTableSettingStore extends IMarketTableSettingState {
  setHydrated: () => void;
  setSortColumn: (column: keyof IMarketTableItem) => void;
  setSortType: (type: 'ASC' | 'DESC') => void;
  addFavoriteSymbol: (symbol: string) => void;
  removeFavoriteSymbol: (symbol: string) => void;
}

const defaultState: IMarketTableSettingState = {
  hydrated: false,
  sortColumn: 'tp',
  sortType: 'DESC',
  favoriteSymbols: {},
  highlight: true
};

export const useMarketTableSettingStore = create<IMarketTableSettingStore>(
  persist(
    (set, get) => ({
      ...defaultState,
      setHydrated: () => set({ hydrated: true }),
      setSortColumn(column) {
        set({ sortColumn: column });
      },
      setSortType(type) {
        set({ sortType: type });
      },
      addFavoriteSymbol(symbol: string) {
        set((state) => ({
          favoriteSymbols: {
            ...state.favoriteSymbols,
            [symbol]: true
          }
        }));
      },
      removeFavoriteSymbol(symbol: string) {
        set((state) => {
          const { [symbol]: _, ...newFavoriteSymbols } = state.favoriteSymbols;
          return { favoriteSymbols: newFavoriteSymbols || {} };
        });
      }
    }),
    {
      name: 'marketTableSetting', // unique name
      getStorage: () => localStorage, // (optional) by default, 'localStorage' is used
      // onRehydrateStorage: () => (state, error) => {
      //   if (state) {
      //     state.setHydrated();
      //   }
      // }
      partialize: (state) =>
        Object.fromEntries(Object.entries(state).filter(([key]) => !['hydrated'].includes(key)))
    }
  )
);
