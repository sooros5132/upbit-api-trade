import type { GetServerSideProps, NextPage } from 'next';
import { useMemo, useState } from 'react';
import { upbitApis } from 'src-server/utils/upbitApis';
import MarketTable, { IMarketTableItem } from 'src/components/market-table/MarketTable';
import { IUpbitForex, IUpbitMarket } from 'src/types/upbit';
import { IBinanceSocketMessageTicker } from 'src/types/binance';
import { useExchangeStore } from 'src/store/exchangeSockets';
import { krwRegex } from 'src/utils/regex';
import { binanceApis } from 'src-server/utils/binanceApis';
import { keyBy } from 'lodash';
import { useMarketTableSettingStore } from 'src/store/marketTableSetting';

interface HomeProps {
  upbitForex: IUpbitForex;
  upbitMarketList: Array<IUpbitMarket>;
  upbitMarketSnapshot?: Record<string, IMarketTableItem>;
  binanceMarketSnapshot?: Record<string, IBinanceSocketMessageTicker>;
  lastUpdatedAt: string;
}

const Home: NextPage<HomeProps> = ({
  upbitForex,
  upbitMarketList,
  upbitMarketSnapshot,
  binanceMarketSnapshot,
  lastUpdatedAt
}) => {
  const upbitKrwList = useMemo(
    () => upbitMarketList.filter((c) => krwRegex.test(c.market)),
    [upbitMarketList]
  );
  const [isMounted, setMounted] = useState(false);

  if (!isMounted && upbitMarketSnapshot) {
    useExchangeStore.setState({ upbitForex, lastUpdatedAt: new Date(lastUpdatedAt) });

    if (upbitMarketSnapshot) useExchangeStore.setState({ upbitMarketDatas: upbitMarketSnapshot });
    if (upbitMarketList) {
      const symbolList = upbitKrwList.map((m) => m.market);

      useExchangeStore.setState({
        upbitMarkets: upbitMarketList,
        searchedSymbols: symbolList,
        sortedUpbitMarketSymbolList: symbolList
      });
      useMarketTableSettingStore.getState().setSortColumn('tp');
      useMarketTableSettingStore.getState().setSortType('DESC');
      useExchangeStore.getState().sortSymbolList('tp', 'DESC');
      useExchangeStore.setState({
        sortedUpbitMarketSymbolList: useExchangeStore.getState().searchedSymbols
      });
    }
  }

  return (
    <main className='relative w-full px-3 mx-auto max-w-7xl'>
      <MarketTable upbitForex={upbitForex} isLastUpdatePage={true} />
    </main>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const upbitMarketRecord: Record<string, IUpbitMarket> = {};
  const [resUpbitForex, resUpbitMarketList] = await Promise.all([
    fetch(upbitApis.forexRecent + '?codes=FRX.KRWUSD'),
    fetch(upbitApis.marketAll + '?isDetails=false')
  ]);
  const [upbitForex, upbitMarketList] = await Promise.all([
    resUpbitForex.json(),
    resUpbitMarketList.json().then((data: Array<IUpbitMarket>) =>
      data.filter((m) => {
        if (Boolean(m.market.match(krwRegex))) {
          upbitMarketRecord[m.market] = m;
          return true;
        }
        // BTC 마켓은 아래 코드 사용
        // if (!Boolean(m.market.match(usdtRegex))) {
        //   upbitMarketRecord[m.market] = m;
        //   return true;
        // }
      })
    )
  ]);

  const symbolList = upbitMarketList?.map((m: IUpbitMarket) => m.market);
  const upbitSymbols = symbolList.join(',');
  // const binanceSymbols = `["${symbolList
  //   .map((m: string) => m.replace(krwRegex, '') + 'USDT')
  //   .join('","')}"]`;

  // const upbitMarketSnapshotList = await fetch(`${upbitApis.ticker}?markets=${upbitSymbols}`).then(
  //   (res) => res.json()
  // );

  // 바이낸스는 해당 마켓이 없을 경우 에러를 냄 -> 전체 리스트를 가져와서 정렬.
  const [{ lastUpdatedAt, upbitMarketSnapshotList }, binanceMarketSnapshotList] = await Promise.all(
    [
      fetch(`${upbitApis.ticker}?markets=${upbitSymbols}`).then(async (res) => ({
        lastUpdatedAt: new Date(res.headers.get('date') ?? new Date()).toISOString(),
        upbitMarketSnapshotList: await res.json()
      })),
      // fetch(`${binanceApis.tickerPrice}?symbols=${binanceSymbols}`).then((res) => res.json())
      fetch(binanceApis.tickerPrice).then(async (res) => await res.json())
    ]
  );

  const binanceSnapshotkeyByList = keyBy(binanceMarketSnapshotList, 'symbol');

  const upbitMarketSnapshot: Record<string, IMarketTableItem> = {};
  const binanceMarketSnapshot: Record<string, IBinanceSocketMessageTicker> = {};

  for (const m of binanceMarketSnapshotList) {
    binanceMarketSnapshot[m.symbol] = {
      data: {
        p: m.price,
        s: m.symbol
      },
      stream: ''
    } as IBinanceSocketMessageTicker;
  }

  for (const t of upbitMarketSnapshotList) {
    const symbol = t.market?.replace(krwRegex, '');
    let binanceSymbol: string | undefined = symbol + 'USDT';
    switch (symbol) {
      case 'BTT': {
        binanceSymbol = 'BTTCUSDT';
      }
      case 'NU': {
        binanceSymbol = undefined;
      }
    }
    upbitMarketSnapshot[t.market] = {
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
      english_name: upbitMarketRecord[t.market].english_name,
      korean_name: upbitMarketRecord[t.market].korean_name
    };

    if (binanceSymbol && binanceSnapshotkeyByList[binanceSymbol]) {
      const binanceMarket = binanceSnapshotkeyByList[binanceSymbol];
      const binanceKrwPrice = Number(binanceMarket.price) * upbitForex[0].basePrice;
      const premium = (1 - binanceKrwPrice / t.trade_price) * 100;
      upbitMarketSnapshot[t.market].binance_price = binanceSnapshotkeyByList[binanceSymbol]?.price;
      upbitMarketSnapshot[t.market].premium = premium;
    }
  }

  return {
    props: {
      upbitForex: upbitForex[0],
      upbitMarketList,
      upbitMarketSnapshot,
      lastUpdatedAt
    }
  };
};

export default Home;
