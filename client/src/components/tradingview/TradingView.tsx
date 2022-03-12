import Script from "next/script";
import React from "react";
import { IUpbitForex } from "src/types/upbit";
import styled, { useTheme } from "styled-components";

const Container = styled.div<{ height: string }>`
  height: 500px;
`;

interface TradingViewProps {}

const TradingView: React.FC<TradingViewProps> = () => {
  const [tradingViewHeight, setTradingViewHeight] = React.useState("500px");

  const handleLoadTradingViewScript = () => {
    const TradingView = window?.TradingView;

    if (TradingView && TradingView.widget) {
      new TradingView.widget({
        autosize: true,
        symbol: "BINANCE:BTCUSDT",
        interval: "15",
        timezone: "Asia/Seoul",
        theme: "dark",
        style: "1",
        locale: "kr",
        toolbar_bg: "#f1f3f6",
        enable_publishing: false,
        allow_symbol_change: true,
        studies: ["MASimple@tv-basicstudies"],
        container_id: "tradingview_4a4c4",
      });
    }
  };
  return (
    <>
      <Script
        defer
        src="https://s3.tradingview.com/tv.js"
        onLoad={handleLoadTradingViewScript}
      />
      <Container height={tradingViewHeight}>
        <div style={{ height: "100%" }} id={"tradingview_4a4c4"} />
      </Container>
    </>
  );
};

export default TradingView;
