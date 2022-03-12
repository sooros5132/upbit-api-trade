import _ from "lodash";
import React, { useEffect, useRef } from "react";
import { IBinanceSocketMessageTicker } from "src/types/binance";
import { IUpbitMarket } from "src/types/upbit";
import { apiRequestURLs } from "src/utils/apiRequestURLs";

export const BinanceWebSocketContext = React.createContext<
  Record<string, IBinanceSocketMessageTicker>
>({});

interface BinanceWebSocketProps {
  marketList: IUpbitMarket[];
  children?: React.ReactNode;
}

const BinanceWebSocket = ({
  children,
  marketList: upbitMarketList,
}: BinanceWebSocketProps) => {
  const marketList = React.useMemo(
    () =>
      upbitMarketList.map(
        (m) => m.market.replace(/^krw-/i, "").toLowerCase() + "usdt@aggTrade"
      ),
    [upbitMarketList]
  );
  const ws = useRef<WebSocket | null>(null);
  const [list, setList] = React.useState<
    Record<string, IBinanceSocketMessageTicker>
  >({});

  const handleMessage = React.useCallback(
    async (e: MessageEvent) => {
      const message = JSON.parse(e.data) as IBinanceSocketMessageTicker;
      const newList = { ...list };
      if (message?.data?.s) {
        list[message.data.s] = message;
        setList(newList);
      }
    },
    [list]
  );

  useEffect(() => {
    if (!ws.current) {
      ws.current = new WebSocket(apiRequestURLs.binance.websocket);
      ws.current.addEventListener("open", () => {
        if (ws.current)
          ws.current.send(
            JSON.stringify({
              method: "SUBSCRIBE",
              params: marketList,
              id: 1,
            })
          );
      });

      ws.current.addEventListener("message", handleMessage);

      ws.current.addEventListener("error", () => {});
      ws.current.addEventListener("close", () => {});
      // setTimeout(() => ws.current?.close(), 5000);
    }
  }, [handleMessage, marketList]);

  return (
    <BinanceWebSocketContext.Provider value={list}>
      {children}
    </BinanceWebSocketContext.Provider>
  );
};

export default BinanceWebSocket;
