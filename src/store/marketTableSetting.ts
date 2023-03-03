import { IMarketTableItem } from 'src/components/market-table/MarketTable';
import create from 'zustand';
import { persist } from 'zustand/middleware';

interface IMarketTableSettingState {
  sortColumn: keyof IMarketTableItem;
  sortType: 'ASC' | 'DESC';
  favoriteSymbols: Record<string, boolean>;
  stickyChart: boolean;
  searchValue: string;
  currency: 'USD' | 'KRW';
}

interface IMarketTableSettingStore extends IMarketTableSettingState {
  setSortColumn: (column: keyof IMarketTableItem) => void;
  setSortType: (type: 'ASC' | 'DESC') => void;
  setSearchValue: (searchValue: string) => void;
  addFavoriteSymbol: (symbol: string) => void;
  removeFavoriteSymbol: (symbol: string) => void;
  setCurrency: (currency: IMarketTableSettingState['currency']) => void;
}

const defaultState: IMarketTableSettingState = {
  sortColumn: 'tp',
  sortType: 'DESC',
  favoriteSymbols: {},
  stickyChart: false,
  searchValue: '',
  currency: 'KRW'
};

export const useMarketTableSettingStore = create(
  persist<IMarketTableSettingStore>(
    (set) => ({
      ...defaultState,
      setSortColumn(column) {
        set({ sortColumn: column });
      },
      setSortType(type) {
        set({ sortType: type });
      },
      setSearchValue(searchValue) {
        set({ searchValue });
      },
      addFavoriteSymbol(symbol: string) {
        set((state) => ({
          favoriteSymbols: {
            ...state.favoriteSymbols,
            [symbol]: true
          }
        }));
      },
      setCurrency(currency) {
        set({ currency });
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
        Object.fromEntries(
          Object.entries(state).filter(([key]) => !['hydrated'].includes(key))
        ) as IMarketTableSettingStore,
      version: 0.1
    }
  )
);
