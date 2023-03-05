import React, { memo, useState } from 'react';
import isEqual from 'react-fast-compare';
import { IUpbitSocketMessageTickerSimple } from 'src/types/upbit';
import { useExchangeStore } from 'src/store/exchangeSockets';
import { useMarketTableSettingStore } from 'src/store/marketTableSetting';
import shallow from 'zustand/shallow';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';
import formatInTimeZone from 'date-fns-tz/formatInTimeZone';
import { ko as koLocale } from 'date-fns/locale';
import { BackgroundBlueBox, BackgroundRedBox } from '../modules/Box';
import { MarketTableBody, MarketTableHead } from '.';
import { IoIosClose } from 'react-icons/io';
import { useSiteSettingStore } from 'src/store/siteSetting';

export interface IMarketTableItem extends IUpbitSocketMessageTickerSimple {
  korean_name?: string;
  english_name?: string;
  binance_price?: string;
  binance_volume?: string;
  premium?: number;
}

interface MarketTableProps {}

const MarketTable: React.FC<MarketTableProps> = () => {
  const [hidden, setHidden] = useState(false);
  const isLastUpdatePage = useSiteSettingStore(({ isLastUpdatePage }) => isLastUpdatePage, shallow);
  const lastUpdatedAt = useExchangeStore(({ lastUpdatedAt }) => lastUpdatedAt, shallow);

  return (
    <div className='w-full max-w-screen-xl overflow-hidden sm:m-0 flex flex-col'>
      {isLastUpdatePage ? (
        <div className='my-4'>
          <BackgroundBlueBox>
            <div className='text-center'>
              <p>
                마지막 시세를 보는 페이지입니다.
                <br />
                <a
                  href='/'
                  style={{
                    textDecoration: 'underline'
                  }}
                  target='_blank'
                  rel='noreferrer'
                >
                  실시간 시세 보러가기
                </a>
              </p>
              <p>
                시세 업데이트 시간:{' '}
                {formatInTimeZone(lastUpdatedAt, 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss', {
                  locale: koLocale
                })}
              </p>
            </div>
          </BackgroundBlueBox>
        </div>
      ) : (
        <>
          <noscript>
            <div className='mt-4'>
              <BackgroundRedBox>
                <div className='text-center'>
                  <p>
                    현재 사용중인 브라우저에서 자바스크립트가 비활성화 되어있습니다.
                    <br />
                    실시간 시세를 보시려면 자바스크립트를 활성화하시고 새로고침 해주세요.
                  </p>
                  <p>
                    <a
                      className='text-white underline'
                      href='https://support.google.com/adsense/answer/12654?hl=ko'
                      target='_blank'
                      rel='noreferrer'
                    >
                      활성화 방법 보기
                    </a>
                  </p>
                  <p>
                    시세 업데이트 시간:{' '}
                    {formatInTimeZone(lastUpdatedAt, 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss', {
                      locale: koLocale
                    })}
                  </p>
                </div>
              </BackgroundRedBox>
            </div>
          </noscript>
          <div className='flex items-center justify-end flex-auto flex-shrink-0 flex-grow-0 bg-base-200'>
            <div className='mr-auto'>
              <UsdKrwToggle />
            </div>
            <MarketSearch />
            {}
            <div>
              <span
                className='btn btn-circle btn-ghost btn-xs cursor-pointer'
                onClick={() => setHidden((p) => !p)}
              >
                {hidden ? <RiArrowDownSLine /> : <RiArrowUpSLine />}
              </span>
            </div>
          </div>
        </>
      )}
      {!hidden && (
        <div className='overflow-y-auto flex-auto font-mono text-right [&_th]:px-0.5 [&_th]:py-1.5 [&_td]:px-0.5 [&_td]:py-1.5 [&_td]:whitespace-nowrap [&_tbody_tr]:border-b [&_tbody_tr]:cursor-pointer [&_tbody_tr]:min-w-[40px] [&_tbody_tr:hover_td]:bg-white/5'>
          <table className='border-separate border-spacing-0 w-full'>
            <MarketTableHead />
            <MarketTableBody />
          </table>
        </div>
      )}
    </div>
  );
};

const UsdKrwToggle = () => {
  const currency = useMarketTableSettingStore((state) => state.currency, shallow);

  const handleChange = () => {
    useMarketTableSettingStore.getState().setCurrency(currency === 'KRW' ? 'USD' : 'KRW');
  };

  return (
    <div className='flex-center cursor-pointer text-zinc-400' onClick={handleChange}>
      KRW&nbsp;
      <input
        // onChange={handleChange}
        type='checkbox'
        className='bg-opacity-100 border-opacity-100 toggle toggle-xs rounded-full border-zinc-500 transition-all'
        checked={currency === 'KRW' ? false : true}
        readOnly
      />
      &nbsp;USD
    </div>
  );
};

const MarketSearch = () => {
  const { sortColumn, sortType, searchValue, setSearchValue } = useMarketTableSettingStore(
    ({ sortColumn, sortType, searchValue, setSearchValue }) => ({
      sortColumn,
      sortType,
      searchValue,
      setSearchValue
    }),
    shallow
  );

  const handleChangeMarketSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);

    const { searchSymbols, sortSymbolList } = useExchangeStore.getState();
    searchSymbols(value);
    sortSymbolList(sortColumn, sortType);
  };

  const handleClickClearSearchInputButton = () => {
    setSearchValue('');

    const { searchSymbols, sortSymbolList } = useExchangeStore.getState();
    searchSymbols('');
    sortSymbolList(sortColumn, sortType);
  };

  return (
    <div className='border form-control border-base-300 '>
      <label className='input-group input-group-xs '>
        <input
          type='text'
          placeholder='BTC, 비트, Bitcoin'
          value={searchValue}
          onChange={handleChangeMarketSearchInput}
          className='input input-xs bg-transparent w-[170px] focus:outline-offset-0'
        />
        <span
          className='text-xl text-gray-600 bg-transparent cursor-pointer px-1.5 justify-end'
          onClick={handleClickClearSearchInputButton}
        >
          <IoIosClose />
        </span>
      </label>
    </div>
  );
};

export default memo(MarketTable, isEqual);
