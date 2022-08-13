import { styled, useTheme } from '@mui/material/styles';
import type { GetServerSideProps, GetStaticProps, GetStaticPropsContext, NextPage } from 'next';
import React, { useEffect, useState } from 'react';
import { Width100Box } from 'src/components/modules/Box';
import TradingViewChart from 'src/components/tradingview/Chart';
import { useUpbitAuthStore } from 'src/store/upbitAuth';
import { useRouter } from 'next/router';
import { Box, Typography } from '@mui/material';
import { krwRegex } from 'src/utils/regex';

const Container = styled('div')`
  flex: 1 0 auto;
  display: flex;
`;

const Inner = styled(Width100Box)`
  padding: 0 ${({ theme }) => theme.spacing(1.25)};
  ${({ theme }) => theme.breakpoints.up('lg')} {
    max-width: 1200px;
    margin: 0 auto;
  }
  ${({ theme }) => theme.breakpoints.down('sm')} {
    padding: 0 ${({ theme }) => theme.spacing(0.75)};
  }
`;
const TradingViewContainer = styled('div')`
  /* margin: ${({ theme }) => theme.spacing(2)} 0; */
`;

const MarketTableContainer = styled('div')`
  /* margin-bottom: ${({ theme }) => theme.spacing(2)}; */
`;

interface TradeProps {
  symbol: string;
}

const Trade: NextPage<TradeProps> = ({ symbol }) => {
  const theme = useTheme();
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
    <Container>
      <Inner>
        <Box>
          <Typography fontSize={theme.size.px30}>
            <b>{router.query.symbol}</b>
          </Typography>
        </Box>
        <Box>
          <TradingViewChart chart={chart} />
        </Box>
      </Inner>
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  console.log(query);
  return {
    props: {
      symbol: query.symbol
    }
    // revalidate: 20
  };
};

export default Trade;
