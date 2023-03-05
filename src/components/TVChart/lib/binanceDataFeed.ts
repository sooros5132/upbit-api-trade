import axios from 'axios';
import type {
  Bar,
  ChartingLibraryWidgetOptions,
  HistoryMetadata,
  LibrarySymbolInfo,
  ResolutionString
} from 'src/charting_library/charting_library';
import { subscribeOnBinanceStream, useExchangeStore } from 'src/store/exchangeSockets';
import {
  IBinanceExchangeInfo,
  IBinanceFilterPriceFilter,
  IBinanceSocketAggTrade,
  IBinanceSocketMessage,
  IBinanceUiKline
} from 'src/types/binance';
import { getNextBarOpenTime } from './helpers';

// interface Bar extends ChartingLibraryBar {
//   volume: number;
// }

const getBarsRequest = async ({
  resolution,
  symbol,
  url,
  countBack,
  endTime,
  startTime
}: {
  url: string;
  symbol: string;
  resolution: string;
  countBack: number;
  startTime?: number;
  endTime?: number;
}) => {
  return await axios
    .get<IBinanceUiKline>(`${url}/klines`, {
      params: {
        symbol: symbol,
        interval: resolution,
        startTime: startTime,
        endTime: endTime,
        limit: countBack
      }
    })
    .then((res) => res.data)
    .then((uiKlines) => {
      return uiKlines.map<Bar>((uiKline) => ({
        time: uiKline[0],
        close: parseFloat(uiKline[4]),
        open: parseFloat(uiKline[1]),
        high: parseFloat(uiKline[2]),
        low: parseFloat(uiKline[3]),
        volume: parseFloat(uiKline[5])
      }));
      //  0	number	// 1669530900000			// Kline open time
      //  1	string	// "16568.24000000"		// Open price
      //  2	string	// "16573.25000000"		// High price
      //  3	string	// "16567.55000000"		// Low price
      //  4	string	// "16572.41000000"		// Close price
      //  5	string	// "94.02252000"			// Volume
      //  6	number	// 1669530959999			// Kline close time
      //  7	string	// "1558086.05928610"	// Quote asset volume
      //  8	number	// 2253								// Number of trades
      //  9	string	// "45.24841000"			// Taker buy base asset volume
      // 10	string	// "749823.36320890"	// Taker buy quote asset volume
      // 11	string	// "0"								// Unused field. Ignore.
    })
    .catch(() => {});
};

const binanceResolutionRecord = {
  '1s': '1s',
  '1': '1m',
  '3': '3m',
  '5': '5m',
  '15': '15m',
  '30': '30m',
  '60': '1h',
  '120': '2h',
  '240': '4h',
  '360': '6h',
  '480': '8h',
  '720': '12h',
  '1m': '1m',
  '3m': '3m',
  '5m': '5m',
  '15m': '15m',
  '30m': '30m',
  '1h': '1h',
  '2h': '2h',
  '4h': '4h',
  '6h': '6h',
  '8h': '8h',
  '12h': '12h',
  D: '1d',
  '1D': '1d',
  '3D': '3d',
  W: '1w',
  '1W': '1w',
  M: '1M',
  '1M': '1M'
} as Record<ResolutionString, ResolutionString>;

