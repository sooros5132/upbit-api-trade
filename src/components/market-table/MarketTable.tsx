/* eslint-disable @next/next/no-img-element */
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import isEqual from 'react-fast-compare';
import { BiUpArrowAlt, BiDownArrowAlt } from 'react-icons/bi';
import { IUpbitForex, IUpbitSocketMessageTickerSimple } from 'src/types/upbit';
import { koPriceLabelFormat } from 'src/utils/utils';
import { NextSeo } from 'next-seo';
import { clientApiUrls } from 'src/utils/clientApiUrls';
import { AiOutlineAreaChart } from 'react-icons/ai';
import { TiPin } from 'react-icons/ti';
import { useExchangeStore } from 'src/store/exchangeSockets';
import { krwRegex, marketRegex } from 'src/utils/regex';
import { useMarketTableSettingStore } from 'src/store/marketTableSetting';
import { useTradingViewSettingStore } from 'src/store/tradingViewSetting';
import shallow from 'zustand/shallow';
import { RiCloseCircleLine } from 'react-icons/ri';
import { GoPrimitiveDot } from 'react-icons/go';
import formatInTimeZone from 'date-fns-tz/formatInTimeZone';
import { ko as koLocale } from 'date-fns/locale';
import classNames from 'classnames';
import { BackgroundBlueBox, BackgroundRedBox } from '../modules/Box';
import { AskBidParagraph } from '../modules/Typography';

export interface IMarketTableItem extends IUpbitSocketMessageTickerSimple {
  korean_name?: string;
  english_name?: string;
  binance_price?: string;
  binance_volume?: string;
  premium?: number;
}

interface MarketTableProps {
  upbitForex: IUpbitForex;
  isLastUpdatePage?: boolean;
}

const MarketTable: React.FC<MarketTableProps> = memo(({ upbitForex, isLastUpdatePage }) => {
  const { sortColumn, sortType, setSortColumn, setSortType } = useMarketTableSettingStore();
  const { connectedUpbit, connectedBinance, lastUpdatedAt } = useExchangeStore(
    ({ upbitSocket, binanceSocket, lastUpdatedAt }) => {
      let connectedUpbit = false;
      let connectedBinance = false;
      if (upbitSocket?.readyState === 1) {
        connectedUpbit = true;
      }
      if (binanceSocket?.readyState === 1) {
        connectedBinance = true;
      }
      return {
        connectedUpbit,
        connectedBinance,
        lastUpdatedAt
      };
    },
    shallow
  );
  const [searchValue, setSearchValue] = useState('');

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

  const handleClickConnectSocket = (prop: 'upbit' | 'binance') => () => {
    switch (prop) {
      case 'upbit': {
        const { connectUpbitSocket, upbitMarkets } = useExchangeStore.getState();
        if (!connectedUpbit) {
          // enqueueSnackbar('업비트 서버에 다시 연결을 시도합니다.', {
          //   variant: 'success'
          // });
          useExchangeStore.setState({ upbitSocket: undefined });
          connectUpbitSocket({
            upbitMarkets: upbitMarkets
          });
        }
        break;
      }
      case 'binance': {
        const { connectBinanceSocket, upbitMarkets } = useExchangeStore.getState();
        if (!connectedBinance) {
          // enqueueSnackbar('바이낸스 서버에 다시 연결을 시도합니다.', {
          //   variant: 'success'
          // });
          useExchangeStore.setState({ binanceSocket: undefined });
          const markets = upbitMarkets.map(
            (m) => m.market.replace(krwRegex, '').toLowerCase() + 'usdt@ticker'
          );
          connectBinanceSocket({
            binanceMarkets: markets
          });
        }

        break;
      }
    }
  };

  return (
    <div className='max-w-screen-xl mx-auto text-xs sm:text-sm'>
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
                      href='https://support.google.com/adsense/answer/12654?hl=ko'
                      style={{
                        textDecoration: 'underline',
                        color: 'lightyellow'
                      }}
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
          <div className='flex items-center justify-between'>
            <div className='flex flex-nowrap'>
              <div className='tooltip' data-tip={connectedUpbit ? '연결 됨' : '재연결'}>
                <div
                  className={classNames(
                    'flex items-center',
                    connectedBinance ? undefined : 'cursor-pointer'
                  )}
                  onClick={handleClickConnectSocket('upbit')}
                >
                  <span>업비트</span>
                  <div className={classNames(connectedUpbit ? 'text-green-500' : 'text-red-500')}>
                    <GoPrimitiveDot />
                  </div>
                </div>
              </div>
              <div className='mx-1' />
              <div className='tooltip' data-tip={connectedUpbit ? '연결 됨' : '재연결'}>
                <div
                  className={classNames(
                    'flex items-center',
                    connectedBinance ? undefined : 'cursor-pointer'
                  )}
                  onClick={handleClickConnectSocket('binance')}
                >
                  <span>바이낸스</span>
                  <div className={classNames(connectedBinance ? 'text-green-500' : 'text-red-500')}>
                    <GoPrimitiveDot />
                  </div>
                </div>
              </div>
            </div>
            <div className='flex justify-end'>
              <div className='form-control'>
                <label className='input-group input-group-md'>
                  <input
                    type='text'
                    placeholder='BTC, 비트, Bitcoin'
                    value={searchValue}
                    onChange={handleChangeMarketSearchInput}
                    className='input input-bordered w-[170px]'
                  />
                  <span>
                    <RiCloseCircleLine />
                  </span>
                </label>
              </div>
            </div>
          </div>
        </>
      )}
      <table className='table w-full [&_td]:text-xs sm:[&_td]:text-sm  table-compact'>
        <thead>
          <tr className='[&>td]:text-gray-600'>
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
            <th className='market-td-padding w-auto sm:w-[10%]'>
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
        <TableBody upbitForex={upbitForex} sortColumn={sortColumn} sortType={sortType} />
      </table>
    </div>
  );
}, isEqual);

