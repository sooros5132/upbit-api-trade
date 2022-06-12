import React from 'react';
import isEqual from 'react-fast-compare';

const TradingViewTickersWidget: React.FC = () => {
  const tickerseWidgetRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!tickerseWidgetRef.current) return;

    const scriptEl = document.createElement('script');

    const id = new Date().getTime().toString();
    scriptEl.id = `tradingview-tape-widget-${id}`;
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
    tickerseWidgetRef.current.insertAdjacentElement('beforeend', scriptEl);
  }, []);

  return (
    <>
      <div ref={tickerseWidgetRef} className="tradingview-widget-tickers-container">
        <div className="tradingview-widget-tickers-container__widget"></div>
      </div>
    </>
  );
};

TradingViewTickersWidget.displayName = 'TradingViewTickersWidget';

export default React.memo(TradingViewTickersWidget, isEqual);
