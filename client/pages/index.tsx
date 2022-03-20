import { styled } from '@mui/material/styles';
import type { GetStaticProps, NextPage } from 'next';
import React from 'react';
import { upbitApis } from 'src-server/utils/upbitApis';
import MarketList, { IMarketTableItem } from 'src/components/market-table/MarketTable';
import { Width100Box } from 'src/components/modules/Box';
import TradingView from 'src/components/tradingview/Chart';
import { IUpbitApiTicker, IUpbitForex, IUpbitMarket } from 'src/types/upbit';
import { useSnackbar } from 'notistack';
import { useUpbitAuthStore } from 'src/store/upbitAuth';
import { clientApiUrls } from 'src/utils/clientApiUrls';
import useSWR from 'swr';

const Container = styled('div')`
  flex: 1 0 auto;
  display: flex;
`;

const Inner = styled(Width100Box)`
  padding: 0 ${({ theme }) => theme.spacing(1.25)};
  ${({ theme }) => theme.mediaQuery.desktop} {
    max-width: 1200px;
    margin: 0 auto;
  }
`;
const TradingViewContainer = styled('div')`
  margin: ${({ theme }) => theme.spacing(2)} 0;
`;

const MarketTableContainer = styled('div')`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

interface HomeProps {
  upbitForex: IUpbitForex;
  upbitMarketList: Array<IUpbitMarket>;
  upbitMarketSnapshot?: Record<string, IMarketTableItem>;
}

const Home: NextPage<HomeProps> = ({ upbitForex, upbitMarketList, upbitMarketSnapshot }) => {
  const { enqueueSnackbar } = useSnackbar();
  const upbitAuthStore = useUpbitAuthStore();
  const [upbitKrwList] = React.useState(
    upbitMarketList.filter((c) => c.market.match(/^KRW-/i), {})
  );
  const { data, error } = useSWR(
    process.env.NEXT_PUBLIC_SOOROS_API + clientApiUrls.upbit.accounts,
    async () => {
      if (upbitAuthStore.accessKey && upbitAuthStore.secretKey) {
        if (await upbitAuthStore.registerKey(upbitAuthStore.accessKey, upbitAuthStore.secretKey)) {
          // enqueueSnackbar('업비트 API에 연동되었습니다.', {
          //   variant: 'success'
          // });
        } else {
          // enqueueSnackbar('서버와 연결이 불안정합니다. 업비트 API연동에 실패했습니다.', {
          //   variant: 'error'
          // });
        }
      }
    }
  );

  return (
    <Container>
      <Inner>
        <TradingViewContainer>
          <TradingView />
        </TradingViewContainer>
        <MarketTableContainer>
          <MarketList
            upbitForex={upbitForex}
            upbitKrwList={upbitKrwList}
            upbitMarketSnapshot={upbitMarketSnapshot}
          />
        </MarketTableContainer>
      </Inner>
    </Container>
  );
};

export const getStaticProps: GetStaticProps<HomeProps> = async ({ params }) => {
  const [resUpbitForex, resUpbitMarketList] = await Promise.all([
    fetch(upbitApis.forexRecent + '?codes=FRX.KRWUSD'),
    fetch(upbitApis.marketAll + '?isDetails=false')
  ]);
  const [upbitForex, upbitMarketList] = await Promise.all([
    resUpbitForex.json(),
    resUpbitMarketList.json()
  ]);

  const upbitMarketRecord: Record<string, IUpbitMarket> = {};

  const upbitMarketQueryString = upbitMarketList
    ?.filter((m: IUpbitMarket) => Boolean(m.market.match(/^krw-/i)))
    .map((m: IUpbitMarket) => {
      upbitMarketRecord[m.market] = m;
      return m.market;
    })
    .join(',');
  const upbitMarketSnapshotList: Array<IUpbitApiTicker> = await fetch(
    `${upbitApis.ticker}?markets=${upbitMarketQueryString}`
  ).then((res) => res.json());

  const upbitMarketSnapshot: Record<string, IMarketTableItem> = {};

  for (const t of upbitMarketSnapshotList) {
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
  }

  return {
    props: {
      upbitForex: upbitForex[0],
      upbitMarketList,
      upbitMarketSnapshot
    },
    revalidate: 5
  };
};

export default Home;
