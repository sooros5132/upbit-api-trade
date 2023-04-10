# Upbit Api Trade

This project is...
1. You can bid/ask/cancel on the site using upbit api.
2. You can see the difference in the price of upbit <-> binance in real time.
3. If JavaScript is not available, you can view the current market price [here](https://upbit-api-trade-demo.vercel.app/last).

## Live Demo
[https://upbit-api-trade-demo.vercel.app](https://upbit-api-trade-demo.vercel.app/)<br />
This demo does not have an API trading feature because it complies with the [Upbit Terms and Conditions](https://www.upbit.com/terms_of_service).

## Screenshots
| Mobile | Tablet | Desktop |
| :---: | :---: | :---: | 
| <img width="520" alt="SCR-20230410-hty" src="https://user-images.githubusercontent.com/74892930/230823079-2af37d4d-3ef2-4844-b5e2-9433c5f15023.png"> | <img width="918" alt="SCR-20230410-hp3" src="https://user-images.githubusercontent.com/74892930/230822847-f2372345-0578-4260-8eb4-2b2611ab7bcb.png" /> | <img width="2344" alt="SCR-20230410-hf2" src="https://user-images.githubusercontent.com/74892930/230822851-e7f9c120-c9a7-4afb-badc-532fb83a7ebb.png" /> |

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
3. `npm run dev` or `npm run build && npm run start`
