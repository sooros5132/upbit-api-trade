import classNames from 'classnames';
import { isEqual } from 'lodash';
import Image from 'next/image';
import React from 'react';
import { memo, useEffect, useRef } from 'react';
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
import { useUpbitAuthStore } from 'src/store/upbitAuth';
import { useSiteSettingStore } from 'src/store/siteSetting';

export interface TableItemProps {
  krwSymbol: string;
  // upbitMarket: IMarketTableItem;
  upbitForex: IUpbitForex;
  favorite: boolean;
}

const TableItem: React.FC<TableItemProps> = ({ krwSymbol, upbitForex, favorite }) => {
  const krwPriceRef = useRef<HTMLSpanElement>(null);
  const usdPriceRef = useRef<HTMLSpanElement>(null);
  const isLogin = useUpbitAuthStore((state) => Boolean(state.accessKey), shallow);
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

    //   switch (exchange) {
    //     case 'UPBIT': {
    //       useExchangeStore.getState().connectUpbitSocket();
    //       break;
    //     }
    //     case 'BINANCE': {
    //       useExchangeStore.getState().connectBinanceSocket();
    //       break;
    //     }
    //   }

    //   window.scrollTo(0, 0);
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
      useSiteSettingStore.getState().setUpbitTradeMarket(market);
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
    <tr className={classNames('cursor-pointer')} onClick={handleClickMarket(upbitMarket.cd)}>
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
      <td className='text-left'>
        <div className='flex items-center'>
          <span className='text-gray-300 whitespace-pre-wrap font-sans'>
            {upbitMarket.korean_name}
          </span>
        </div>
        <div className='flex'>
          <div className='flex-center' onClick={(evt) => evt.stopPropagation()}>
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
            {/* <div className='market-chart-icon' onClick={handleClickMarketIcon(marketSymbol, 'UPBIT')}>
            <AiOutlineAreaChart />
          </div> */}
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
                {/* <div
                className='market-chart-icon'
                onClick={handleClickMarketIcon(marketSymbol, 'BINANCE')}
              >
                <AiOutlineAreaChart />
              </div> */}
              </>
            )}
          </div>
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
