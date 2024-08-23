import type { NextPage } from 'next';
import type React from 'react';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import shallow from 'zustand/shallow';
import axios from 'axios';
import Link from 'next/link';
import siteConfig from 'site-config';
import classNames from 'classnames';
import { IUpbitApiTicker, IUpbitMarket } from 'src/types/upbit';
import { apiUrls, PROXY_PATH } from 'src/lib/apiUrls';
import { IBinanceSocketTicker, IBinanceTickerPrice } from 'src/types/binance';
import { useExchangeStore } from 'src/store/exchangeSockets';
import { krwRegex } from 'src/utils/regex';
import { keyBy, sortBy } from 'lodash';
import { useMarketTableSettingStore } from 'src/store/marketTableSetting';
import { useSiteSettingStore } from 'src/store/siteSetting';
import MarketTable, { IMarketTableItem } from 'src/components/market-table/MarketTable';
import { BackgroundRedBox } from 'src/components/modules/Box';
import { Chart } from 'src/components/Chart/Chart';
import { UpbitOrderform } from 'src/components/Upbit/Orderform';
import { UpbitRecentTrades } from 'src/components/Upbit/Trades';
import { UpbitOrderBook } from 'src/components/Upbit/Orderbook';
import { UpbitOrders } from 'src/components/Upbit/Orders';
import { useUpbitApiStore } from 'src/store/upbitApi';
import { UpbitMarketHeader } from 'src/components/Upbit/MarketHeader';

const Home: NextPage = () => {
  const hydrated = useSiteSettingStore((state) => state.hydrated, shallow);
  const isLogin = useUpbitApiStore((state) => state.isLogin, shallow);

  return (
    <main
      className={classNames(
        'main-grid w-full mt-1 px-3 max-w-7xl mx-auto sm:gap-[1px] sm:p-0 lg:max-w-none lg:grow',
        siteConfig.upbitApiTrade ? 'main-grid-trade' : null,
        siteConfig.upbitApiTrade && !isLogin ? 'not-login' : null
      )}
    >
      <div data-grid-area='header'>
        <UpbitMarketHeader />
      </div>
      {/* <div className='overflow-x-auto overflow-y-hidden lg:col-span-3 lg:row-span-1'>
        <div className='mx-auto'>
          <TradingViewTickers pointerEvents='none' />
        </div>
      </div> */}
      <div data-grid-area='chart' className='overflow-y-auto'>
        {hydrated && <Chart />}
      </div>
      <div data-grid-area='orderbook' className='max-h-40 sm:max-h-[initial]'>
        {hydrated && <UpbitOrderBook />}
      </div>
      {siteConfig.upbitApiTrade && (
        <>
          {hydrated && (
            <div data-grid-area='orderform'>
              <UpbitOrderform />
            </div>
          )}
          {hydrated && (
            <div data-grid-area='orders' className='max-h-40 sm:max-h-[initial]'>
              <UpbitOrders />
            </div>
          )}
        </>
      )}
      <div data-grid-area='trades' className='max-h-28 sm:max-h-[initial]'>
        <UpbitRecentTrades />
      </div>
      <div
        data-grid-area='market'
        className='w-full flex flex-col text-xs sm:text-sm lg:text-xs xl:text-sm'
      >
        {hydrated && <ExchangeMarket />}
      </div>
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
              <p className='mt-3'>
                또는{' '}
                <Link href='/last'>
                  <a className='text-white underline'>현재 시세보는 페이지</a>
                </Link>
              </p>
            </div>
          </BackgroundRedBox>
        </div>
      </noscript>
    </main>
  );
};

