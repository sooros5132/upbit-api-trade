import create from 'zustand';
import type { GetState, StateCreator } from 'zustand';
import { NamedSet } from 'zustand/middleware';
import { IMarketTableItem } from 'src/components/market-table/MarketTable';
import { IUpbitForex, IUpbitMarket, IUpbitSocketMessageTickerSimple } from 'src/types/upbit';
import { apiUrls } from 'src/lib/apiUrls';
import { v4 as uuidv4 } from 'uuid';
import { isEqual, keyBy, sortBy } from 'lodash';
import { IBinanceSocketMessageTicker } from 'src/types/binance';
import { krwRegex } from 'src/utils/regex';
import { useMarketTableSettingStore } from './marketTableSetting';
import { useSiteSettingStore } from './siteSetting';

interface IExchangeState {
  sortedUpbitMarketSymbolList: Array<string>;
  upbitForex?: IUpbitForex;
  upbitMarkets: Array<IUpbitMarket>;
  searchedSymbols: Array<string>;
  upbitMarketDatas: Record<string, IMarketTableItem>;
  binanceMarkets: Array<IUpbitMarket>;
  binanceMarketDatas: Record<string, IBinanceSocketMessageTicker>;
  upbitSocket?: WebSocket;
  binanceSocket?: WebSocket;
  lastUpdatedAt: Date;
  socketTimeout: number;
  throttleDelay: number;
}

const defaultState: IExchangeState = {
  upbitForex: undefined,
  sortedUpbitMarketSymbolList: [],
  upbitMarkets: [],
  searchedSymbols: [],
  upbitMarketDatas: {},
  binanceMarkets: [],
  binanceMarketDatas: {},
  upbitSocket: undefined,
  binanceSocket: undefined,
  lastUpdatedAt: new Date(),
  socketTimeout: 5 * 1000,
  throttleDelay: 200
};

interface IExchangeStore extends IExchangeState {
  setUpbitMarkets: (markets: IExchangeState['upbitMarkets']) => void;
  setUpbitMarketDatas: (marketDatas: IExchangeState['upbitMarketDatas']) => void;
  setBinanceMarkets: (markets: IExchangeState['binanceMarkets']) => void;
  setBinanceMarketDatas: (marketDatas: IExchangeState['binanceMarketDatas']) => void;
  distroyAll: () => void;
  connectUpbitSocket: (markets?: Array<IUpbitMarket>) => void;
  disconnectUpbitSocket: () => void;
  connectBinanceSocket: (markets?: Array<String>) => void;
  disconnectBinanceSocket: () => void;
  searchSymbols: (searchValue: string) => void;
  sortSymbolList: (sortColumn: keyof IMarketTableItem, sortType: 'ASC' | 'DESC') => void;
}

