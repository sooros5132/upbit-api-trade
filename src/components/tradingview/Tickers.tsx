import React from 'react';
import isEqual from 'react-fast-compare';

export interface TradingViewTickersWidgetProps {
  pointerEvents?: React.CSSProperties['pointerEvents'];
}

const TradingViewTickersWidget: React.FC<TradingViewTickersWidgetProps> = ({ pointerEvents }) => {
  const tickersWidgetRef = React.useRef<HTMLDivElement>(null);
  const symbols = [
    {
      proName: 'FOREXCOM:NSXUSD',
      title: 'US 100'
    },
    {
      description: '',
      proName: 'KRX:KOSPI'
    },
    {
      description: '',
      proName: 'BINANCE:BTCUSDT'
    },
    {
      description: '',
      proName: 'BINANCE:ETHUSDT'
    },
    {
      description: '',
      proName: 'CRYPTOCAP:BTC.D'
    }
  ];

  React.useEffect(() => {
    if (!tickersWidgetRef.current) return;

    const scriptContainer = tickersWidgetRef.current;
    const scriptEl = document.createElement('script');

    const id = new Date().getTime().toString();
    scriptEl.id = `tradingview-tickers-widget-${id}`;
    scriptEl.async = true;
    scriptEl.type = 'text/javascript';
    scriptEl.src = 'https://s3.tradingview.com/external-embedding/embed-widget-tickers.js';
    scriptEl.innerHTML = `{
  "symbols": ${JSON.stringify(symbols)},
  "colorTheme": "dark",
  "isTransparent": true,
  "showSymbolLogo": true,
  "locale": "kr"
}`;
    tickersWidgetRef.current.insertAdjacentElement('beforeend', scriptEl);
    return () => {
      if (scriptContainer) {
        while (scriptContainer.firstChild) {
          scriptContainer.removeChild(scriptContainer.firstChild);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className='overflow-x-auto overflow-y-hidden scrollbar-hidden'>
        <div
          className='mx-auto lg:!w-full'
          style={symbols.length > 1 ? { width: symbols.length * 240 } : undefined}
        >
          <div ref={tickersWidgetRef} style={{ pointerEvents }} />
        </div>
      </div>

      <div className='tradingview-widget-copyright'>
        TradingView 제공{' '}
        <a href='https://kr.tradingview.com' rel='noopener noreferrer' target='_blank'>
          <span className='blue-text'>쿼트</span>
        </a>
      </div>
    </div>
  );
};

TradingViewTickersWidget.displayName = 'TradingViewTickersWidget';

export default React.memo(TradingViewTickersWidget, isEqual);
