import { useEffect } from 'react';
import { useExchangeStore } from 'src/store/exchangeSockets';
import { useMarketTableSettingStore } from 'src/store/marketTableSetting';
import { useSiteSettingStore } from 'src/store/siteSetting';
import shallow from 'zustand/shallow';
import { MarketTableItem } from '.';

export interface TableBodyProps {
  // upbitMarketSnapshot?: Record<string, IMarketTableItem>;
  // binanceMarketSnapshot?: Record<string, IBinanceSocketTicker>;
}

const TableBody: React.FC<TableBodyProps> = () => {
  const { sortColumn, sortType, favoriteSymbols, searchValue } = useMarketTableSettingStore(
    ({ sortColumn, sortType, favoriteSymbols, searchValue }) => ({
      sortColumn,
      sortType,
      favoriteSymbols,
      searchValue
    }),
    shallow
  );
  const { searchedSymbols, upbitForex } = useExchangeStore(
    ({ searchedSymbols, upbitForex }) => ({ searchedSymbols, upbitForex }),
    shallow
  );
  const hydrated = useSiteSettingStore((state) => state.hydrated, shallow);

  useEffect(() => {
    useExchangeStore.getState().sortSymbolList(sortColumn, sortType);
    const interval = setInterval(() => {
      useExchangeStore.getState().sortSymbolList(sortColumn, sortType);
      // setNum((prev) => 1 - prev);
    }, 3000);
    return () => clearInterval(interval);
  }, [sortColumn, sortType]);

  if (!upbitForex || searchedSymbols.length === 0) {
    if (searchValue.length !== 0) {
      return (
        // 검색된 결과가 없음
        <tbody>
          <tr>
            <td colSpan={6}>
              <div className='h-20 text-center flex-center'>검색 된 코인이 없습니다.</div>
            </td>
          </tr>
        </tbody>
      );
    }
    return (
      // 스켈레톤
      <tbody>
        {[...new Array(6)].map((_, i) => (
          <tr key={`tr-skeleton-${i}`}>
            <td>
              <div className='w-[16px] h-10 rounded-sm animate-pulse bg-primary'></div>
            </td>
            <td>
              <div className='h-10 rounded-sm animate-pulse bg-primary'></div>
            </td>
            <td>
              <div className='h-10 rounded-sm animate-pulse bg-primary'></div>
            </td>
            <td>
              <div className='h-10 rounded-sm animate-pulse bg-primary'></div>
            </td>
            <td>
              <div className='h-10 rounded-sm animate-pulse bg-primary'></div>
            </td>
            <td>
              <div className='h-10 rounded-sm animate-pulse bg-primary'></div>
            </td>
          </tr>
        ))}
      </tbody>
    );
  }

  return (
    <tbody>
      {searchedSymbols.map((krwSymbol) => {
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
      })}
    </tbody>
  );
};

export default TableBody;
