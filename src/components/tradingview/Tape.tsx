import React from 'react';
import isEqual from 'react-fast-compare';

const TradingViewTapeWidget: React.FC = () => {
  const tapeWidgetRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!tapeWidgetRef.current) return;

    const scriptContainer = tapeWidgetRef.current;

    const scriptEl = document.createElement('script');
    const id = new Date().getTime().toString();
    scriptEl.id = `tradingview-tape-widget-${id}`;
    scriptEl.async = true;
    scriptEl.type = 'text/javascript';
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

    return () => {
      if (scriptContainer) {
        while (scriptContainer.firstChild) {
          scriptContainer.removeChild(scriptContainer.firstChild);
        }
      }
    };
  }, []);

  return <div ref={tapeWidgetRef} />;
};

TradingViewTapeWidget.displayName = 'TradingViewTapeWidget';

export default React.memo(TradingViewTapeWidget, isEqual);
