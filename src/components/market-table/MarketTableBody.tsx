import { memo, useEffect } from 'react';
import isEqual from 'react-fast-compare';
import { useExchangeStore } from 'src/store/exchangeSockets';
import { useMarketTableSettingStore } from 'src/store/marketTableSetting';
import { IUpbitForex } from 'src/types/upbit';
import shallow from 'zustand/shallow';
import { MarketTableItem } from '.';
import { IMarketTableItem } from './MarketTable';

export interface TableBodyProps {
  sortColumn: keyof IMarketTableItem;
  sortType: 'ASC' | 'DESC';
  // upbitMarketSnapshot?: Record<string, IMarketTableItem>;
  // binanceMarketSnapshot?: Record<string, IBinanceSocketMessageTicker>;
}

const TableBody: React.FC<TableBodyProps> = ({ sortColumn, sortType }) => {
  const { hydrated, favoriteSymbols } = useMarketTableSettingStore(
    ({ hydrated, favoriteSymbols }) => ({ hydrated, favoriteSymbols }),
    shallow
  );
  const { searchedSymbols, upbitForex } = useExchangeStore(
    ({ searchedSymbols, upbitForex }) => ({ searchedSymbols, upbitForex }),
    shallow
  );

  useEffect(() => {
    const { hydrated, setHydrated } = useMarketTableSettingStore.getState();

    if (!hydrated) setHydrated();
  }, []);

  useEffect(() => {
    useExchangeStore.getState().sortSymbolList(sortColumn, sortType);
    const interval = setInterval(() => {
      useExchangeStore.getState().sortSymbolList(sortColumn, sortType);
      // setNum((prev) => 1 - prev);
    }, 3000);
    return () => clearInterval(interval);
  }, [sortColumn, sortType]);

  return (
    <tbody>
      {!upbitForex ? (
        <tr>
          <td colSpan={6}>
            <div className='my-3 text-center'>로딩중입니다.</div>
          </td>
        </tr>
      ) : (
        searchedSymbols.map((krwSymbol, index) => {
          const favorite = hydrated ? Boolean(favoriteSymbols[krwSymbol]) : false;

          return (
            <MarketTableItem
              key={krwSymbol}
              // upbitMarket={upbitMarket}
              krwSymbol={krwSymbol}
              upbitForex={upbitForex}
              favorite={favorite}
            />
          );
        })
      )}
    </tbody>
  );
};

export default memo(TableBody, isEqual);
