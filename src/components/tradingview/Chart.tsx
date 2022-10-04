import React, { memo, useCallback, useEffect } from 'react';
import isEqual from 'react-fast-compare';
import { useTradingViewSettingStore } from 'src/store/tradingViewSetting';

interface TradingViewChartProps {
  chart?: {
    symbol: string;
    exchange: string;
  };
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ chart }) => {
  const { selectedMarketSymbol, selectedExchange, scriptLoaded } = useTradingViewSettingStore();
  const symbol =
    chart?.exchange && chart?.symbol
      ? `${chart.exchange}:${chart.symbol}`
      : selectedExchange === 'BINANCE'
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
        // toolbar_bg: theme.color.mainDrakBackground,
        enable_publishing: false,
        allow_symbol_change: true,
        studies: ['MASimple@tv-basicstudies'], // 'BB@tv-basicstudies'
        container_id: 'tradingview_4a4c4',
        withdateranges: true,
        overrides: {
          // 'paneProperties.background': theme.color.mainDrakBackground,
          'paneProperties.vertGridProperties.color': '#363c4e',
          'paneProperties.horzGridProperties.color': '#363c4e',
          'scalesProperties.textColor': '#AAA',
          'mainSeriesProperties.candleStyle.wickUpColor': '#336854',
          'mainSeriesProperties.candleStyle.wickDownColor': '#7f323f'
        }
      });
    }
  }, [symbol]);

  useEffect(() => {
    if (scriptLoaded) {
      handleLoadTradingViewScript();
    }
  }, [handleLoadTradingViewScript, scriptLoaded]);

  return (
    <>
      <div className='h-72 sm:h-[40vh] sm:max-h-[initial] '>
        {scriptLoaded ? (
          <div style={{ height: '100%' }} id={'tradingview_4a4c4'} />
        ) : (
          <div className='flex items-center h-full text-2xl font-bold text-gray-700 border border-dashed border-gray-700 rounded-[1em] text-center sm:text-3xl md:text-5xl'>
            <div className='basis-full'>
              <p>
                <a
                  className='no-underline hover:underline'
                  href={`https://www.tradingview.com/chart?symbol=${symbol}`}
                  rel='noreferrer'
                  target='_blank'
                >
                  <span>TradingView {symbol} Chart</span>
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

TradingViewChart.displayName = 'TradingViewChart';

export default memo(TradingViewChart, isEqual);
