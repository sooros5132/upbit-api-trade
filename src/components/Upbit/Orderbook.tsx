import axios from 'axios';
import classNames from 'classnames';
import React, { memo, useEffect, useRef, useState } from 'react';
import isEqual from 'react-fast-compare';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';
import { PROXY_PATH, apiUrls } from 'src/lib/apiUrls';
import { useExchangeStore } from 'src/store/exchangeSockets';
import { useUpbitApiStore } from 'src/store/upbitApi';
import { IUpbitOrderbooks, IUpbitSocketMessageOrderbookSimple } from 'src/types/upbit';
import { upbitPadEnd } from 'src/utils/utils';
import useSWR from 'swr';
import shallow from 'zustand/shallow';
import { IMarketTableItem } from '../market-table/MarketTable';

const UpbitOrderBook = memo(() => {
  const [hidden, setHidden] = useState(false);
  const upbitTradeMarket = useUpbitApiStore((state) => state.upbitTradeMarket, shallow);

  return (
    <div
      className={classNames(
        'flex flex-col flex-auto bg-base-200 overflow-hidden h-full',
        hidden ? 'flex-grow-0' : 'flex-grow'
      )}
    >
      <div className='flex items-center justify-between pl-1 flex-auto flex-shrink-0 flex-grow-0'>
        <span className='text-sm'>호가</span>
        <span
          className='btn btn-circle btn-ghost btn-xs cursor-pointer'
          onClick={() => setHidden((p) => !p)}
        >
          {hidden ? <RiArrowDownSLine /> : <RiArrowUpSLine />}
        </span>
      </div>
      {!hidden && <UpbitOrderBookContainer marketSymbol={upbitTradeMarket} />}
    </div>
  );
}, isEqual);

UpbitOrderBook.displayName = 'UpbitOrderBook';

const UpbitOrderBookContainer: React.FC<{ marketSymbol: string }> = ({ marketSymbol }) => {
  const { orderbook, market } = useExchangeStore(({ upbitOrderbook, upbitMarketDatas }) => {
    return {
      orderbook: upbitOrderbook?.cd === marketSymbol ? upbitOrderbook : null,
      market: upbitMarketDatas?.[marketSymbol] ?? null
    };
  }, shallow);

  const { data } = useSWR(
    `${PROXY_PATH}${apiUrls.upbit.path}${apiUrls.upbit.orderbook}?markets=${marketSymbol}`,
    async (url: string) => {
      const result = (await axios.get<IUpbitOrderbooks>(url).then((res) => {
        const o = res.data[0];

        return {
          ty: 'orderbook',
          cd: marketSymbol,
          tas: o.total_ask_size,
          tbs: o.total_bid_size,
          obu: o.orderbook_units.map((u) => ({
            // 호가	List of Objects
            ap: u.ask_price,
            as: u.ask_size,
            bp: u.bid_price,
            bs: u.bid_size // 매수 잔량	Double
          })),
          tms: o.timestamp // 타임스탬프 (millisecond)	Long
        };
      })) as IUpbitSocketMessageOrderbookSimple;
      useExchangeStore.setState({
        upbitOrderbook: result
      });
      return result;
    },
    {
      revalidateOnFocus: false,
      errorRetryCount: 0
    }
  );

  if (!data || !market) {
    return <></>;
  }

  return <OrderBook orderbook={orderbook ?? data} market={market} />;
};
interface OrderBookProps {
  orderbook: IUpbitSocketMessageOrderbookSimple;
  market: IMarketTableItem;
}

const OrderBook: React.FC<OrderBookProps> = ({ market, orderbook }) => {
  const orderbookRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      if (!orderbookRef.current) return;

      const ref = orderbookRef.current;

      ref.scrollTop = ref.scrollHeight / 2 - ref.clientHeight / 2;
    }, 0);
  }, []);

  const asks = orderbook.obu.map((o) => ({ ap: o.ap, as: o.as })).reverse();
  const bids = orderbook.obu.map((o) => ({ bp: o.bp, bs: o.bs }));
  const maxAsk = Math.max(...orderbook.obu.map((o) => o.as));
  const maxBid = Math.max(...orderbook.obu.map((o) => o.bs));
  const maxVolume = Math.max(maxAsk, maxBid);

  // ty: 'orderbook';
  // cd: string; // 마켓 코드 (ex. KRW-BTC)	String
  // tas: number; // 호가 매도 총 잔량	Double
  // tbs: number; // 호가 매수 총 잔량	Double
  // obu: Array<{
  //   호가	List of Objects
  //   ap: number; // 매도 호가	Double
  //   bp: number; // 매수 호가	Double
  //   as: number; // 매도 잔량	Double
  //   bs: number; // 매수 잔량	Double
  // }>;
  // tms: number; // 타임스탬프 (millisecond)	Long

  return (
    <div
      ref={orderbookRef}
      className='relative flex flex-col mt-1 text-right text-xs overflow-y-auto xl:text-sm'
    >
      <table className='border-separate border-spacing-0 w-full text-zinc-500'>
        <colgroup>
          <col width='20%'></col>
          <col width='40%'></col>
          <col width='40%'></col>
        </colgroup>
        <thead className='sticky top-0 left-0 bg-base-300'>
          <tr>
            <th>변동</th>
            <th>
              호가(<span className='font-mono'>KRW</span>)
            </th>
            <th>
              잔량(<span className='font-mono'>KRW</span>)
            </th>
          </tr>
        </thead>
        <tbody className='font-mono'>
          {asks.map((trade, i) => {
            // const [priceInt, priceFloat] = trade.ap.toString().split('.');
            // const [quantityInt, quantityFloat] = trade.as.toString().split('.');
            const quantity = Math.round(trade.as * market.tp);
            const volumeWidth = Math.round(100 - (trade.as / maxVolume) * 100);
            const changeRate = (trade.ap / market.pcp) * 100 - 100;
            return (
              <tr key={`${trade.ap}-${i}`} className='ask bg-rose-700/10'>
                <td>
                  <span
                    className={
                      changeRate > 0 ? 'bid' : changeRate === 0 ? 'text-base-content' : 'ask'
                    }
                  >
                    {changeRate.toFixed(2)}%
                  </span>
                </td>
                <td>{upbitPadEnd(trade.ap)}</td>
                <td
                  style={{
                    background: `linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) ${volumeWidth}%, rgba(244,63,94,0.15) ${volumeWidth}%)`
                  }}
                >
                  {quantity.toLocaleString()}
                </td>
              </tr>
            );
          })}
          {bids.map((trade, i) => {
            // const [priceInt, priceFloat] = trade.bp.toString().split('.');
            // const [quantityInt, quantityFloat] = (trade.bs * market.tp).toString().split('.');
            const quantity = Math.round(trade.bs * market.tp);
            const volumeWidth = Math.round(100 - (trade.bs / maxVolume) * 100);
            const changeRate = (trade.bp / market.pcp) * 100 - 100;

            return (
              <tr key={`${trade.bp}-${i}`} className='bid bg-zinc-700/20'>
                <td>
                  <span
                    className={
                      changeRate > 0 ? 'bid' : changeRate === 0 ? 'text-base-content' : 'ask'
                    }
                  >
                    {changeRate.toFixed(2)}%
                  </span>
                </td>
                <td>{upbitPadEnd(trade.bp)}</td>
                <td
                  style={{
                    background: `linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) ${volumeWidth}%, rgba(20,184,166,0.15) ${volumeWidth}%)`
                  }}
                >
                  {quantity.toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export { UpbitOrderBook };
