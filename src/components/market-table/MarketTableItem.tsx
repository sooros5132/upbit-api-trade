import classNames from 'classnames';
import { isEqual } from 'lodash';
import Image from 'next/image';
import React, { useState } from 'react';
import { memo, useEffect, useRef } from 'react';
import { TiPin } from 'react-icons/ti';
import { useExchangeStore } from 'src/store/exchangeSockets';
import { useMarketTableSettingStore } from 'src/store/marketTableSetting';
import { IUpbitForex } from 'src/types/upbit';
import { apiUrls } from 'src/lib/apiUrls';
import { krwRegex, marketRegex } from 'src/utils/regex';
import { koPriceLabelFormat } from 'src/utils/utils';
import shallow from 'zustand/shallow';
import numeral from 'numeral';
import { useUpbitApiStore } from 'src/store/upbitApi';
import { AiOutlineAreaChart } from 'react-icons/ai';
import { useSiteSettingStore } from 'src/store/siteSetting';
import { toast } from 'react-toastify';

export interface TableItemProps {
  krwSymbol: string;
  // upbitMarket: IMarketTableItem;
  upbitForex: IUpbitForex;
  favorite: boolean;
}

const TableItem: React.FC<TableItemProps> = ({ krwSymbol, upbitForex, favorite }) => {
  const krwPriceRef = useRef<HTMLSpanElement>(null);
  const usdPriceRef = useRef<HTMLSpanElement>(null);
  const currency = useMarketTableSettingStore(({ currency }) => currency, shallow);
  const upbitMarket = useExchangeStore((state) => state.upbitMarketDatas[krwSymbol], shallow);
  const { chartLength, highlight } = useSiteSettingStore(
    (state) => ({ chartLength: state.subscribeChartCodes.length, highlight: state.highlight }),
    shallow
  );
  const upbitTradeMarket = useUpbitApiStore((state) => state.upbitTradeMarket, shallow);
  const marketSymbol = upbitMarket.cd.replace(marketRegex, '');

  // const upbitBtcMarket = useExchangeStore(
  //   (state) => state.upbitMarketDatas['BTC-' + marketSymbol],
  //   shallow
  // );
  // const upbitBtcPrice = useExchangeStore.getState().upbitMarketDatas['KRW-BTC'];

  const handleClickMarketIcon =
    (exchange: 'BINANCE' | 'UPBIT', symbol: string) =>
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();

      if (chartLength === 1) {
        useSiteSettingStore.getState().setSubscribeChartCodes([
          {
            code: symbol,
            exchange
          }
        ]);
        return;
      }

      //   window.scrollTo(0, 0);
    };

  const handleClickChangeSubscribeChart =
    (exchange: 'BINANCE' | 'UPBIT', symbol: string, chartIndex: number) =>
    (event: React.MouseEvent<HTMLLIElement>) => {
      event.stopPropagation();

      const { subscribeChartCodes, setSubscribeChartCodes } = useSiteSettingStore.getState();

      const newSubscribeChartCodes = [...subscribeChartCodes];
      const duplicateCheck = newSubscribeChartCodes.find(
        (chartTemp) => chartTemp.code === symbol && chartTemp.exchange === exchange
      );
      if (duplicateCheck) {
        toast.warn('선택한 차트는 이미 있습니다. 다른 차트를 선택해주세요');
        return;
      }
      newSubscribeChartCodes.splice(chartIndex, 1, { code: symbol, exchange });
      setSubscribeChartCodes(newSubscribeChartCodes);
    };

  const handleClickStarIcon = (symbol: string) => (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (!favorite) {
      useMarketTableSettingStore.getState().addFavoriteSymbol(symbol);
    } else {
      useMarketTableSettingStore.getState().removeFavoriteSymbol(symbol);
    }
    const { sortColumn, sortType } = useMarketTableSettingStore.getState();
    useExchangeStore.getState().sortSymbolList(sortColumn, sortType);
  };

  const handleClickMarket = (market: string) => (event: React.MouseEvent<HTMLTableRowElement>) => {
    if (event.currentTarget.tagName === 'TR') {
      useUpbitApiStore.getState().setUpbitTradeMarket(market);

      if (chartLength === 1) {
        useSiteSettingStore.getState().setSubscribeChartCodes([
          {
            code: market.replace(krwRegex, ''),
            exchange: 'UPBIT'
          }
        ]);
        return;
      }
      return;
    }
  };

  useEffect(() => {
    if (!highlight || !krwPriceRef?.current) {
      return;
    }
    const node = krwPriceRef.current;
    const callback: MutationCallback = (e) => {
      for (const mutationNode of e) {
        mutationNode.target.parentElement?.classList.remove('highlight');
        setTimeout(() => {
          mutationNode.target.parentElement?.classList.add('highlight');
        }, 0);
      }
      // const animations = mutationNode.target.parentElement?.getAnimations()
      // if(animations){
      //   for(const animation of animations){
      //     if (node.contains((animation.effect as KeyframeEffect).target)) {
      //       animation.cancel();
      //       animation.play();
      //     }
      //   }
      // }
    };
    const config: MutationObserverInit = {
      subtree: true,
      characterData: true
    };
    const observer = new MutationObserver(callback);

    observer.observe(node, config);

    return () => {
      observer.disconnect();
    };
  }, [highlight, krwPriceRef]);

  useEffect(() => {
    if (!usdPriceRef?.current) {
      return;
    }
    const node = usdPriceRef.current;
    const callback: MutationCallback = (e) => {
      if (!highlight) {
        return;
      }
      for (const mutationNode of e) {
        mutationNode.target.parentElement?.classList.remove('highlight');
        setTimeout(() => {
          mutationNode.target.parentElement?.classList.add('highlight');
        }, 0);
      }
    };
    const config: MutationObserverInit = {
      subtree: true,
      characterData: true
    };
    const observer = new MutationObserver(callback);

    observer.observe(node, config);

    return () => {
      observer.disconnect();
    };
  }, [highlight, usdPriceRef]);

  const upbitChangeRate = upbitMarket.scr * 100;

  // const priceIntegerLength = String(upbitMarket.tp).replace(
  //   /\.[0-9]+$/,
  //   ""
  // ).length;

  const krwPriceNum = Number(
    currency === 'KRW' ? upbitMarket.tp : upbitMarket.tp / upbitForex.basePrice
  );
  const usdPriceNum = upbitMarket.binance_price
    ? Number(
        currency === 'KRW'
          ? Number(upbitMarket.binance_price) * upbitForex.basePrice
          : upbitMarket.binance_price
      )
    : NaN;

  const krwTooSmallNumber = 0.000001 > krwPriceNum;
  const usdTooSmallNumber = 0.000001 > usdPriceNum;

  const krwPriceDecimal = String(krwTooSmallNumber ? krwPriceNum.toFixed(8) : krwPriceNum).replace(
    /^\-?[0-9]+\.?/,
    ''
  );
  const usdPriceDecimal = String(usdTooSmallNumber ? usdPriceNum.toFixed(8) : usdPriceNum).replace(
    /^\-?[0-9]+\.?/,
    ''
  );

  const krwPricePad = ''.padStart(krwPriceDecimal.length, '0');
  const usdPricePad = ''.padStart(usdPriceDecimal.length, '0');

  const usdChange = upbitMarket.scp / upbitForex.basePrice;
  const usdPremium = upbitMarket.binance_price
    ? upbitMarket.tp / upbitForex.basePrice - Number(upbitMarket.binance_price)
    : 0;

  const colorPrice =
    !upbitMarket.scp || upbitMarket.scp === 0
      ? 'text-gray-400'
      : upbitMarket.scp > 0
      ? 'bid'
      : 'ask';

  const colorPremium =
    !upbitMarket.premium || upbitMarket.premium === 0
      ? 'text-gray-400'
      : upbitMarket.premium > 0
      ? 'bid'
      : 'ask';

  return (
    <tr
      className={upbitTradeMarket === krwSymbol ? 'bg-green-800/20' : undefined}
      onClick={handleClickMarket(upbitMarket.cd)}
    >
      <td>
        <div className='text-center'>
          <Image
            className='object-contain overflow-hidden bg-white rounded-full'
            src={`/asset/upbit/logos/${marketSymbol}.png`}
            width={14}
            height={14}
            quality={100}
            loading='lazy'
            alt={`${upbitMarket.cd}-icon`}
          />
        </div>
        <div className='flex justify-center'>
          <div className='flex'>
            <div
              className={classNames(
                'cursor-pointer',
                favorite ? 'text-yellow-300' : 'text-gray-600'
              )}
              onClick={handleClickStarIcon(upbitMarket.cd)}
            >
              <TiPin />
            </div>
          </div>
        </div>
      </td>
      <td className='text-left min-w-[60px]'>
        <div>
          <span className='text-gray-300 whitespace-pre-wrap font-sans'>
            {upbitMarket.korean_name}
          </span>
        </div>
        <div
          className='inline-grid grid-cols-[1em_1em_1em_1em] gap-1'
          onClick={(evt) => evt.stopPropagation()}
        >
          <a
            className='leading-[1em]'
            href={apiUrls.upbit.marketHref + upbitMarket.cd}
            target='_blank'
            rel='noreferrer'
          >
            <Image
              className='market-exchange-image'
              src='/icons/upbit.png'
              width={14}
              height={14}
              loading='lazy'
              alt='upbit favicon'
            />
          </a>
          <div
            className={classNames(
              'market-chart-icon',
              chartLength !== 1 ? 'dropdown dropdown-bottom' : null
            )}
            onClick={handleClickMarketIcon('UPBIT', marketSymbol)}
          >
            <label tabIndex={0} className='text-zinc-500 text-sm cursor-pointer'>
              <AiOutlineAreaChart />
            </label>
            <ul
              tabIndex={0}
              className={classNames(
                'dropdown-content menu p-2 shadow bg-base-100 rounded-box w-32',
                chartLength === 1 ? 'hidden pointer-events-none' : null
              )}
            >
              {[...new Array(chartLength)].map((_, i) => (
                <li key={i} onClick={handleClickChangeSubscribeChart('UPBIT', marketSymbol, i)}>
                  <a>{i + 1}번 차트</a>
                </li>
              ))}
            </ul>
          </div>
          {upbitMarket.binance_price && (
            <>
              <a
                className='leading-[1em]'
                href={`${apiUrls.binance.marketHref}/${marketSymbol}_USDT`}
                target='_blank'
                rel='noreferrer'
              >
                <Image
                  className='market-exchange-image'
                  src='/icons/binance.ico'
                  width={14}
                  height={14}
                  loading='lazy'
                  alt='binance favicon'
                />
              </a>
              <div
                className={classNames(
                  'market-chart-icon',
                  chartLength !== 1 ? 'dropdown dropdown-bottom' : null
                )}
                onClick={handleClickMarketIcon('BINANCE', marketSymbol)}
              >
                <label tabIndex={0} className='text-zinc-500 text-sm cursor-pointer'>
                  <AiOutlineAreaChart />
                </label>
                <ul
                  tabIndex={0}
                  className={classNames(
                    'dropdown-content menu p-2 shadow bg-base-100 rounded-box w-32',
                    chartLength === 1 ? 'hidden pointer-events-none' : null
                  )}
                >
                  {[...new Array(chartLength)].map((_, i) => (
                    <li
                      key={i}
                      onClick={handleClickChangeSubscribeChart('BINANCE', marketSymbol, i)}
                    >
                      <span>{i + 1}번 차트</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </td>
      <td className={colorPrice}>
        <p>
          <span ref={krwPriceRef}>
            {krwTooSmallNumber
              ? `0.${krwPriceDecimal}`
              : numeral(krwPriceNum).format(
                  `0,0[.]${currency === 'KRW' ? krwPricePad : usdPricePad}`
                )}
          </span>
        </p>
        <p className={'opacity-60'}>
          <span ref={usdPriceRef}>
            {upbitMarket?.binance_price
              ? usdTooSmallNumber
                ? `0.${usdPriceDecimal}`
                : numeral(usdPriceNum).format(
                    `0,0[.]${currency === 'KRW' ? krwPricePad : usdPricePad}`
                  )
              : null}
          </span>
        </p>
      </td>
      <td className={colorPrice}>
        <p>{upbitChangeRate.toFixed(2)}%</p>
        <p className={'opacity-60'}>
          {currency === 'KRW'
            ? krwTooSmallNumber
              ? `0.${upbitMarket.scp}`
              : numeral(upbitMarket.scp).format(`0,0[.][${krwPricePad}]`)
            : 0.000001 > usdChange
            ? `${usdChange.toFixed(usdPriceDecimal.length)}`
            : numeral(usdChange).format(`0,0[.][${usdPricePad}]`)}
        </p>
      </td>
      <td className={colorPremium}>
        {typeof upbitMarket.premium === 'number' && (
          <>
            <p>{upbitMarket.premium.toFixed(2).padStart(2, '0')}%</p>
            <p className={'opacity-60'}>
              {upbitMarket.binance_price
                ? currency === 'KRW'
                  ? krwTooSmallNumber
                    ? `${upbitMarket.tp - Number(upbitMarket.binance_price) * upbitForex.basePrice}`
                    : numeral(
                        upbitMarket.tp - Number(upbitMarket.binance_price) * upbitForex.basePrice
                      ).format(`0,0[.][${krwPricePad}]`)
                  : 0.000001 > usdPremium
                  ? (
                      upbitMarket.tp / upbitForex.basePrice -
                      Number(upbitMarket.binance_price)
                    ).toFixed(usdPriceDecimal.length)
                  : numeral(usdPremium).format(`0,0[.][${usdPricePad}]`)
                : null}
            </p>
          </>
        )}
      </td>
      <td className='text-gray-400'>
        <p>{koPriceLabelFormat(upbitMarket.atp24h)}</p>
        <p className='opacity-60'>
          {upbitMarket.binance_price &&
            koPriceLabelFormat(Number(upbitMarket.binance_volume) * upbitForex.basePrice)}
        </p>
      </td>
    </tr>
  );
};

export default memo(TableItem, isEqual);
