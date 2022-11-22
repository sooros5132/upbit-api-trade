import React from 'react';
import isEqual from 'react-fast-compare';

export interface TradingViewTickersWidgetProps {
  pointerEvents?: React.CSSProperties['pointerEvents'];
}

const TradingViewTickersWidget: React.FC<TradingViewTickersWidgetProps> = ({ pointerEvents }) => {
  const tickersWidgetRef = React.useRef<HTMLDivElement>(null);

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
  "symbols": [
    {
      "proName": "FOREXCOM:NSXUSD",
      "title": "US 100"
    },
    {
      "description": "",
      "proName": "KRX:KOSPI"
    },
    {
      "description": "",
      "proName": "BINANCE:BTCUSDT"
    },
    {
      "description": "",
      "proName": "BINANCE:ETHUSDT"
    },
    {
      "description": "",
      "proName": "CRYPTOCAP:BTC.D"
    }
  ],
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
  }, []);

  return <div ref={tickersWidgetRef} style={{ pointerEvents }} />;
};

TradingViewTickersWidget.displayName = 'TradingViewTickersWidget';

export default React.memo(TradingViewTickersWidget, isEqual);
