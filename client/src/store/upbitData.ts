import create, { GetState } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';
import createContext from 'zustand/context';
import { IUpbitAccounts } from 'src-server/type/upbit';
import { IMarketTableItem } from 'src/components/market-table/MarketTable';
import { IUpbitMarket, IUpbitSocketMessageTickerSimple } from 'src/types/upbit';
import { clientApiUrls } from 'src/utils/clientApiUrls';
import { v4 as uuidv4 } from 'uuid';
import { keyBy } from 'lodash';

export interface IUpbitDataState {
  accounts: Array<IUpbitAccounts>;
  marketList: Array<IUpbitMarket>;
  marketSocketData: Record<string, IMarketTableItem>;
  upbitSocket?: WebSocket;
}

const defaultState: IUpbitDataState = {
  accounts: [],
  marketList: [],
  marketSocketData: {}
};

interface IUpbitDataStore extends IUpbitDataState {
  setMarketList: (marketList: IUpbitDataState['marketList']) => void;
  setMarketSocketData: (data: IUpbitDataState['marketSocketData']) => void;
  setAccounts: (accounts: IUpbitDataState['accounts']) => void;
  distroyAll: () => void;
  connectUpbitSocket: (props: IHandleConnectUpbitSocket) => void;
  disconnectUpbitSocket: () => void;
}

export const initStore = () => {
  const createStore = () =>
    create<IUpbitDataStore>(
      // persist(
      devtools((set, get) => ({
        ...defaultState,
        setMarketList: (marketList) => {
          set({ marketList: [...marketList] });
        },
        setAccounts: (accounts) => {
          set({ accounts: [...accounts] });
        },
        setMarketSocketData: (data) => {
          set({ marketSocketData: { ...data } });
        },
        connectUpbitSocket: handleConnectUpbitSocket(set, get),
        disconnectUpbitSocket: () => {
          const upbitSocket = get().upbitSocket;
          if (upbitSocket) {
            if (upbitSocket.readyState === 1) upbitSocket.close();
            set({ upbitSocket: undefined });
          }
        },
        distroyAll: () => {
          set({ ...defaultState });
        }
      }))
      //   {
      //     name: 'upbitData', // unique name
      //     getStorage: () => localStorage // (optional) by default, 'localStorage' is used
      //   }
      // )
    );

  return createStore;
};

interface IHandleConnectUpbitSocket {
  marketList: Array<IUpbitMarket>;
  stateUpdateDelay: number;
  upbitMarketSnapshot?: Record<string, IMarketTableItem>;
}

const handleConnectUpbitSocket =
  (set: NamedSet<IUpbitDataStore>, get: GetState<IUpbitDataStore>) =>
  ({ marketList, stateUpdateDelay, upbitMarketSnapshot }: IHandleConnectUpbitSocket) => {
    const ticket = uuidv4();
    const type = 'ticker';
    const format = 'SIMPLE'; // 간소화된 필드명
    const isOnlySnapshot = true; // 시세 스냅샷만 제공
    const isOnlyRealtime = true; //실시간 시세만 제공
    const codes = marketList.map((c) => c.market);
    const marketListObjects = keyBy(marketList, 'market');
    const stanbyUpbitData: IUpbitDataState['marketSocketData'] = { ...upbitMarketSnapshot } || {};
    let bufferSize = 0;
    set({ marketSocketData: stanbyUpbitData });

    const handleMessage = async (e: WebSocketEventMap['message']) => {
      const message = JSON.parse(await e.data.text()) as IUpbitSocketMessageTickerSimple;

      bufferSize++;
      stanbyUpbitData[message.cd] = {
        ...message,
        korean_name: marketListObjects[message.cd]?.korean_name || '',
        english_name: marketListObjects[message.cd]?.english_name || ''
      };
    };

    function wsConnect() {
      {
        const upbitSocket = get().upbitSocket;
        if (upbitSocket) {
          upbitSocket.close();
        }
      }
      let ws: WebSocket = new WebSocket(clientApiUrls.upbit.websocket);
      set({ upbitSocket: ws });

      const refreshInterval = setInterval(() => {
        const upbitSocket = get().upbitSocket;
        if (upbitSocket?.readyState === 1 && bufferSize > 0) {
          bufferSize = 0;
          set({ marketSocketData: { ...stanbyUpbitData } });
        }
      }, stateUpdateDelay);

      ws.binaryType = 'blob';
      ws.addEventListener('open', () => {
        ws.send(JSON.stringify([{ ticket }, { type, codes, isOnlyRealtime }, { format }]));
      });

      ws.addEventListener('message', handleMessage);

      ws.addEventListener('error', (err: WebSocketEventMap['error']) => {
        console.error('Socket encountered error: ', err, 'Closing socket');

        const upbitSocket = get().upbitSocket;
        if (refreshInterval) clearInterval(refreshInterval);
        if (upbitSocket && upbitSocket.readyState === 1) {
          upbitSocket.close();
        }
      });
      ws.addEventListener('close', (e: WebSocketEventMap['close']) => {
        console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
        const upbitSocket = get().upbitSocket;
        setTimeout(() => {
          if (refreshInterval) clearInterval(refreshInterval);
          if (upbitSocket && upbitSocket.readyState === 1) {
            upbitSocket.close();
          }
        }, 1000);
      });
    }
    if (!get().upbitSocket) wsConnect();
  };

export const { Provider: UpbitDataStoreProvider, useStore: useUpbitDataStore } =
  createContext<IUpbitDataStore>();
export const createUpbitDataStore = initStore();
