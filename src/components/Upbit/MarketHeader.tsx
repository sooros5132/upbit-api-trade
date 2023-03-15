import numeral from 'numeral';
import React, { FC, memo } from 'react';
import isEqual from 'react-fast-compare';
import { useExchangeStore } from 'src/store/exchangeSockets';
import { useUpbitApiStore } from 'src/store/upbitApi';
import { krwRegex } from 'src/utils/regex';
import { upbitPadEnd } from 'src/utils/utils';
import Image from 'next/image';
import { IMarketTableItem } from '../market-table/MarketTable';
import { apiUrls } from 'src/lib/apiUrls';
import shallow from 'zustand/shallow';
import classNames from 'classnames';

export const UpbitMarketHeader: FC = memo(() => {
  const upbitTradeMarket = useUpbitApiStore((state) => state.upbitTradeMarket, shallow);
  const market = useExchangeStore((state) => state.upbitMarketDatas[upbitTradeMarket], shallow);

  return (
    <div className='bg-base-300/70'>
      {market && <UpbitMarketHeaderInner market={market}></UpbitMarketHeaderInner>}
    </div>
  );
}, isEqual);

const UpbitMarketHeaderInner: FC<{ market: IMarketTableItem }> = ({ market }) => {
  const marketSymbol = market.cd.replace(krwRegex, '');

  return (
    <div className='py-2 flex items-center gap-x-2 whitespace-nowrap overflow-x-auto overflow-y-hidden sm:px-2'>
      <div className='flex flex-wrap items-end gap-x-1 sm:flex-nowrap'>
        <div className='shrink-0 self-auto sm:text-lg [&>*]:!w-[0.9em]'>
          <Image
            className='pointer-events-none object-contain rounded-full'
            src={`/asset/upbit/logos/${marketSymbol}.png`}
            width={24}
            height={24}
            quality={100}
            loading='lazy'
            alt={`${marketSymbol}-icon`}
          />
        </div>
        <div className='sm:text-lg md:text-xl font-bold'>
          {market.korean_name}
          <span className='text-gray-400 text-xs sm:text-sm'>{marketSymbol}</span>
          &nbsp;
          <span className={market.c === 'RISE' ? 'bid' : market.c === 'FALL' ? 'ask' : ''}>
            <span className='md:text-lg'>{upbitPadEnd(market.tp)}₩</span>
          </span>
        </div>
        <div
          className={classNames(
            'sm:pb-0.5',
            market.c === 'RISE' ? 'bid' : market.c === 'FALL' ? 'ask' : ''
          )}
        >
          <span className='text-sm'>
            <span>
              {market.c === 'RISE' ? '▲' : market.c === 'FALL' ? '▼' : ''}
              {upbitPadEnd(market.cp)}
            </span>
            &nbsp;
            <span>
              {market.c === 'RISE' ? '+' : market.c === 'FALL' ? '-' : ''}
              {numeral(market.cr * 100).format('0,0.[00]')}%
            </span>
          </span>
        </div>
        {market.binance_price && (
          <div className='text-sm sm:pb-0.5'>
            <a
              className='mr-0.5'
              href={`${apiUrls.binance.marketHref}/${marketSymbol}_USDT`}
              target='_blank'
              rel='noreferrer'
            >
              <Image
                className='pointer-events-none select-none'
                src='/icons/binance.ico'
                width={10}
                height={10}
                loading='lazy'
                alt='binance favicon'
              />
            </a>
            <span>
              {Number(market.binance_price) < 0.000001
                ? market.binance_price
                : numeral(market.binance_price).format('0,0[.][00000000]')}
            </span>
            <span className='text-[0.75em] opacity-60'>USDT</span>
          </div>
        )}
      </div>
      <div className='hidden md:block ml-auto pl-2 text-xs'>
        <div className='text-center opacity-60'>
          24h 거래량&nbsp;
          <span className='text-[0.75em]'>({marketSymbol})</span>
        </div>
        <div className='text-center'>{market.atv24h.toLocaleString()}</div>
      </div>
      <div className='hidden md:block text-xs'>
        <div className='text-center opacity-60'>
          24h 거래량&nbsp;
          <span className='text-[0.75em]'>({'KRW'})</span>
        </div>
        <div className='text-center'>{numeral(market.atp24h).format('0,0')}</div>
      </div>
    </div>
  );
};

UpbitMarketHeader.displayName = 'UpbitMarketHeader';