const ExchangeMarket: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const { data: forexRecent } = useSWR(
    PROXY_PATH + apiUrls.upbit.path + apiUrls.upbit.forex.recent
  );

  useEffect(() => {
    if (isReady) {
      return;
    }
    if (!forexRecent) {
      return;
    }
    (async function () {
      try {
        useSiteSettingStore.setState({ isLastUpdatePage: false });
        const upbitMarketAllRecord: Record<string, IUpbitMarket> = {};
        const upbitMarketAll = await axios
          .get<Array<IUpbitMarket>>(
            apiUrls.upbit.rewriteUrl + apiUrls.upbit.market.all + '?isDetails=false'
          )
          .then((res) => {
            const list = sortBy(
              res.data?.filter((m) => {
                if (Boolean(m.market.match(krwRegex))) {
                  upbitMarketAllRecord[m.market] = m;
                  return true;
                }
                // BTC 마켓은 아래 코드 사용
                // if (!Boolean(m.market.match(usdtRegex))) {
                //   upbitMarketRecord[m.market] = m;
                //   return true;
                // }
              }),
              'korean_name'
            );

            return list;
          });
        const symbolList = upbitMarketAll?.map((m: IUpbitMarket) => m.market);
        const upbitSymbols = symbolList.join(',');

        // 바이낸스는 해당 마켓이 없을 경우 에러를 냄 -> 전체 리스트를 가져와서 정렬.
        const [upbitMarketSnapshot, binanceMarketSnapshot] = await Promise.all([
          axios
            .get<Array<IUpbitApiTicker>>(
              apiUrls.upbit.rewriteUrl + apiUrls.upbit.ticker + '?markets=' + upbitSymbols
            )
            .then((res) => res.data),
          // fetch(`${binanceApis.tickerPrice}?symbols=${binanceSymbols}`).then((res) => res.json())
          axios
            .get<Array<IBinanceTickerPrice>>(
              apiUrls.binance.rewriteUrl + apiUrls.binance.ticker.price
            )
            .then((res) => res.data)
        ]);

        const binanceMarketSnapshotKeyBy = keyBy(binanceMarketSnapshot, 'symbol');
        const upbitMarketSnapshotRecord: Record<string, IMarketTableItem> = {};
        const binanceMarketSnapshotRecord: Record<string, IBinanceSocketTicker> = {};
        const binanceMarketAll: Array<IUpbitMarket> = [];

        for (const m of binanceMarketSnapshot) {
          binanceMarketSnapshotRecord[m.symbol] = {
            p: m.price,
            s: m.symbol
          } as IBinanceSocketTicker;
        }

        for (const t of upbitMarketSnapshot) {
          const symbol = t.market?.replace(krwRegex, '');
          let binanceSymbol: string | undefined = symbol + 'USDT';
          switch (symbol) {
            case 'BTT': {
              binanceSymbol = 'BTTCUSDT';
              break;
            }
            case 'BTG':
            case 'NU': {
              binanceSymbol = undefined;
              break;
            }
          }
          upbitMarketSnapshotRecord[t.market] = {
            ty: 'ticker',
            cd: t.market,
            op: t.opening_price,
            hp: t.high_price,
            lp: t.low_price,
            tp: t.trade_price,
            pcp: t.prev_closing_price,
            c: t.change,
            cp: t.change_price,
            scp: t.signed_change_price,
            cr: t.change_rate,
            scr: t.signed_change_rate,
            tv: t.trade_volume,
            atv: t.acc_trade_volume,
            atv24h: t.acc_trade_volume_24h,
            atp: t.acc_trade_price,
            atp24h: t.acc_trade_price_24h,
            tdt: t.trade_date_kst,
            ttm: t.trade_time_kst,
            ttms: t.trade_timestamp,
            ab: 'ASK',
            aav: 0,
            abv: 0,
            h52wp: t.highest_52_week_price,
            h52wdt: t.highest_52_week_date,
            l52wp: t.lowest_52_week_price,
            l52wdt: t.lowest_52_week_date,
            ms: 'ACTIVE',
            mw: 'NONE',
            its: false,
            dd: null,
            tms: t.timestamp,
            st: 'SNAPSHOT',
            english_name: upbitMarketAllRecord[t.market].english_name,
            korean_name: upbitMarketAllRecord[t.market].korean_name
          };

          // 바이낸스 가격 넣기
          if (binanceSymbol && binanceMarketSnapshotKeyBy[binanceSymbol]) {
            const binanceMarket = binanceMarketSnapshotKeyBy[binanceSymbol];
            const binanceKrwPrice = Number(binanceMarket.price) * forexRecent.basePrice;
            binanceMarketAll.push({
              market: binanceMarketSnapshotKeyBy[binanceSymbol].symbol,
              english_name: upbitMarketAllRecord[t.market].english_name,
              korean_name: upbitMarketAllRecord[t.market].korean_name
            });

            const premium = (1 - binanceKrwPrice / t.trade_price) * 100;
            upbitMarketSnapshotRecord[t.market].binance_price =
              binanceMarketSnapshotKeyBy[binanceSymbol]?.price;
            upbitMarketSnapshotRecord[t.market].premium = premium;
          }
        }

        useExchangeStore.setState({ upbitForex: forexRecent, lastUpdatedAt: new Date() });

        if (upbitMarketSnapshotRecord)
          useExchangeStore.setState({ upbitMarketDatas: upbitMarketSnapshotRecord });
        const upbitKrwSymbolList = upbitMarketSnapshot
          .filter((c) => krwRegex.test(c.market))
          .map((m) => m.market);

        useExchangeStore.setState({
          upbitMarkets: upbitMarketAll,
          searchedSymbols: upbitKrwSymbolList,
          sortedUpbitMarketSymbolList: upbitKrwSymbolList,
          binanceMarkets: sortBy(binanceMarketAll, 'korean_name')
        });
        useMarketTableSettingStore.getState().setSortColumn('tp');
        useMarketTableSettingStore.getState().setSortType('DESC');
        useExchangeStore.getState().sortSymbolList('tp', 'DESC');
        useExchangeStore.setState({
          sortedUpbitMarketSymbolList: useExchangeStore.getState().searchedSymbols
        });

        const { connectBinanceSocket, connectUpbitSocket } = useExchangeStore.getState();
        connectUpbitSocket();
        connectBinanceSocket();

        setIsReady(true);
      } catch (e) {}
    })();
  }, [forexRecent, isReady]);

  return <MarketTable />;
};

export default Home;
