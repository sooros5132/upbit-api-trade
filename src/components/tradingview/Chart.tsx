import React, { memo, useCallback, useEffect, useState } from 'react';
import isEqual from 'react-fast-compare';
import { useTradingViewSettingStore } from 'src/store/tradingViewSetting';

interface TradingViewChartProps {
  pointerEvents?: React.CSSProperties['pointerEvents'];
  chart?: {
    symbol: string;
    exchange: string;
  };
}

interface TradingViewWidget {
  id: string;
  iframe: HTMLIFrameElement;
  options: Record<string, any>;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ chart, pointerEvents }) => {
  const [hydrated, setHydrated] = useState(false);
  const { selectedMarketSymbol, selectedExchange, scriptLoaded } = useTradingViewSettingStore();
  const symbol =
    chart?.exchange && chart?.symbol
      ? `${chart.exchange}:${chart.symbol}`
      : selectedExchange === 'BINANCE'
      ? `BINANCE:${selectedMarketSymbol}USDT`
      : `UPBIT:${selectedMarketSymbol}KRW`;
  const [widget, setWidget] = useState<TradingViewWidget | undefined>();

  const handleLoadTradingViewScript = useCallback(() => {
    const TradingView = window?.TradingView;

    if (TradingView && TradingView.widget) {
      const widgetOptions = {
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
        disabledFeatures: ['border_around_the_chart', 'save_shortcut', 'header_symbol_search'],
        studies: ['MASimple@tv-basicstudies'], // 'BB@tv-basicstudies'
        container_id: 'tradingview_4a4c4',
        withdateranges: true,
        save_image: false,
        // toolbar_bg: 'transparent',
        overrides: {
          'mainSeriesProperties.barStyle.downColor': '#f43f52',
          'mainSeriesProperties.barStyle.upColor': '#14b8a6',
          'paneProperties.background': '#000000',
          // 'paneProperties.background': theme.color.mainDrakBackground,
          'paneProperties.vertGridProperties.color': '#363c4e',
          'paneProperties.horzGridProperties.color': '#363c4e',
          'scalesProperties.lineColor': 'rgba(255, 255, 255, 0.6)',
          'scalesProperties.textColor': 'rgba(255, 255, 255, 0.6)',
          // 'mainSeriesProperties.candleStyle.wickUpColor': '#336854',
          // 'mainSeriesProperties.candleStyle.wickDownColor': '#7f323f',
          // 'mainSeriesProperties.showCountdown': true,
          'mainSeriesProperties.candleStyle.upColor': '#14b8a6',
          'mainSeriesProperties.candleStyle.downColor': '#f43f52',
          'mainSeriesProperties.candleStyle.borderColor': '#666666',
          'mainSeriesProperties.candleStyle.borderUpColor': '#14b8a6',
          'mainSeriesProperties.candleStyle.borderDownColor': '#f43f52',
          'mainSeriesProperties.candleStyle.wickUpColor': '#14b8a6',
          'mainSeriesProperties.candleStyle.wickDownColor': '#f43f52',
          'mainSeriesProperties.showCountdown': true,
          volumePaneSize: 'medium',
          'scalesProperties.fontSize': 10,
          'paneProperties.vertGridProperties.style': 1,
          'paneProperties.horzGridProperties.style': 1,
          'paneProperties.backgroundType': 'solid',
          'paneProperties.crossHairProperties.color': 'rgba(255, 255, 255, 0.3)',
          'mainSeriesProperties.highLowAvgPrice.highLowPriceLabelsVisible': true
        },
        studies_overrides: {
          'volume.volume.color.0': '#14b8a6',
          'volume.volume.color.1': '#f43f52'
        }
      };

      // window.TradingView.onready(() => {
      //   const widget = (window.tvWidget = new window.TradingView.widget(widgetOptions));

      //   widget.onChartReady(() => {
      //     console.log('Chart has loaded!');
      //   });
      // });

      const newWidget = new TradingView.widget(widgetOptions);
      setWidget(newWidget);
    }
  }, [symbol]);

  useEffect(() => {
    if (scriptLoaded) {
      handleLoadTradingViewScript();
    }
  }, [handleLoadTradingViewScript, scriptLoaded]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (scriptLoaded || !hydrated) {
    return <div className='h-full' id={'tradingview_4a4c4'} style={{ pointerEvents }} />;
  }

  return (
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
  );
};

TradingViewChart.displayName = 'TradingViewChart';

export default memo(TradingViewChart, isEqual);
