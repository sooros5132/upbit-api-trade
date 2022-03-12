import _ from "lodash";
import React, { useEffect, useRef } from "react";
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
  children?: React.ReactNode;
}

const ticket = uuidv4();
const type = "ticker";
const format = "SIMPLE"; // 간소화된 필드명

const UpbitWebSocket = ({ children, marketList }: UpbitWebSocketProps) => {
  const codes = React.useMemo(
    () => marketList.map((c) => c.market),
    [marketList]
  );
  const marketObjects = React.useMemo(
    () => _.keyBy(marketList, "market"),
    [marketList]
  );

  const ws = useRef<WebSocket | null>(null);
  const [list, setList] = React.useState<
    Record<string, Omit<IMarketTableItem, "premium" | "binance_name">>
  >({});

  const handleMessage = React.useCallback(
    async (e: MessageEvent) => {
      const message = JSON.parse(
        await e.data.text()
      ) as IUpbitSocketMessageTickerSimple;
      const newList = { ...list };
      list[message.cd] = {
        ...message,
        korean_name: marketObjects[message.cd]?.korean_name || "",
        english_name: marketObjects[message.cd]?.english_name || "",
      };
      setList(newList);
    },
    [list, marketObjects]
  );

  useEffect(() => {
    if (!ws.current) {
      ws.current = new WebSocket(apiRequestURLs.upbit.websocket);
      ws.current.addEventListener("open", () => {
        if (ws.current)
          ws.current.send(
            JSON.stringify([{ ticket }, { type, codes }, { format }])
          );
      });

      ws.current.addEventListener("message", handleMessage);

      ws.current.addEventListener("error", () => {});
      ws.current.addEventListener("close", () => {});
      // setTimeout(() => ws.current?.close(), 5000);
    }
  }, [codes, handleMessage]);

  return (
    <UpbitWebSocketContext.Provider value={list}>
      {children}
    </UpbitWebSocketContext.Provider>
  );
};

export default UpbitWebSocket;
