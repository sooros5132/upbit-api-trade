# Upbit Api Trade

This project is...
1. You can trade on the site using upbit api.
2. You can see the difference in the price of upbit - binance in real time.
3. If JavaScript is not available, you can view the current market price [here](https://upbit-api-trade-demo.vercel.app/last).

## Live Demo
This demo does not have api trading under the [Upbit Terms and Conditions](https://www.upbit.com/terms_of_service).<br />
[https://upbit-api-trade-demo.vercel.app](https://upbit-api-trade-demo.vercel.app//)

## ⚡️Getting Started
This project require permission from the [tradingview/charting_library](https://github.com/tradingview/charting_library) GitHub repository.<br />
If it looks like `404 Not Found`, You not have permission, so you need to request access.

You can request permission for that library at the address below.<br />
[https://www.tradingview.com/HTML5-stock-forex-bitcoin-charting-library/?feature=technical-analysis-charts](https://www.tradingview.com/HTML5-stock-forex-bitcoin-charting-library/?feature=technical-analysis-charts)

commit hash applied to this project - [58407be459423b5837d6a0c6bd36d049fd6703b9](https://github.com/tradingview/charting_library/tree/58407be459423b5837d6a0c6bd36d049fd6703b9)

If you have access to the library
1. Copy `charting_library` folder from [https://github.com/tradingview/charting_library](https://github.com/tradingview/charting_library)
`/public` and `/src`
2. In the `site-config.ts` file, change the value of `haveTvChartingLibrary` to `true`.
