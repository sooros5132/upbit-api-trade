import { Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import Script from 'next/script';
import React, { memo, useCallback, useEffect, useState } from 'react';
import isEqual from 'react-fast-compare';
import { useSiteSettingStore } from 'src/store/siteSetting';
import { FlexCenterCenterBox } from '../modules/Box';
import { HoverUnderLineSpan } from '../modules/Typography';

const Container = styled('div')(({ theme }) => ({
  height: 500,
  [`${theme.breakpoints.down('sm')}`]: {
    height: '50vh',
    maxHeight: 300
  }
}));

const UnMountedContainer = styled(FlexCenterCenterBox)(({ theme }) => ({
  height: '100%',
  fontSize: theme.size.px50,
  fontWeight: 'bold',
  color: theme.color.gray70,
  border: `1px dashed ${theme.color.gray70}`,
  borderRadius: 20,
  [`${theme.breakpoints.down('md')}`]: {
    fontSize: theme.size.px36
  },
  [`${theme.breakpoints.down('sm')}`]: {
    fontSize: theme.size.px24
  }
}));

interface TradingViewChartProps {}

const TradingViewChart: React.FC<TradingViewChartProps> = () => {
  const theme = useTheme();
  const { selectedMarketSymbol, selectedExchange } = useSiteSettingStore();
  const [isMounted, setMounted] = useState(false);

  const handleLoadTradingViewScript = useCallback(() => {
    const TradingView = window?.TradingView;

    const symbol =
      selectedExchange === 'BINANCE'
        ? `BINANCE:${selectedMarketSymbol}USDT`
        : `UPBIT:${selectedMarketSymbol}KRW`;

    if (TradingView && TradingView.widget) {
      new TradingView.widget({
        autosize: true,
        symbol,
        interval: '15',
        timezone: 'Asia/Seoul',
        theme: 'dark',
        style: '1',
        locale: 'kr',
        toolbar_bg: theme.color.mainDrakBackground,
        enable_publishing: false,
        allow_symbol_change: true,
        studies: ['MASimple@tv-basicstudies'],
        container_id: 'tradingview_4a4c4'
      });
    }
  }, [selectedExchange, selectedMarketSymbol, theme.color.mainDrakBackground]);

  useEffect(() => {
    handleLoadTradingViewScript();
  }, [handleLoadTradingViewScript, selectedMarketSymbol]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Script src="https://s3.tradingview.com/tv.js" onLoad={() => handleLoadTradingViewScript()} />
      <Container>
        {isMounted ? (
          <div style={{ height: '100%' }} id={'tradingview_4a4c4'} />
        ) : (
          <UnMountedContainer>
            <Typography>
              <a
                href="https://www.tradingview.com/chart?symbol=BINANCE%3ABTCUSDT"
                rel="noreferrer"
                target="_blank"
              >
                <HoverUnderLineSpan>TradingView BTCUSDT Chart</HoverUnderLineSpan>
              </a>
            </Typography>
          </UnMountedContainer>
        )}
      </Container>
    </>
  );
};

TradingViewChart.displayName = 'TradingViewChart';

export default memo(TradingViewChart, isEqual);
