/* eslint-disable @next/next/no-img-element */
import React, { memo } from 'react';
import isEqual from 'react-fast-compare';
import { BiUpArrowAlt, BiDownArrowAlt } from 'react-icons/bi';
import { IUpbitSocketMessageTickerSimple } from 'src/types/upbit';
import { useExchangeStore } from 'src/store/exchangeSockets';
import { useMarketTableSettingStore } from 'src/store/marketTableSetting';
import shallow from 'zustand/shallow';
import { RiCloseCircleLine } from 'react-icons/ri';
import formatInTimeZone from 'date-fns-tz/formatInTimeZone';
import { ko as koLocale } from 'date-fns/locale';
import { BackgroundBlueBox, BackgroundRedBox } from '../modules/Box';
import { MarketTableBody } from '.';
export interface IMarketTableItem extends IUpbitSocketMessageTickerSimple {
  korean_name?: string;
  english_name?: string;
  binance_price?: string;
  binance_volume?: string;
  premium?: number;
}

interface MarketTableProps {
  isLastUpdatePage?: boolean;
}

const MarketTable: React.FC<MarketTableProps> = ({ isLastUpdatePage }) => {
  const { sortColumn, sortType, searchValue, setSortColumn, setSortType, setSearchValue } =
    useMarketTableSettingStore();

  const { upbitForex, lastUpdatedAt } = useExchangeStore(({ lastUpdatedAt, upbitForex }) => {
    return {
      upbitForex,
      lastUpdatedAt
    };
  }, shallow);

  const handleClickThead = (columnName: keyof IMarketTableItem) => () => {
    if (columnName === sortColumn) {
      setSortType(sortType === 'ASC' ? 'DESC' : 'ASC');
      return;
    }
    setSortType('DESC');
    setSortColumn(columnName);
  };

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
    <div className='max-w-screen-xl mx-auto mb-4 text-xs sm:text-sm'>
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
          <div className='flex items-center justify-between my-2'>
            <div className='tooltip tooltip-right' data-tip='계산에 적용된 달러 환율입니다.'>
              USD/KRW {upbitForex?.basePrice?.toLocaleString()}
            </div>
            <div className='border rounded-md form-control border-base-300 '>
              <label className='input-group input-group-sm '>
                <input
                  type='text'
                  placeholder='BTC, 비트, Bitcoin'
                  value={searchValue}
                  onChange={handleChangeMarketSearchInput}
                  className='input input-sm bg-transparent w-[170px] focus:outline-offset-0 focus:rounded-l-md'
                />
                <span
                  className='text-xl text-gray-600 bg-transparent cursor-pointer px-1.5 justify-end'
                  onClick={handleClickClearSearchInputButton}
                >
                  <RiCloseCircleLine />
                </span>
              </label>
            </div>
          </div>
        </>
      )}
      <table className='table w-full [&_td]:text-xs sm:[&_td]:text-sm  table-compact'>
        <thead>
          <tr className='[&>td]:text-gray-600 [&>th:first-child]:z-0 [&>th:first-child]:rounded-none [&>th:last-child]:rounded-none'>
            <th className='w-[1.25em] market-td-padding'></th>
            <th className='w-auto market-td-padding'>
              <div
                className='flex'
                // className='flex tooltip'
                // data-tip={
                //   <div>
                //     <p>거래소로 이동</p>
                //     <p>차트 변경</p>
                //   </div>
                // }
              >
                <div className='flex cursor-pointer' onClick={handleClickThead('korean_name')}>
                  <span>이름</span>
                  <div className='flex items-center'>
                    {sortColumn === 'korean_name' ? (
                      sortType === 'ASC' ? (
                        <BiUpArrowAlt />
                      ) : (
                        <BiDownArrowAlt />
                      )
                    ) : null}
                  </div>
                </div>
              </div>
            </th>
            <th className='market-td-padding w-[20%]'>
              <div
                className='flex justify-end'
                // className='flex justify-end tooltip'
                // data-tip={
                //   <div>
                //     <p>업비트 현재가</p>
                //     <p>바이낸스 현재가</p>
                //   </div>
                // }
              >
                <div className='flex cursor-pointer' onClick={handleClickThead('tp')}>
                  <span>현재가</span>
                  <div className='flex items-center'>
                    {sortColumn === 'tp' ? (
                      sortType === 'ASC' ? (
                        <BiUpArrowAlt />
                      ) : (
                        <BiDownArrowAlt />
                      )
                    ) : null}
                  </div>
                </div>
              </div>
            </th>
            <th className='market-td-padding w-[10%]'>
              <div
                className='flex justify-end'
                // className='flex justify-end tooltip'
                // data-tip={
                //   <div>
                //     <p>일일 변동 퍼센트</p>
                //     <p>일일 변동 가격</p>
                //   </div>
                // }
              >
                <div className='flex cursor-pointer' onClick={handleClickThead('scr')}>
                  <span>변동</span>
                  <div className='flex items-center'>
                    {sortColumn === 'scr' ? (
                      sortType === 'ASC' ? (
                        <BiUpArrowAlt />
                      ) : (
                        <BiDownArrowAlt />
                      )
                    ) : null}
                  </div>
                </div>
              </div>
            </th>
            <th className='market-td-padding w-[10%]'>
              <div
                className='flex justify-end'
                // className='flex justify-end tooltip'
                // data-tip={
                //   <div>
                //     <p>원화 프리미엄</p>
                //     <p>업비트-바이낸스 가격 차이</p>
                //   </div>
                // }
              >
                <div className='flex cursor-pointer' onClick={handleClickThead('premium')}>
                  <span>김프</span>
                  <div className='flex items-center'>
                    {sortColumn === 'premium' ? (
                      sortType === 'ASC' ? (
                        <BiUpArrowAlt />
                      ) : (
                        <BiDownArrowAlt />
                      )
                    ) : null}
                  </div>
                </div>
              </div>
            </th>
            <th className='market-td-padding w-[10%]'>
              <div
                className='flex justify-end'
                // className='flex justify-end tooltip'
                // data-tip={
                //   <div>
                //     <p>업비트 거래량</p>
                //     <p>바이낸스 거래량</p>
                //   </div>
                // }
              >
                <div className='flex cursor-pointer' onClick={handleClickThead('atp24h')}>
                  <span>거래량</span>
                  <div className='flex items-center'>
                    {sortColumn === 'atp24h' ? (
                      sortType === 'ASC' ? (
                        <BiUpArrowAlt />
                      ) : (
                        <BiDownArrowAlt />
                      )
                    ) : null}
                  </div>
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <MarketTableBody sortColumn={sortColumn} sortType={sortType} />
      </table>
    </div>
  );
};

export default memo(MarketTable, isEqual);
