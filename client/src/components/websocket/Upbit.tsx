import _ from "lodash";
import React, { useCallback, useEffect, useRef } from "react";
import {
  IUpbitMarket,
  IUpbitSocketMessageTicker,
  IUpbitSocketMessageTickerSimple,
} from "src/types/upbit";
import { apiRequestURLs } from "src/utils/apiRequestURLs";
import { v4 as uuidv4 } from "uuid";
import { IMarketTableItem } from "../market-table/MarketTable";

export const UpbitWebSocketContext = React.createContext<
  Record<string, Omit<IMarketTableItem, "premium" | "binance_name">>
>({});

interface UpbitWebSocketProps {
  marketList: Array<IUpbitMarket>;
  stateUpdateDelay: number;
  children?: React.ReactNode;
}

const ticket = uuidv4();
const type = "ticker";
const format = "SIMPLE"; // 간소화된 필드명
const isOnlySnapshot = true; // 시세 스냅샷만 제공
const isOnlyRealtime = true; //실시간 시세만 제공

const UpbitWebSocket = ({
  children,
  marketList,
  stateUpdateDelay,
}: UpbitWebSocketProps) => {
  const codes = React.useMemo(
    () => marketList.map((c) => c.market),
    [marketList]
  );
  const marketListObjects = React.useMemo(
    () => _.keyBy(marketList, "market"),
    [marketList]
  );
  const [list, setList] = React.useState<
    Record<string, Omit<IMarketTableItem, "premium" | "binance_name">>
  >({});
  const stanbyList = React.useRef<typeof list>({});
  const bufferSize = useRef(0);
  const ws = useRef<WebSocket | null>(null);

  const handleMessage = React.useCallback(
    async (e: WebSocketEventMap["message"]) => {
      const message = JSON.parse(
        await e.data.text()
      ) as IUpbitSocketMessageTickerSimple;

      bufferSize.current++;
      stanbyList.current[message.cd] = {
        ...message,
        korean_name: marketListObjects[message.cd]?.korean_name || "",
        english_name: marketListObjects[message.cd]?.english_name || "",
      };

      if (bufferSize.current >= 100) {
        bufferSize.current = 0;
        setList({ ...stanbyList.current });
      }
    },
    [bufferSize, stanbyList, marketListObjects]
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
      ws.current = new WebSocket(apiRequestURLs.upbit.websocket);
      ws.current.binaryType = "blob";
      ws.current.addEventListener("open", () => {
        if (ws.current)
          ws.current.send(
            JSON.stringify([
              { ticket },
              { type, codes, isOnlyRealtime },
              { format },
            ])
          );
      });

      ws.current.addEventListener("message", handleMessage);

      ws.current.addEventListener(
        "error",
        (err: WebSocketEventMap["error"]) => {
          console.error("Socket encountered error: ", err, "Closing socket");
          if (ws.current) {
            ws.current.close();
            ws.current = null;
          }
        }
      );
      ws.current.addEventListener("close", (e: WebSocketEventMap["close"]) => {
        console.log(
          "Socket is closed. Reconnect will be attempted in 1 second.",
          e.reason
        );
        setTimeout(() => {
          ws.current = null;
          wsConnect();
        }, 1000);
      });
    }
  }, [codes, handleMessage]);

  useEffect(wsConnect, [wsConnect]);

  return (
    <UpbitWebSocketContext.Provider value={list}>
      {children}
    </UpbitWebSocketContext.Provider>
  );
};

export default UpbitWebSocket;