const binanceDataFeed = (): ChartingLibraryWidgetOptions['datafeed'] => {
  const datafeedUrl = '/api/v1/binance/proxy/api/v3';
  const symbolInfoStorage: Record<string, LibrarySymbolInfo> = {};
  const unsubscribes: Record<
    string,
    {
      barUpdateInterval: NodeJS.Timer;
      socketUnsubscribe: ReturnType<typeof useExchangeStore.subscribe>;
    }
  > = {};
  const lastBarsCache = new Map<string, Bar & { isBarClosed?: boolean; isLastBar?: boolean }>();
  return {
    onReady: (onReadyCallback) => {
      // console.log('[!] onReady');
      // onReadyCallback은 비동기 0ms로 반환해달라고 한다.
      setTimeout(() => {
        onReadyCallback({
          supported_resolutions: [
            '1S',
            '1',
            '3',
            '5',
            '15',
            '30',
            '60',
            '120',
            '240',
            '360',
            '480',
            '720',
            '1D',
            '3D',
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
        .get<IBinanceExchangeInfo>(`${datafeedUrl}/exchangeInfo`, {
          params: {
            symbol: symbolName
          }
        })
        .then((res) => res.data)
        .then((exchangeInfo) => {
          let result: LibrarySymbolInfo | null = null;
          for (const symbol of exchangeInfo.symbols) {
            const priceFilter = symbol.filters.find(
              (filter) => filter.filterType === 'PRICE_FILTER'
            ) as IBinanceFilterPriceFilter | undefined;

            // 맨 뒤 0들 지우고 소수점 자리수 구한 다음 10제곱 계산.
            const pricescale = Math.pow(
              10,
              priceFilter?.tickSize?.replace(/0+$/, '')?.split('.')?.[1]?.length ?? 1
            );

            const symbolInfo: LibrarySymbolInfo = {
              name: symbol.symbol,
              format: 'price',
              full_name: symbol.symbol,
              // base_name
              listed_exchange: 'Binance',
              exchange: 'Binance',
              ticker: symbol.symbol,
              description: symbol.baseAsset + '/' + symbol.quoteAsset,
              timezone: 'Etc/UTC',
              minmov: 1,
              pricescale: pricescale,
              fractional: !1,
              session: '24x7',
              has_seconds: true,
              has_intraday: true,
              has_daily: true,
              has_weekly_and_monthly: true, // true로 하면 time 에러가남.
              visible_plots_set: 'ohlcv',
              type: 'crypto',
              supported_resolutions: [
                // '1S',
                '1',
                '3',
                '5',
                '15',
                '30',
                '60',
                '120',
                '240',
                '360',
                '480',
                '720',
                '1D',
                '3D',
                '1W',
                '1M'
              ] as ResolutionString[],
              intraday_multipliers: [
                // '1S',
                '1',
                '3',
                '5',
                '15',
                '30',
                '60',
                '120',
                '240',
                '360',
                '480',
                '720',
                '1D',
                '3D',
                '1W',
                '1M'
              ] as ResolutionString[],
              data_status: 'streaming',
              currency_code: symbol.quoteAsset,
              seconds_multipliers: ['1']
            };
            symbolInfoStorage[symbol.symbol] = symbolInfo;
            if (symbolName === symbol.symbol) {
              result = symbolInfo;
            }
          }

          setTimeout(() => {
            if (!result) {
              onResolveErrorCallback('not found');
            } else {
              onSymbolResolvedCallback(result);
            }
          }, 0);
        })
        .catch((err) => onResolveErrorCallback(err));
    },
    async getBars(symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) {
      // console.log('[!] getBars', symbolInfo, resolution, periodParams);

      const { countBack, firstDataRequest, from, to } = periodParams;
      let startTime = from * 1000;
      let endTime = to * 1000;

      const meta: HistoryMetadata | undefined = { nextTime: undefined, noData: undefined };
      const bars: Bar[] = [];

      await (async function () {
        do {
          const newBars = await getBarsRequest({
            url: datafeedUrl,
            symbol: symbolInfo.ticker!,
            resolution: binanceResolutionRecord[resolution] ?? resolution,
            countBack,
            startTime,
            endTime
          });
          // 최초 캔들. 종료
          if (Array.isArray(newBars) && newBars.length === 0) {
            break;
          }
          if (newBars) {
            const last = newBars[newBars.length - 1];
            bars.push(...newBars);
            startTime = Math.max(last.time + 1, 0);

            // 마지막 캔들. 종료
            // if (last.closeTime > Date.now()) {
            //   break;
            // }
          }
          // 카운트만큼 받으면 종료
        } while (countBack > bars.length);

        setTimeout(() => {
          if (bars.length > 0) {
            if (symbolInfo.ticker && firstDataRequest) {
              lastBarsCache.set(`0~${symbolInfo.exchange}~${symbolInfo.full_name}`, {
                ...bars[bars.length - 1]
              });
            }
            onHistoryCallback(bars, { noData: false });
          } else {
            onHistoryCallback(bars, { noData: true });
          }
        }, 0);
      })();
      // return onErrorCallback('Klines data error');
    },
    subscribeBars: (
      symbolInfo,
      resolution,
      onRealtimeCallback,
      subscriberUID,
      onResetCacheNeededCallback
    ) => {
      // console.log('[!] subscribeBars', { symbolInfo, resolution, subscriberUID });
      const { ticker } = symbolInfo;
      if (!ticker) {
        return;
      }
      let lastDailyBar = lastBarsCache.get(`0~${symbolInfo.exchange}~${symbolInfo.full_name}`)!;
      if (!lastDailyBar) {
        return;
      }

      const unsubscribe = subscribeOnBinanceStream<IBinanceSocketMessage<any>>((message) => {
        if (message.stream !== `${ticker.toLowerCase()}@aggTrade`) {
          return;
        }

        const aggTrade = message.data as IBinanceSocketAggTrade;

        // s: string; // Symbol
        // p: string; // Price
        // q: string; // Quantity
        // E: number; // Event time
        // T: number; // Trade time
        const {
          // s,
          q: quantity,
          p,
          // E,
          T: time
        } = aggTrade;
        let bar;
        const price = parseFloat(p);

        // 다음 봉 오픈시간을 구해서 큰지 작은지 비교해야 에러가 안남.
        const nextDailyBarTime = getNextBarOpenTime(lastDailyBar.time, resolution);

        if (time >= nextDailyBarTime) {
          bar = {
            time: nextDailyBarTime,
            open: price,
            high: price,
            low: price,
            close: price,
            volume: parseFloat(quantity)
          };
          onRealtimeCallback(bar);
        } else {
          bar = {
            ...lastDailyBar,
            high: Math.max(lastDailyBar.high, price),
            low: Math.min(lastDailyBar.low, price),
            close: price,
            volume: (lastDailyBar.volume || 0) + parseFloat(quantity)
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
        .get<{ serverTime: number }>(datafeedUrl + '/time')
        .then((res) => res.data)
        .then((serverTime) => {
          callback(Math.floor(serverTime.serverTime / 1000));
        })
        .catch(() => {
          throw 'getServerTime Error';
        });
    }
  };
};

export default binanceDataFeed;
