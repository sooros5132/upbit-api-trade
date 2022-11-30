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
      <tr className='[&>td]:text-gray-600 [&>th:first-child]:z-0 [&>th:first-child]:rounded-none [&>th:last-child]:rounded-none text-right [&_svg]:inline-block [&>th>div]:cursor-pointer'>
        <th className='w-[1.25em]'></th>
        <th className='w-auto'>
          <div
            className='text-left cursor-pointer'
            onClick={handleClickThead('korean_name')}
            // className='flex tooltip'
            // data-tip={
            //   <div>
            //     <p>거래소로 이동</p>
            //     <p>차트 변경</p>
            //   </div>
            // }
          >
            <span>이름</span>
            {sortColumn === 'korean_name' ? (
              sortType === 'ASC' ? (
                <BiUpArrowAlt />
              ) : (
                <BiDownArrowAlt />
              )
            ) : null}
          </div>
        </th>
        <th className='w-[20%]'>
          <div
            onClick={handleClickThead('tp')}
            // className=' tooltip'
            // data-tip={
            //   <div>
            //     <p>업비트 현재가</p>
            //     <p>바이낸스 현재가</p>
            //   </div>
            // }
          >
            <span>현재가</span>
            {sortColumn === 'tp' ? (
              sortType === 'ASC' ? (
                <BiUpArrowAlt />
              ) : (
                <BiDownArrowAlt />
              )
            ) : null}
          </div>
        </th>
        <th className='w-[10%]'>
          <div
            onClick={handleClickThead('scr')}
            // className=' tooltip'
            // data-tip={
            //   <div>
            //     <p>일일 변동 퍼센트</p>
            //     <p>일일 변동 가격</p>
            //   </div>
            // }
          >
            <span>변동</span>
            {sortColumn === 'scr' ? (
              sortType === 'ASC' ? (
                <BiUpArrowAlt />
              ) : (
                <BiDownArrowAlt />
              )
            ) : null}
          </div>
        </th>
        <th className='w-[10%]'>
          <div
            onClick={handleClickThead('premium')}
            // className=' tooltip'
            // data-tip={
            //   <div>
            //     <p>원화 프리미엄</p>
            //     <p>업비트-바이낸스 가격 차이</p>
            //   </div>
            // }
          >
            <span>김프</span>
            {sortColumn === 'premium' ? (
              sortType === 'ASC' ? (
                <BiUpArrowAlt />
              ) : (
                <BiDownArrowAlt />
              )
            ) : null}
          </div>
        </th>
        <th className='w-[10%]'>
          <div
            onClick={handleClickThead('atp24h')}
            // className=' tooltip'
            // data-tip={
            //   <div>
            //     <p>업비트 거래량</p>
            //     <p>바이낸스 거래량</p>
            //   </div>
            // }
          >
            <span>거래량</span>
            {sortColumn === 'atp24h' ? (
              sortType === 'ASC' ? (
                <BiUpArrowAlt />
              ) : (
                <BiDownArrowAlt />
              )
            ) : null}
          </div>
        </th>
      </tr>
    </thead>
  );
};

export default memo(TableHead, isEqual);
