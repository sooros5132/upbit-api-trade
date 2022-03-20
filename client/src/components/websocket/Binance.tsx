import _ from 'lodash';
import React, { useCallback, useEffect, useRef } from 'react';
import { IBinanceSocketMessageTicker } from 'src/types/binance';
import { IUpbitMarket } from 'src/types/upbit';
import { clientApiUrls } from 'src/utils/clientApiUrls';
import { IMarketTableItem } from '../market-table/MarketTable';

export const BinanceWebSocketContext = React.createContext<
  Record<string, IBinanceSocketMessageTicker>
>({});

interface BinanceWebSocketProps {
  marketList: IUpbitMarket[];
  stateUpdateDelay: number;
  children?: React.ReactNode;
}

const BinanceWebSocket = ({
  children,
  marketList: upbitMarketList,
  stateUpdateDelay
}: BinanceWebSocketProps) => {
  const marketList = React.useMemo(
    () =>
      upbitMarketList.map((m) => m.market.replace(/^krw-/i, '').toLowerCase() + 'usdt@aggTrade'),
    [upbitMarketList]
  );
  const [list, setList] = React.useState<Record<string, IBinanceSocketMessageTicker>>({});
  const ws = useRef<WebSocket | null>(null);
  const bufferSize = useRef(0);
  const stanbyList = React.useRef<typeof list>({});

  const handleMessage = React.useCallback(
    async (e: MessageEvent) => {
      const message = JSON.parse(e.data) as IBinanceSocketMessageTicker;
      if (!message?.data?.s) {
        return;
      }

      bufferSize.current++;
      stanbyList.current[message.data.s] = message;

      if (bufferSize.current >= 100) {
        bufferSize.current = 0;
        setList({ ...stanbyList.current });
      }
    },
    [bufferSize, stanbyList]
  );

  useEffect(() => {
    const forceUpdate = setInterval(() => {
      if (bufferSize.current > 0) {
        bufferSize.current = 0;
        setList({ ...stanbyList.current });
      }
    }, stateUpdateDelay);

    return () => clearInterval(forceUpdate);
  }, [stateUpdateDelay]);

  const wsConnect = useCallback(() => {
    if (!ws.current) {
      ws.current = new WebSocket(clientApiUrls.binance.websocket);
      ws.current.addEventListener('open', () => {
        if (ws.current)
          ws.current.send(
            JSON.stringify({
              method: 'SUBSCRIBE',
              params: marketList,
              id: 1
            })
          );
      });

      ws.current.addEventListener('message', handleMessage);

      ws.current.addEventListener('error', (err: WebSocketEventMap['error']) => {
        console.error('Socket encountered error: ', err, 'Closing socket');
        if (ws.current) {
          ws.current.close();
        }
      });
      ws.current.addEventListener('close', (e: WebSocketEventMap['close']) => {
        console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
        setTimeout(() => {
          ws.current = null;
          wsConnect();
        }, 1000);
      });
    }
  }, [handleMessage, marketList]);

  useEffect(wsConnect, [wsConnect]);

  return (
    <BinanceWebSocketContext.Provider value={list}>{children}</BinanceWebSocketContext.Provider>
  );
};

export default BinanceWebSocket;