const TableBody = React.memo<{
  upbitForex: IUpbitForex;
  sortColumn: keyof IMarketTableItem;
  sortType: 'ASC' | 'DESC';
  // upbitMarketSnapshot?: Record<string, IMarketTableItem>;
  // binanceMarketSnapshot?: Record<string, IBinanceSocketMessageTicker>;
}>(({ upbitForex, sortColumn, sortType }) => {
  const { hydrated, favoriteSymbols } = useMarketTableSettingStore(
    ({ hydrated, favoriteSymbols }) => ({ hydrated, favoriteSymbols }),
    shallow
  );
  const searchedSymbols = useExchangeStore(({ searchedSymbols }) => searchedSymbols, shallow);

  useEffect(() => {
    const { hydrated, setHydrated } = useMarketTableSettingStore.getState();

    if (!hydrated) setHydrated();
  }, []);

  useEffect(() => {
    useExchangeStore.getState().sortSymbolList(sortColumn, sortType);
    const interval = setInterval(() => {
      useExchangeStore.getState().sortSymbolList(sortColumn, sortType);
      // setNum((prev) => 1 - prev);
    }, 3000);
    return () => clearInterval(interval);
  }, [sortColumn, sortType]);

  return (
    <tbody className='[&>tr:hover>td]:bg-white/5'>
      {searchedSymbols.map((krwSymbol, index) => {
        const favorite = hydrated ? Boolean(favoriteSymbols[krwSymbol]) : false;

        return (
          <TableItem
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
}, isEqual);

TableBody.displayName = 'TableBody';

const TableItem = React.memo<{
  krwSymbol: string;
  // upbitMarket: IMarketTableItem;
  upbitForex: IUpbitForex;
  favorite: boolean;
}>(({ krwSymbol, upbitForex, favorite }) => {
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

  const handleClickMarketIcon = useCallback(
    (symbol: string, exchange: 'BINANCE' | 'UPBIT') => () => {
      const { setSelectedMarketSymbol, setSelectedExchange } =
        useTradingViewSettingStore.getState();
      setSelectedMarketSymbol(symbol);
      setSelectedExchange(exchange);
      window.scrollTo(0, 0);
    },
    []
  );
  const handleClickStarIcon = useCallback(
    (symbol: string) => () => {
      if (!favorite) {
        useMarketTableSettingStore.getState().addFavoriteSymbol(symbol);
      } else {
        useMarketTableSettingStore.getState().removeFavoriteSymbol(symbol);
      }
      const { sortColumn, sortType } = useMarketTableSettingStore.getState();
      useExchangeStore.getState().sortSymbolList(sortColumn, sortType);
    },
    [favorite]
  );

  //
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
    <tr className='border-b border-white/5 min-w-[40px] p-1'>
      {selectedMarketSymbol === marketSymbol && (
        <NextSeo
          // title={bitcoinPremium ? `${bitcoinPremium?.toFixed(2)}%` : undefined}
          title={title}
        />
      )}
      <td className='market-td-padding'>
        <div className='text-center'>
          <img
            className='object-contain overflow-hidden bg-white rounded-full'
            src={`/asset/upbit/logos/${marketSymbol}.png`}
            alt={`${upbitMarket.cd}-icon`}
            loading='lazy'
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
        {/* <FlexBox>
          <HoverUnderlineBox>
            <Link href={'/trade/' + upbitMarket.cd}>
              <a> */}
        <div className='flex items-center'>
          {/* <ChartIconBox fontSize={theme.size.px16} mr={0.5}>
            <RiExchangeLine />
          </ChartIconBox> */}
          <span className='text-gray-300 whitespace-pre-wrap'>{upbitMarket.korean_name}</span>
        </div>
        {/* </a>
            </Link>
          </HoverUnderlineBox>
        </FlexBox> */}
        <div className='flex'>
          <a
            href={clientApiUrls.upbit.marketHref + upbitMarket.cd}
            target='_blank'
            rel='noreferrer'
          >
            <img
              className='market-exchange-image'
              src='/icons/upbit.png'
              alt='upbit favicon'
              loading='lazy'
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
                <img
                  className='market-exchange-image'
                  src='/icons/binance.ico'
                  alt='upbit favicon'
                  loading='lazy'
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
        <AskBidParagraph state={upbitMarket.scp} opacity={0.7}>
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
        <AskBidParagraph state={upbitMarket.scp} opacity={0.7}>
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
            <AskBidParagraph state={upbitMarket.premium} opacity={0.7}>
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
      <td className='font-mono text-right market-td-padding whitespace-nowrap'>
        <p className='text-gray-400'>{koPriceLabelFormat(upbitMarket.atp24h)}</p>
        <p className='text-gray-600'>
          {upbitMarket.binance_price &&
            koPriceLabelFormat(Number(upbitMarket.binance_volume) * upbitForex.basePrice)}
        </p>
      </td>
    </tr>
  );
}, isEqual);

TableItem.displayName = 'TableItem';
MarketTable.displayName = 'MarketTable';

export default MarketTable;
