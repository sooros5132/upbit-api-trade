import { memo } from 'react';
import isEqual from 'react-fast-compare';
import { BiUpArrowAlt, BiDownArrowAlt } from 'react-icons/bi';
import { useMarketTableSettingStore } from 'src/store/marketTableSetting';
import shallow from 'zustand/shallow';
import { IMarketTableItem } from './MarketTable';

export const TableHead = () => {
  const { sortColumn, sortType, setSortColumn, setSortType } = useMarketTableSettingStore(
    ({ sortColumn, sortType, setSortColumn, setSortType }) => ({
      sortColumn,
      sortType,
      setSortColumn,
      setSortType
    }),
    shallow
  );

  const handleClickThead = (columnName: keyof IMarketTableItem) => () => {
    if (columnName === sortColumn) {
      setSortType(sortType === 'ASC' ? 'DESC' : 'ASC');
      return;
    }
    setSortType('DESC');
    setSortColumn(columnName);
  };

  return (
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
  );
};

export default memo(TableHead, isEqual);
