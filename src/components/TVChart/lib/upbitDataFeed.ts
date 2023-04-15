import axios from 'axios';
import {
  Bar,
  ChartingLibraryWidgetOptions,
  HistoryMetadata,
  LibrarySymbolInfo,
  ResolutionString,
  Timezone
} from 'src/charting_library/charting_library';
import { subscribeOnUpbitStream, useExchangeStore } from 'src/store/exchangeSockets';
import {
  ITVUpbitHistory,
  ITVUpbitSymbolInfo,
  IUpbitSocketMessageTradeSimple
} from 'src/types/upbit';
import { getNextBarOpenTime } from './helpers';

const upbitDataFeed = (): ChartingLibraryWidgetOptions['datafeed'] => {
  const datafeedUrl = 'https://crix-api-tv.upbit.com/v1/crix/tradingview';
  const symbolInfoStorage: Record<string, LibrarySymbolInfo> = {};
  const unsubscribes: Record<
    string,
    {
      barUpdateInterval: NodeJS.Timer;
      socketUnsubscribe: ReturnType<typeof useExchangeStore.subscribe>;
    }
  > = {};
  const lastBarsCache = new Map<string, Bar>();
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
              has_weekly_and_monthly: symbolInfo['has-weekly-and-monthly'],
              has_daily: symbolInfo['has-daily'],
              visible_plots_set: 'ohlcv',
              type: symbolInfo.type[i],
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
                '3D',
                '1W',
                '1M'
              ] as Array<ResolutionString>,
              // (symbolInfo['supported-resolutions'][i]) as Array<ResolutionString>,
              intraday_multipliers: symbolInfo['intraday-multipliers'][i],
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
            onHistoryCallback(bars, meta);
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
              lastBarsCache.set(`0~${symbolInfo.exchange}~${symbolInfo.full_name}`, {
                ...bars[bars.length - 1]
              });
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

      let lastDailyBar = lastBarsCache.get(`0~${symbolInfo.exchange}~${symbolInfo.full_name}`)!;
      if (!lastDailyBar) {
        return;
      }

      const symbol = symbolInfo.full_name.split('.')[2];
      const unsubscribe = subscribeOnUpbitStream<IUpbitSocketMessageTradeSimple>((message) => {
        // cd: code
        // tp: trade_price
        // tv: trade_volume
        // ttms: trade_timestamp
        const { tp, cd, tv, ttms, ty } = message;

        if (symbol !== cd || ty !== 'trade') {
          return;
        }
        let bar;

        // 다음 봉 오픈시간을 구해서 큰지 작은지 비교해야 에러가 안남.
        const nextDailyBarTime = getNextBarOpenTime(lastDailyBar.time, resolution);

        if (ttms >= nextDailyBarTime) {
          bar = {
            time: nextDailyBarTime,
            close: tp,
            high: tp,
            low: tp,
            open: tp,
            volume: tv
          };
          onRealtimeCallback(bar);
        } else {
          bar = {
            ...lastDailyBar,
            high: Math.max(lastDailyBar.high, tp),
            low: Math.min(lastDailyBar.low, tp),
            close: tp,
            volume: (lastDailyBar.volume || 0) + tv
          };
        }
        lastDailyBar = bar;
      });

      if (unsubscribes[subscriberUID]) {
        clearInterval(unsubscribes[subscriberUID].barUpdateInterval);
        unsubscribes[subscriberUID].socketUnsubscribe();
      }

      // 초기화 코드 저장
      const barUpdateInterval = setInterval(() => {
        onRealtimeCallback(lastDailyBar);
      }, 300);
      unsubscribes[subscriberUID] = {
        barUpdateInterval: barUpdateInterval,
        socketUnsubscribe: unsubscribe
      };
    },
    unsubscribeBars: (subscriberUID) => {
      // console.log('[!] unsubscribeBars', { listenerGuid: subscriberUID });

      if (!unsubscribes[subscriberUID]) {
        return;
      }
      const { barUpdateInterval, socketUnsubscribe } = unsubscribes[subscriberUID];
      clearInterval(barUpdateInterval);
      socketUnsubscribe();
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
