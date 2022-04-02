import { Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import Script from 'next/script';
import React, { memo, useCallback, useEffect, useState } from 'react';
import isEqual from 'react-fast-compare';
import { useSiteSettingStore } from 'src/store/siteSetting';
import { FlexAlignItemsCenterBox, FullWidthBox } from '../modules/Box';
import { HoverUnderLineSpan } from '../modules/Typography';

const Container = styled('div')(({ theme }) => ({
  height: 500,
  [`${theme.breakpoints.down('sm')}`]: {
    height: '50vh',
    maxHeight: 300
  }
}));

const UnMountedContainer = styled(FlexAlignItemsCenterBox)(({ theme }) => ({
  height: '100%',
  fontSize: theme.size.px50,
  fontWeight: 'bold',
  color: theme.color.gray70,
  border: `1px dashed ${theme.color.gray70}`,
  borderRadius: 20,
  textAlign: 'center',
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

  const symbol =
    selectedExchange === 'BINANCE'
      ? `BINANCE:${selectedMarketSymbol}USDT`
      : `UPBIT:${selectedMarketSymbol}KRW`;

  const handleLoadTradingViewScript = useCallback(() => {
    const TradingView = window?.TradingView;

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
  }, [symbol, theme.color.mainDrakBackground]);

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
            <FullWidthBox>
              <Typography>
                <a
                  href={`https://www.tradingview.com/chart?symbol=${symbol}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  <HoverUnderLineSpan>TradingView {symbol} Chart</HoverUnderLineSpan>
                </a>
              </Typography>
            </FullWidthBox>
          </UnMountedContainer>
        )}
      </Container>
    </>
  );
};

TradingViewChart.displayName = 'TradingViewChart';

export default memo(TradingViewChart, isEqual);
