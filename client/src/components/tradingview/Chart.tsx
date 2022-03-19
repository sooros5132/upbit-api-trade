import { styled, useTheme } from "@mui/material/styles";
import Script from "next/script";
import React from "react";
import isEqual from "react-fast-compare";
import { IUpbitForex } from "src/types/upbit";

const Container = styled("div")(({ theme }) => ({
  height: 500,
  [`${theme.breakpoints.down("sm")}`]: {
    height: "50vh",
    maxHeight: 300,
  },
}));

interface TradingViewChartProps {}

const TradingViewChart: React.FC<TradingViewChartProps> = () => {
  const theme = useTheme();
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
        toolbar_bg: theme.color.mainDrakBackground,
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
        src="https://s3.tradingview.com/tv.js"
        onLoad={handleLoadTradingViewScript}
      />
      <Container>
        <div style={{ height: "100%" }} id={"tradingview_4a4c4"} />
      </Container>
    </>
  );
};

TradingViewChart.displayName = "TradingViewChart";

export default React.memo(TradingViewChart, isEqual);
