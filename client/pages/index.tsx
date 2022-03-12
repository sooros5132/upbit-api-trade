import type { GetStaticProps, NextPage } from "next";
import { NextSeo } from "next-seo";
import Script from "next/script";
import React, { useContext, useEffect } from "react";
import MarketList from "src/components/market-table/MarketTable";
import TradingView from "src/components/tradingview/Chart";
import BinanceWebSocket from "src/components/websocket/Binance";
import UpbitWebSocket from "src/components/websocket/Upbit";
import { IUpbitForex, IUpbitMarket } from "src/types/upbit";
import { apiRequestURLs } from "src/utils/apiRequestURLs";
import styled from "styled-components";

declare global {
  interface Window {
    TradingView?: any;
  }
}

const Container = styled.div``;

const Inner = styled.div`
  ${({ theme }) => theme.mediaQuery.desktop} {
    max-width: 1200px;
    margin: 0 auto;
  }
`;
const TradingViewContainer = styled.div`
  margin: ${({ theme }) => theme.spacing(2)} 0;
`;

const MarketTableContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

interface HomeProps {
  upbitForex: IUpbitForex;
  upbitMarketList: Array<IUpbitMarket>;
}

const Home: NextPage<HomeProps> = ({ upbitForex, upbitMarketList }) => {
  const [upbitKrwList] = React.useState(
    upbitMarketList.filter((c) => c.market.match(/^KRW-/i))
  );

  return (
    <Container>
      <Inner>
        <TradingViewContainer>
          <TradingView />
        </TradingViewContainer>
        <MarketTableContainer>
          <MarketList upbitForex={upbitForex} upbitKrwList={upbitKrwList} />
        </MarketTableContainer>
      </Inner>
    </Container>
  );
};

export const getStaticProps: GetStaticProps<HomeProps> = async ({ params }) => {
  const [resUpbitForex, resUpbitMarketList] = await Promise.all([
    fetch(apiRequestURLs.upbit.forex),
    fetch(apiRequestURLs.upbit.marketList),
  ]);
  const [upbitForex, upbitMarketList] = await Promise.all([
    resUpbitForex.json(),
    resUpbitMarketList.json(),
  ]);
  return {
    props: {
      upbitForex: upbitForex[0],
      upbitMarketList,
    },
    revalidate: 60,
  };
};

export default Home;