const useExchangeStore = create<IExchangeStore>(
  // persist(
  // devtools(
  (set, get) => ({
    ...defaultState,
    setUpbitMarkets(markets) {
      set({ upbitMarkets: [...markets] });
    },
    setUpbitMarketDatas(marketDatas) {
      set({ upbitMarketDatas: { ...marketDatas } });
    },
    setBinanceMarkets(markets) {
      set({ binanceMarkets: [...markets] });
    },
    setBinanceMarketDatas(marketDatas) {
      set({ binanceMarketDatas: { ...marketDatas } });
    },
    connectUpbitSocket() {
      let lastActivity = Date.now();
      const { socketTimeout, throttleDelay, upbitMarkets } = get();
      //? 업빗 소켓 설정
      const ticket = uuidv4(); // * 구분할 값을 넘겨야 함.
      const type = 'ticker'; // * 현재가 -> ticker, 체결 -> trade, 호가 ->orderbook
      const krwSymbols = upbitMarkets.map((c) => c.market); // * 구독할 코인들

      const format = 'SIMPLE'; // socket 간소화된 필드명
      const isOnlySnapshot = true; // socket 시세 스냅샷만 제공
      const isOnlyRealtime = true; // socket 실시간 시세만 제공
      //? 업빗 소켓 설정

      const dataBuffer: IExchangeState['upbitMarketDatas'] = get().upbitMarketDatas || {};

      let unapplied = 0;
      setInterval(() => {
        if (unapplied !== 0) {
          unapplied = 0;
          set({
            upbitMarketDatas: dataBuffer
          });
        }
      }, throttleDelay);

      function init() {
        const oldSocket = get().upbitSocket;
        if (oldSocket) oldSocket.close();

        let newSocket = new window.WebSocket(apiUrls.upbit.websocket);
        set({ upbitSocket: newSocket });
        newSocket.binaryType = 'blob';

        const handleOpen: WebSocket['onopen'] = function () {
          lastActivity = Date.now();
          newSocket.send(
            JSON.stringify([{ ticket }, { type, codes: krwSymbols, isOnlyRealtime }, { format }])
          );
        };

        const handleMessage: WebSocket['onmessage'] = async function (evt) {
          lastActivity = Date.now();
          const message = JSON.parse(await evt.data.text()) as IUpbitSocketMessageTickerSimple;

          unapplied++;

          const { upbitForex, binanceMarketDatas } = get();
          const binanceMarketSymbol = message.cd.replace(krwRegex, '') + 'USDT';
          const binanceMarket = binanceMarketDatas[binanceMarketSymbol];

          if (!upbitForex || !binanceMarket) {
            dataBuffer[message.cd] = { ...dataBuffer[message.cd], ...message };
          } else {
            const binanceKrwPrice = binanceMarket
              ? Number(binanceMarket.data.c) * upbitForex.basePrice
              : undefined;
            const premium = binanceKrwPrice ? (1 - binanceKrwPrice / message.tp) * 100 : undefined;

            dataBuffer[message.cd] = {
              ...dataBuffer[message.cd],
              ...message,
              binance_price: binanceMarket.data.c,
              binance_volume: binanceMarket.data.q,
              premium: premium
            };
          }
        };
        let timer: NodeJS.Timer | undefined;
        const handleError = () => {
          clearInterval(timer);
          newSocket.close();
          setTimeout(init, socketTimeout);
          // console.error('Socket encountered error: ', err, 'Closing socket');
        };
        timer = setInterval(function () {
          if (Date.now() - lastActivity > socketTimeout) {
            handleError();
          }
        }, socketTimeout / 2);

        newSocket.onopen = handleOpen;
        newSocket.onmessage = handleMessage;
        newSocket.onerror = handleError;
      }

      init();
    },
    connectBinanceSocket() {
      let lastActivity = Date.now();
      const { socketTimeout, throttleDelay, upbitMarkets } = get();
      const marketSymbols = upbitMarkets.map(
        (m) => m.market.replace(krwRegex, '').toLowerCase() + 'usdt@ticker'
      );
      const dataBuffer: IExchangeState['binanceMarketDatas'] = get().binanceMarketDatas || {};

      let unapplied = 0;

      setInterval(() => {
        if (unapplied !== 0) {
          unapplied = 0;
          set({
            binanceMarketDatas: dataBuffer
          });
        }
      }, throttleDelay);

      function init() {
        {
          const socket = get().binanceSocket;
          if (socket && socket.readyState !== 1) {
            socket.close();
          }
        }
        let newSocket: WebSocket = new window.WebSocket(apiUrls.binance.websocket);
        newSocket.binaryType = 'blob';

        set({ binanceSocket: newSocket });

        const handleOpen: WebSocket['onopen'] = function () {
          if (newSocket) {
            lastActivity = Date.now();
            newSocket.send(
              JSON.stringify({
                method: 'SUBSCRIBE',
                params: marketSymbols,
                id: 1
              })
            );
          }
        };

        const handleMessage: WebSocket['onmessage'] = async function (evt) {
          lastActivity = Date.now();
          const message = JSON.parse(evt.data) as IBinanceSocketMessageTicker;
          if (!message?.data?.s) {
            return;
          }
          unapplied++;
          dataBuffer[message.data.s] = message;
        };

        let timer: NodeJS.Timer | undefined;
        const handleError = () => {
          clearInterval(timer);
          newSocket.close();
          setTimeout(init, socketTimeout);
          // console.error('Socket encountered error: ', err, 'Closing socket');
        };
        timer = setInterval(function () {
          if (Date.now() - lastActivity > socketTimeout) {
            handleError();
          }
        }, socketTimeout / 2);

        newSocket.onopen = handleOpen;
        newSocket.onmessage = handleMessage;
        newSocket.onerror = handleError;
      }

      init();
    },
    disconnectUpbitSocket() {
      const socket = get().upbitSocket;
      if (socket) {
        socket?.close();
      }
      set({ upbitSocket: undefined });
    },
    disconnectBinanceSocket() {
      const socket = get().binanceSocket;
      if (socket) {
        socket?.close();
      }
      set({ binanceSocket: undefined });
    },
    searchSymbols(searchValue: string) {
      const { upbitMarkets } = get();
      if (searchValue) {
        const filterdMarketSymbols = upbitMarkets
          .filter((m) => {
            // KRW 마켓 확인
            if (krwRegex.test(m.market)) {
              // korean, eng, symbol 매칭 확인
              return Boolean(
                Object.values(m).filter((value: string) =>
                  value.toLocaleUpperCase().match(searchValue.toLocaleUpperCase())
                ).length
              );
            }
          })
          .map((market) => market.market);

        set({
          searchedSymbols: filterdMarketSymbols
        });
      } else {
        set({
          searchedSymbols: upbitMarkets.filter((m) => krwRegex.test(m.market)).map((m) => m.market)
        });
      }
    },
    sortSymbolList(sortColumn, sortType) {
      const { upbitForex, searchedSymbols, upbitMarketDatas } = get();
      if (!upbitForex) return;
      const hydrated = useSiteSettingStore.getState()._hasHydrated;
      const favoriteSymbols = useMarketTableSettingStore.getState().favoriteSymbols;
      const favoriteList: IMarketTableItem[] = [];
      const normalList = hydrated
        ? searchedSymbols
            .map((symbol) => upbitMarketDatas[symbol])
            .filter((m) => {
              const favorite = favoriteSymbols[m.cd];
              if (favorite) {
                favoriteList.push(m);
              } else {
                return true;
              }
            })
        : searchedSymbols.map((symbol) => upbitMarketDatas[symbol]);

      // const mergeMarkets = upbitMarketDatas.map((upbitMarket) => {
      //   return {
      //     ...upbitMarket
      //   };
      // });

      // const handleSort = (aItem: IMarketTableItem, bItem: IMarketTableItem) => {
      //   const a = aItem[sortColumn];
      //   const b = bItem[sortColumn];
      //   if (a === undefined) return 1;
      //   if (b === undefined) return -1;

      //   if (typeof a === 'number' && typeof b === 'number') {
      //     if (sortType === 'ASC') {
      //       return a - b;
      //     }
      //     return b - a;
      //   } else if (typeof a === 'string' && typeof b === 'string') {
      //     const aValue = a.toUpperCase();
      //     const bValue = b.toUpperCase();
      //     if (sortType === 'ASC') {
      //       if (aValue < bValue) {
      //         return 1;
      //       }
      //       if (aValue > bValue) {
      //         return -1;
      //       }
      //       return 0;
      //     }
      //     if (aValue < bValue) {
      //       return -1;
      //     }
      //     if (aValue > bValue) {
      //       return 1;
      //     }
      //     return 0;
      //   }
      //   return 0;
      // };

      const sortedFavoriteList =
        sortType === 'ASC'
          ? sortBy(favoriteList, sortColumn)
          : sortBy(favoriteList, sortColumn).reverse();
      const sortedNormalList =
        sortType === 'ASC'
          ? sortBy(normalList, sortColumn)
          : sortBy(normalList, sortColumn).reverse();

      const sortedSymbolList = sortedFavoriteList.concat(sortedNormalList).map((m) => {
        // upbitMarketDatas[m.cd] = m;
        return m.cd;
      });

      // 순서까지 같은지 검사. 리렌더링보단 성능이 적게 소모됨
      try {
        sortedSymbolList.reduce((prev, current, i) => {
          if (current !== searchedSymbols[i]) {
            throw '같지 않음';
          }
          return prev;
        }, true);

        return; // 여기 오면 같음
      } catch (e) {}

      set({
        searchedSymbols: sortedSymbolList
      });
    },
    distroyAll() {
      set({ ...defaultState });
    }
  })
  // )
  // ),
  //   {
  //     name: 'upbitData', // unique name
  //     getStorage: () => localStorage // (optional) by default, 'localStorage' is used
  //   }
);

export type { IExchangeState };
export { useExchangeStore };
