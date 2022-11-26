import axios from 'axios';
import {
  Bar,
  ChartingLibraryWidgetOptions,
  HistoryMetadata,
  LibrarySymbolInfo,
  ResolutionString,
  Timezone
} from 'src/charting_library/charting_library';
import { useExchangeStore } from 'src/store/exchangeSockets';
import { ITVUpbitHistory, ITVUpbitSymbolInfo } from 'src/types/upbit';

const upbitDataFeed = (): ChartingLibraryWidgetOptions['datafeed'] => {
  const datafeedUrl = 'https://crix-api-tv.upbit.com/v1/crix/tradingview';
  const symbolInfoStorage: Record<string, LibrarySymbolInfo> = {};
  const unSubscribes: Record<string, ReturnType<typeof useExchangeStore.subscribe>> = {};
  const lastCandles: Record<string, Bar> = {};
  return {
    onReady: (onReadyCallback) => {
      // console.log('[!] onReady');
      // onReadyCallback은 비동기 0ms로 반환해달라고 한다.
      setTimeout(() => {
        onReadyCallback({
          supported_resolutions: [
            '1',
            '3',
            '5',
            '10',
            '15',
            '30',
            '60',
            '240',
            '1D',
            '1W',
            '1M'
          ] as Array<ResolutionString>
        });
      }, 0);
    },
    searchSymbols(userInput, exchange, symbolType, onResultReadyCallback) {
      // console.log('[!] searchSymbols running');
      onResultReadyCallback([]);
    },
    async resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback, extension) {
      // console.log('[!] resolveSymbol', symbolName);
      // const [currency, symbol] = symbolName.split('.')[2].split('-');
      // if (!symbol) {
      //   return setTimeout(() => onResolveErrorCallback('error'), 0);
      // }
      if (symbolInfoStorage[symbolName]) {
        setTimeout(() => onSymbolResolvedCallback(symbolInfoStorage[symbolName]), 0);
        return;
      }
      await axios
        .get<ITVUpbitSymbolInfo>(`${datafeedUrl}/symbol_info?group=KRW&region=kr`)
        .then((res) => res.data)
        .then((symbolInfo) => {
          const symbolLength = symbolInfo.symbol.length;

          for (let i = 0; i < symbolLength; i++) {
            const symbol = symbolInfo.symbol[i];
            const exchangeListed =
              typeof symbolInfo['exchange-listed'] === 'string'
                ? symbolInfo['exchange-listed']
                : 'UPBIT';

            const result: LibrarySymbolInfo = {
              name: symbol,
              format: 'price',
              full_name: symbolInfo['upbit-symbol'][i],
              base_name: [`${exchangeListed}:${symbol}`],
              listed_exchange: exchangeListed,
              exchange: symbolInfo['exchange-traded'],
              // symbol: symbol,
              // code: symbolInfo['upbit-symbol'][i],
              ticker: symbolInfo.ticker[i],
              description: symbolInfo.description[i],
              timezone: (symbolInfo.timezone as Timezone) || 'Etc/UTC',
              minmov: symbolInfo['minmovement'] || 0,
              pricescale: symbolInfo['pricescale'][i],
              fractional: symbolInfo.fractional,
              session: symbolInfo['session-regular'] || '24x7',
              has_intraday: symbolInfo['has-intraday'] || !0,
              visible_plots_set: 'ohlcv',
              type: symbolInfo.type[i],
              supported_resolutions: symbolInfo['supported-resolutions'][
                i
              ] as Array<ResolutionString>,
              intraday_multipliers: symbolInfo['intraday-multipliers'][i],
              has_weekly_and_monthly: symbolInfo['has-weekly-and-monthly'],
              has_daily: symbolInfo['has-daily'],
              data_status: 'streaming'
              // datafeedUrl: datafeedUrl
            };

            if (symbol === symbolName) {
              setTimeout(() => onSymbolResolvedCallback(result), 0);
            }
            symbolInfoStorage[symbolName] = result;
          }
        })
        .catch((e) => onResolveErrorCallback(e));
    },
    async getBars(symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) {
      // console.log('[!] getBars', symbolInfo, resolution, periodParams);
      const { countBack, firstDataRequest, from, to } = periodParams;
      await axios
        .get<ITVUpbitHistory>(`${datafeedUrl}/history`, {
          params: { symbol: symbolInfo.ticker, resolution, from, to }
        })
        .then((res) => res.data)
        .then((history) => {
          if (history.s !== 'ok' && history.s !== 'no_data') {
            return onErrorCallback(history?.errmsg || history.s);
          }
          const bars: Array<Bar> = [];
          const meta: HistoryMetadata | undefined = { nextTime: undefined, noData: undefined };

          if ('no_data' === history.s) {
            meta.noData = true;
            meta.nextTime = history.nextTime;
            return;
          } else {
            const historyLength = history.t.length;
            for (let i = 0; i < historyLength; i++) {
              const bar: Bar = {
                time: history.t[i],
                close: Number(history.c[i]),
                open: Number(history.o[i]),
                high: Number(history.h[i]),
                low: Number(history.l[i]),
                volume: history?.v[i] ?? undefined
              };

              bars.push(bar);
            }
            if (firstDataRequest && symbolInfo?.ticker) {
              lastCandles[symbolInfo.ticker] = {
                time: history.t[historyLength - 1],
                close: Number(history.c[historyLength - 1]),
                open: Number(history.o[historyLength - 1]),
                high: Number(history.h[historyLength - 1]),
                low: Number(history.l[historyLength - 1]),
                volume: history?.v[historyLength - 1] ?? undefined
              };
            }
          }
          setTimeout(() => {
            onHistoryCallback(bars, meta);
          }, 0);
        })
        .catch((err) => onErrorCallback(err));
    },
    subscribeBars: (
      symbolInfo,
      resolution,
      onRealtimeCallback,
      subscriberUID,
      onResetCacheNeededCallback
    ) => {
      // console.log('[!] subscribeBars', { symbolInfo, resolution, subscriberUID });

      const symbol = symbolInfo.full_name.split('.')[2];
      const unSubscribe = useExchangeStore.subscribe((state) => {
        const tradeMessage = state.upbitTradeMessage;
        if (!tradeMessage) {
          return;
        }
        // cd: code
        // tp: trade_price
        // tv: trade_volume
        // ttms: trade_timestamp
        const { tp, cd, tv, ttms } = tradeMessage;

        if (symbol !== cd) {
          return;
        }
        const bar = {
          close: tp,
          high: tp,
          low: tp,
          open: tp,
          time: ttms,
          volume: tv
        };
        if (symbolInfo.ticker) {
          if (typeof lastCandles[symbolInfo.ticker] === 'undefined') {
            lastCandles[symbolInfo.ticker] = bar;
            onRealtimeCallback(bar);
          } else {
            if (lastCandles[symbolInfo.ticker]?.time < ttms) {
              lastCandles[symbolInfo.ticker].time = ttms;
              onRealtimeCallback(bar);
            }
          }
        }
      });

      if (unSubscribes[subscriberUID]) {
        unSubscribes[subscriberUID]();
      }
      unSubscribes[subscriberUID] = unSubscribe;
    },
    unsubscribeBars: (subscriberUID) => {
      // console.log('[!] unsubscribeBars', { listenerGuid: subscriberUID });

      const unSubscribe = unSubscribes[subscriberUID];
      if (unSubscribe) {
        unSubscribe();
      }
    },
    getMarks(symbolInfo, from, to, onDataCallback, resolution) {
      // console.log('[!] getMarks running', symbolInfo);
    },
    getTimescaleMarks(symbolInfo, from, to, onDataCallback, resolution) {
      // console.log('[!] getTimescaleMarks', symbolInfo);
    },
    getServerTime(callback) {
      // console.log('[!] getServerTime');
      axios
        .get(datafeedUrl + '/time')
        .then((res) => res.data)
        .then((serverTime) => callback(serverTime))
        .catch(() => {
          throw 'getServerTime Error';
        });
    }
  };
};

export default upbitDataFeed;
