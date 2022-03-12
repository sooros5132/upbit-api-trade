import { IMarketTable } from "src/components/market-table/MarketListTable";

export enum ThemeTypes {
  ACTION_UPDATE_TABLE = "UPDATE_TABLE",
}
const defaultState: Record<string, IMarketTable> = {};

const initialState: Record<string, IMarketTable> = { ...defaultState };

export const marketTableActions = {
  update: (list: Record<string, IMarketTable>) => ({
    type: ThemeTypes.ACTION_UPDATE_TABLE,
    payload: list,
  }),
};

export default function reducer(
  state: Record<string, IMarketTable> = initialState,
  action: any
): Record<string, IMarketTable> {
  switch (action.type) {
    case ThemeTypes.ACTION_UPDATE_TABLE:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
