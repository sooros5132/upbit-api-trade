import type { GetServerSideProps, NextPage } from 'next';
import React, { useEffect, useState } from 'react';
import TradingViewChart from 'src/components/tradingview/Chart';
import { useUpbitAuthStore } from 'src/store/upbitAuth';
import { useRouter } from 'next/router';
import { krwRegex } from 'src/utils/regex';

interface TradeProps {
  symbol: string;
}

const Trade: NextPage<TradeProps> = ({ symbol }) => {
  const upbitAuthStore = useUpbitAuthStore();
  const [isMounted, setMounted] = useState(false);
  const router = useRouter();
  const [chart, setChart] = useState({
    symbol: symbol.replace(krwRegex, '') + 'KRW',
    exchange: 'UPBIT'
  });

  useEffect(() => {
    const { symbol } = router.query;
    if (typeof symbol !== 'string') return;
    setChart({
      exchange: 'UPBIT',
      symbol: symbol.replace(krwRegex, '') + 'KRW'
    });
  }, [router.query]);

  return (
    <main className='flex flex-auto w-full'>
      <div className='px-1.5 sm:px-2.5 xl:max-w-7xl xl:mx-auto'>
        <div>
          <p className='text-3xl'>
            <b>{router.query.symbol}</b>
          </p>
        </div>
        <div>
          <TradingViewChart chart={chart} />
        </div>
      </div>
    </main>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  // console.log(query);
  return {
    props: {
      symbol: query.symbol
    }
    // revalidate: 20
  };
};

export default Trade;
