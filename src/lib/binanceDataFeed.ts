import axios from 'axios';
import zonedTimeToUtc from 'date-fns-tz/zonedTimeToUtc';
import type {
  Bar,
  ChartingLibraryWidgetOptions,
  HistoryMetadata,
  LibrarySymbolInfo,
  ResolutionString
} from 'src/charting_library/charting_library';
import { useExchangeStore } from 'src/store/exchangeSockets';
import type {
  IBinanceExchangeInfo,
  IBinanceFilterPriceFilter,
  IBinanceUiKline
} from 'src/types/binance';
import { API_PATH } from './apiUrls';

const getBars = async ({
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
      return uiKlines.map((uiKline) => ({
        time: uiKline[0],
        open: parseFloat(uiKline[1]),
        high: parseFloat(uiKline[2]),
        low: parseFloat(uiKline[3]),
        close: parseFloat(uiKline[4]),
        volume: parseFloat(uiKline[5]),
        closeTime: uiKline[6]
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
    .catch((err) => console.log(err));
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
  const datafeedUrl = API_PATH + '/binance/proxy/api/v3';
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

            const symbolInfo: LibrarySymbolInfo = {
              description: symbol.symbol || '',
              fractional: !1,
              // has_seconds: true,
              seconds_multipliers: ['1'],
              has_intraday: true,
              has_daily: true,
              has_weekly_and_monthly: true,
              minmov: 1,
              minmove2: 0,
              name: symbol.symbol,
              full_name: symbol.symbol,
              ticker: symbol.symbol,
              timezone: 'Etc/UTC',
              pricescale: Number(priceFilter?.tickSize) || 0.1,
              session: '24x7',
              type: 'crypto',
              exchange: 'Binance',
              listed_exchange: 'Binance',
              format: 'price',
              supported_resolutions: [
                '1s',
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
              ] as ResolutionString[]
            };
            symbolInfoStorage[symbol.symbol] = symbolInfo;
            if (symbol.symbol === symbol.symbol) {
              result = symbolInfo;
            }
          }

          setTimeout(() => {
            if (!result) {
              onResolveErrorCallback('not found');
            } else {
              onSymbolResolvedCallback(result);
            }
          });
        })
        .catch((err) => onResolveErrorCallback(err));
    },
    async getBars(symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) {
      // console.log('[!] getBars', symbolInfo, resolution, periodParams);

      const { countBack, firstDataRequest, from, to } = periodParams;
      let startTime = from * 1000;
      let endTime = to * 1000;

      const meta: HistoryMetadata | undefined = { nextTime: undefined, noData: undefined };
      const bars = [];

      do {
        const newBars = await getBars({
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
          startTime = last.closeTime;
          // console.log(countBack, bars.length, countBack > bars.length);
          // console.log(last.closeTime, Date.now(), last.closeTime > Date.now());

          // 마지막 캔들. 종료
          if (last.closeTime > Date.now()) {
            break;
          }
        }
        // 카운트만큼 받으면 종료
      } while (countBack > bars.length);

      if (symbolInfo.ticker) {
        lastCandles[symbolInfo.ticker] = bars[bars.length - 1];
      }
      if (bars.length > 0) {
        return onHistoryCallback(bars);
      } else {
        return onHistoryCallback(bars, { noData: true });
      }
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
      const symbol = symbolInfo.ticker;
      const unSubscribe = useExchangeStore.subscribe((state) => {
        const tradeMessage = state.binanceTradeMessage;
        if (!tradeMessage) {
          return;
        }
        // s: string; // Symbol
        // q: string; // Quantity
        // p: string; // Price
        // T: number; // Trade time
        const { s, q, p, T } = tradeMessage;

        if (symbol !== s) {
          return;
        }
        const bar: Bar = {
          close: parseFloat(p),
          high: parseFloat(p),
          low: parseFloat(p),
          open: parseFloat(p),
          time: T,
          volume: parseFloat(q)
        };
        if (symbolInfo.ticker) {
          if (typeof lastCandles[symbolInfo.ticker] === 'undefined') {
            lastCandles[symbolInfo.ticker] = bar;
            onRealtimeCallback(bar);
          } else {
            if (lastCandles[symbolInfo.ticker]?.time < T) {
              lastCandles[symbolInfo.ticker].time = T;
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
    async getServerTime(callback) {
      // console.log('[!] getServerTime');
      const serverTime = await axios
        .get<{ serverTime: number }>(datafeedUrl + '/time')
        .then((res) => res.data)
        .then((serverTime) => {
          return serverTime?.serverTime;
        })
        .catch(() => {
          throw 'getServerTime Error';
        });
      callback(Math.floor(serverTime / 1000));
    }
  };
};

export default binanceDataFeed;
