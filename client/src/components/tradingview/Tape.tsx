import React from 'react';
import isEqual from 'react-fast-compare';

const TradingViewTapeWidget: React.FC = () => {
  const tapeWidgetRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!tapeWidgetRef.current) return;

    const scriptEl = document.createElement('script');

    const id = new Date().getTime().toString();
    scriptEl.id = `tradingview-tape-widget-${id}`;
    scriptEl.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    scriptEl.innerHTML = `
      {
        "symbols": [
          {
            "description": "USD/KRW",
            "proName": "FX_IDC:USDKRW"
          },
          {
            "description": "EUR/KRW",
            "proName": "FX_IDC:EURKRW"
          },
          {
            "description": "US 100",
            "proName": "FOREXCOM:NSXUSD"
          },
          {
            "description": "S&P 500",
            "proName": "FOREXCOM:SPXUSD"
          },
          {
            "description": "BTCUSDT",
            "proName": "BINANCE:BTCUSDT"
          },
          {
            "description": "ETHUSDT",
            "proName": "BINANCE:ETHUSDT"
          }
        ],
        "showSymbolLogo": false,
        "colorTheme": "dark",
        "isTransparent": true,
        "displayMode": "regular",
        "locale": "kr"
      }
    `;
    tapeWidgetRef.current.insertAdjacentElement('beforeend', scriptEl);
  }, []);

  return (
    <>
      <div ref={tapeWidgetRef} className="tradingview-widget-container">
        <div className="tradingview-widget-container__widget"></div>
      </div>
    </>
  );
};

TradingViewTapeWidget.displayName = 'TradingViewTapeWidget';

export default React.memo(TradingViewTapeWidget, isEqual);
