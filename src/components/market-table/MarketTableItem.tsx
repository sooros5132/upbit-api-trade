import classNames from 'classnames';
import { isEqual } from 'lodash';
import Image from 'next/image';
import React from 'react';
import { memo, useEffect, useRef } from 'react';
import { AiOutlineAreaChart } from 'react-icons/ai';
import { TiPin } from 'react-icons/ti';
import { useExchangeStore } from 'src/store/exchangeSockets';
import { useMarketTableSettingStore } from 'src/store/marketTableSetting';
import { useTradingViewSettingStore } from 'src/store/tradingViewSetting';
import { IUpbitForex } from 'src/types/upbit';
import { apiUrls } from 'src/lib/apiUrls';
import { marketRegex } from 'src/utils/regex';
import { koPriceLabelFormat } from 'src/utils/utils';
import shallow from 'zustand/shallow';
import numeral from 'numeral';

export interface TableItemProps {
  krwSymbol: string;
  // upbitMarket: IMarketTableItem;
  upbitForex: IUpbitForex;
  favorite: boolean;
}

const TableItem: React.FC<TableItemProps> = ({ krwSymbol, upbitForex, favorite }) => {
  const krwPriceRef = useRef<HTMLSpanElement>(null);
  const usdPriceRef = useRef<HTMLSpanElement>(null);
  const { highlight, currency } = useMarketTableSettingStore(
    ({ highlight, currency }) => ({ highlight, currency }),
    shallow
  );
  const upbitMarket = useExchangeStore((state) => state.upbitMarketDatas[krwSymbol], shallow);
  const marketSymbol = upbitMarket.cd.replace(marketRegex, '');

  // const upbitBtcMarket = useExchangeStore(
  //   (state) => state.upbitMarketDatas['BTC-' + marketSymbol],
  //   shallow
  // );
  // const upbitBtcPrice = useExchangeStore.getState().upbitMarketDatas['KRW-BTC'];

  const handleClickMarketIcon = (symbol: string, exchange: 'BINANCE' | 'UPBIT') => () => {
    const { setSelectedMarketSymbol, setSelectedExchange } = useTradingViewSettingStore.getState();
    setSelectedMarketSymbol(symbol);
    setSelectedExchange(exchange);

    switch (exchange) {
      case 'UPBIT': {
        useExchangeStore.getState().connectUpbitSocket();
        break;
      }
      case 'BINANCE': {
        useExchangeStore.getState().connectBinanceSocket();
        break;
      }
    }

    window.scrollTo(0, 0);
  };

  const handleClickStarIcon = (symbol: string) => () => {
    if (!favorite) {
      useMarketTableSettingStore.getState().addFavoriteSymbol(symbol);
    } else {
      useMarketTableSettingStore.getState().removeFavoriteSymbol(symbol);
    }
    const { sortColumn, sortType } = useMarketTableSettingStore.getState();
    useExchangeStore.getState().sortSymbolList(sortColumn, sortType);
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
      ? 'text-teal-500'
      : 'text-rose-500';

  const colorPremium =
    !upbitMarket.premium || upbitMarket.premium === 0
      ? 'text-gray-400'
      : upbitMarket.premium > 0
      ? 'text-teal-500'
      : 'text-rose-500';

  return (
    <tr className='border-b border-base-300 min-w-[40px] p-1 [&:hover>td]:bg-white/5'>
      <td className='market-td-padding'>
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
      <td className='market-td-padding'>
        <div className='flex items-center'>
          <span className='text-gray-300 whitespace-pre-wrap'>{upbitMarket.korean_name}</span>
        </div>
        <div className='flex'>
          <a href={apiUrls.upbit.marketHref + upbitMarket.cd} target='_blank' rel='noreferrer'>
            <Image
              className='market-exchange-image'
              src='/icons/upbit.png'
              width={14}
              height={14}
              loading='lazy'
              alt='upbit favicon'
            />
          </a>
          <div className='market-chart-icon' onClick={handleClickMarketIcon(marketSymbol, 'UPBIT')}>
            <AiOutlineAreaChart />
          </div>
          &nbsp;
          {upbitMarket.binance_price && (
            <>
              <a
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
                className='market-chart-icon'
                onClick={handleClickMarketIcon(marketSymbol, 'BINANCE')}
              >
                <AiOutlineAreaChart />
              </div>
            </>
          )}
        </div>
      </td>
      <td className='font-mono text-right market-td-padding whitespace-nowrap'>
        <p className={colorPrice}>
          <span ref={krwPriceRef}>
            {krwTooSmallNumber
              ? `0.${krwPriceDecimal}`
              : numeral(krwPriceNum).format(
                  `0,0[.]${currency === 'KRW' ? krwPricePad : usdPricePad}`
                )}
          </span>
        </p>
        <p className={classNames('opacity-60', colorPrice)}>
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
      <td className='font-mono text-right market-td-padding whitespace-nowrap'>
        <p className={colorPrice}>{upbitChangeRate.toFixed(2)}%</p>
        <p className={classNames('opacity-60', colorPrice)}>
          {currency === 'KRW'
            ? krwTooSmallNumber
              ? `0.${upbitMarket.scp}`
              : numeral(upbitMarket.scp).format(`0,0[.][${krwPricePad}]`)
            : 0.000001 > usdChange
            ? `${usdChange.toFixed(usdPriceDecimal.length)}`
            : numeral(usdChange).format(`0,0[.][${usdPricePad}]`)}
        </p>
      </td>
      <td className={classNames('font-mono text-right market-td-padding whitespace-nowrap')}>
        {typeof upbitMarket.premium === 'number' && (
          <>
            <p className={colorPremium}>{upbitMarket.premium.toFixed(2).padStart(2, '0')}%</p>
            <p className={classNames('opacity-60', colorPremium)}>
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
      <td className='font-mono text-right text-gray-400 market-td-padding whitespace-nowrap'>
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
