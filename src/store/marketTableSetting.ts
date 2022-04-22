import { IMarketTableItem } from 'src/components/market-table/MarketTable';
import create from 'zustand';
import { devtools } from 'zustand/middleware';
import { persist } from 'zustand/middleware';

interface IMarketTableSettingState {
  sortColumn: keyof IMarketTableItem;
  sortType: 'ASC' | 'DESC';
}

interface IMarketTableSettingStore extends IMarketTableSettingState {
  setSortColumn: (column: keyof IMarketTableItem) => void;
  setSortType: (type: 'ASC' | 'DESC') => void;
}

const defaultState: IMarketTableSettingState = {
  sortColumn: 'tp',
  sortType: 'DESC'
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
      }
    })),
    {
      name: 'marketTableSetting', // unique name
      getStorage: () => localStorage // (optional) by default, 'localStorage' is used
    }
  )
);
