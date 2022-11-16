import classNames from 'classnames';
import { isEqual } from 'lodash';
import { NextSeo } from 'next-seo';
import Image from 'next/image';
import React from 'react';
import { memo, useEffect, useRef } from 'react';
import { AiOutlineAreaChart } from 'react-icons/ai';
import { TiPin } from 'react-icons/ti';
import { useExchangeStore } from 'src/store/exchangeSockets';
import { useMarketTableSettingStore } from 'src/store/marketTableSetting';
import { useTradingViewSettingStore } from 'src/store/tradingViewSetting';
import { IUpbitForex } from 'src/types/upbit';
import { clientApiUrls } from 'src/utils/clientApiUrls';
import { marketRegex } from 'src/utils/regex';
import { koPriceLabelFormat } from 'src/utils/utils';
import shallow from 'zustand/shallow';
import { AskBidParagraph } from '../modules/Typography';

export interface TableItemProps {
  krwSymbol: string;
  // upbitMarket: IMarketTableItem;
  upbitForex: IUpbitForex;
  favorite: boolean;
}

const TableItem: React.FC<TableItemProps> = ({ krwSymbol, upbitForex, favorite }) => {
  const krwPriceRef = useRef<HTMLSpanElement>(null);
  const usdPriceRef = useRef<HTMLSpanElement>(null);
  const highlight = useMarketTableSettingStore((state) => state.highlight, shallow);
  const upbitMarket = useExchangeStore((state) => state.upbitMarketDatas[krwSymbol], shallow);
  const marketSymbol = upbitMarket.cd.replace(marketRegex, '');

  // const upbitBtcMarket = useExchangeStore(
  //   (state) => state.upbitMarketDatas['BTC-' + marketSymbol],
  //   shallow
  // );
  // const upbitBtcPrice = useExchangeStore.getState().upbitMarketDatas['KRW-BTC'];

  const { selectedMarketSymbol, selectedExchange } = useTradingViewSettingStore();

  const handleClickMarketIcon = (symbol: string, exchange: 'BINANCE' | 'UPBIT') => () => {
    const { setSelectedMarketSymbol, setSelectedExchange } = useTradingViewSettingStore.getState();
    setSelectedMarketSymbol(symbol);
    setSelectedExchange(exchange);
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
  }, [highlight, krwPriceRef, krwSymbol]);

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

  let title = 'SOOROS';
  if (selectedMarketSymbol === marketSymbol) {
    // const titleSymbol = `KRW-${selectedMarketSymbol || 'BTC'}`;

    switch (selectedExchange) {
      case 'BINANCE': {
        title = upbitMarket.binance_price
          ? `${selectedMarketSymbol} ${Number(upbitMarket.binance_price).toLocaleString()}$`
          : '';
        break;
      }
      case 'UPBIT': {
        title = `${selectedMarketSymbol} ${upbitMarket.tp.toLocaleString()}₩`;
        break;
      }
    }
  }
  // const priceIntegerLength = String(upbitMarket.tp).replace(
  //   /\.[0-9]+$/,
  //   ""
  // ).length;

  const priceDecimalLength = String(upbitMarket.tp).replace(/^[0-9]+\.?/, '').length;

  return (
    <tr className='border-b border-base-300 min-w-[40px] p-1 [&:hover>td]:bg-white/5'>
      {selectedMarketSymbol === marketSymbol && (
        <NextSeo
          // title={bitcoinPremium ? `${bitcoinPremium?.toFixed(2)}%` : undefined}
          title={title}
        />
      )}
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
          <a
            href={clientApiUrls.upbit.marketHref + upbitMarket.cd}
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
          <div className='market-chart-icon' onClick={handleClickMarketIcon(marketSymbol, 'UPBIT')}>
            <AiOutlineAreaChart />
          </div>
          &nbsp;
          {upbitMarket.binance_price && (
            <>
              <a
                href={`${clientApiUrls.binance.marketHref}/${marketSymbol}_USDT`}
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
        <AskBidParagraph state={upbitMarket.scp}>
          <span ref={krwPriceRef}>
            {upbitMarket.tp > 1 ? upbitMarket.tp.toLocaleString() : upbitMarket.tp}
          </span>
          {/* <br />
          {upbitBtcMarket && upbitBtcPrice
            ? Number(
                (upbitBtcMarket.tp * upbitBtcPrice.tp).toFixed(priceDecimalLength)
              ).toLocaleString()
            : ''} */}
        </AskBidParagraph>
        <AskBidParagraph state={upbitMarket.scp} className='opacity-60'>
          <span ref={usdPriceRef}>
            {upbitMarket.binance_price
              ? Number(upbitMarket.binance_price) * upbitForex.basePrice > 1
                ? Number(
                    (Number(upbitMarket.binance_price) * upbitForex.basePrice).toFixed(
                      priceDecimalLength
                    )
                  ).toLocaleString()
                : Number(Number(upbitMarket.binance_price) * upbitForex.basePrice).toFixed(
                    priceDecimalLength
                  )
              : null}
          </span>
        </AskBidParagraph>
      </td>
      <td className='font-mono text-right market-td-padding whitespace-nowrap'>
        <AskBidParagraph state={upbitMarket.scp}>{upbitChangeRate.toFixed(2)}%</AskBidParagraph>
        <AskBidParagraph state={upbitMarket.scp} className='opacity-60'>
          {upbitMarket.scp.toLocaleString()}
          {/* {binanceChangeRate && binanceChangeRate.toFixed(2) + '%'} */}
        </AskBidParagraph>
      </td>

      <td className='font-mono text-right market-td-padding whitespace-nowrap'>
        {typeof upbitMarket.premium === 'number' && (
          <>
            <AskBidParagraph state={upbitMarket.premium}>
              {upbitMarket.premium.toFixed(2).padStart(2, '0')}%
            </AskBidParagraph>
            <AskBidParagraph state={upbitMarket.premium} className='opacity-60'>
              {upbitMarket.binance_price &&
                Number(
                  (
                    upbitMarket.tp -
                    Number(upbitMarket.binance_price) * upbitForex.basePrice
                  ).toFixed(priceDecimalLength)
                ).toLocaleString()}
            </AskBidParagraph>
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
