import { IMarketTableItem } from 'src/components/market-table/MarketTable';
import create from 'zustand';
import { devtools } from 'zustand/middleware';
import { persist } from 'zustand/middleware';

interface IMarketTableSettingState {
  sortColumn: keyof IMarketTableItem;
  sortType: 'ASC' | 'DESC';
  favoriteSymbols: Record<string, boolean>;
}

interface IMarketTableSettingStore extends IMarketTableSettingState {
  setSortColumn: (column: keyof IMarketTableItem) => void;
  setSortType: (type: 'ASC' | 'DESC') => void;
  addFavoriteSymbol: (symbol: string) => void;
  removeFavoriteSymbol: (symbol: string) => void;
}

const defaultState: IMarketTableSettingState = {
  sortColumn: 'tp',
  sortType: 'DESC',
  favoriteSymbols: {}
};

export const useMarketTableSettingStore = create<IMarketTableSettingStore>(
  persist(
    devtools((set, get) => ({
      ...defaultState,
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
        set((state) => ({
          favoriteSymbols: {
            ...state.favoriteSymbols,
            [symbol]: false
          }
        }));
      }
    })),
    {
      name: 'marketTableSetting', // unique name
      getStorage: () => localStorage, // (optional) by default, 'localStorage' is used
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => !['favoriteSymbols'].includes(key))
        )
    }
  )
);
