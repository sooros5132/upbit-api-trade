import axios from 'axios';
import classNames from 'classnames';
import React, { memo, useEffect, useRef, useState } from 'react';
import isEqual from 'react-fast-compare';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';
import { PROXY_PATH, apiUrls } from 'src/lib/apiUrls';
import { useExchangeStore } from 'src/store/exchangeSockets';
import { useUpbitApiStore } from 'src/store/upbitApi';
import {
  IUpbitOrderbooks,
  IUpbitSocketMessageOrderbookSimple,
  IUpbitSocketMessageTradeSimple,
  IUpbitTradesTicks
} from 'src/types/upbit';
import { satoshiVolumePad, upbitPadEnd } from 'src/utils/utils';
import useSWR from 'swr';
import shallow from 'zustand/shallow';
import { IMarketTableItem } from '../market-table/MarketTable';
import { krwRegex } from 'src/utils/regex';
import numeral from 'numeral';
import { NumericValueType, useUpbitOrderFormStore } from 'src/store/upbitOrderForm';
import { throttle } from 'lodash';

export const UpbitOrderBook = memo(() => {
  const [hidden, setHidden] = useState(false);
  const upbitTradeMarket = useUpbitApiStore((state) => state.upbitTradeMarket, shallow);
  const [currency, setAmountToggle] = useState<'krw' | 'coin'>('krw');
  const marketCode = upbitTradeMarket.replace(krwRegex, '');
  const handleChange = () => {
    if (currency === 'krw') {
      setAmountToggle('coin');
    } else {
      setAmountToggle('krw');
    }
  };

  return (
    <div
      className={classNames(
        'flex flex-col flex-auto bg-base-200 overflow-hidden h-full text-sm',
        hidden ? 'flex-grow-0' : 'flex-grow'
      )}
    >
      <div className='flex items-center justify-between pl-1 flex-auto flex-shrink-0 flex-grow-0'>
        <span className='font-bold text-xs'>호가</span>
        <div className='flex items-center'>
          &nbsp;&nbsp;
          <span
            className='tooltip tooltip-bottom flex-center cursor-pointer text-zinc-500 text-xs'
            onClick={handleChange}
            data-tip='통화 변경'
          >
            KRW&nbsp;
            <input
              type='checkbox'
              className='bg-opacity-100 border-opacity-100 toggle toggle-xs rounded-full border-zinc-500 transition-all'
              checked={currency === 'krw' ? false : true}
              readOnly
            />
            &nbsp;{marketCode}
          </span>
          <span
            className='btn btn-circle btn-ghost btn-xs cursor-pointer'
            onClick={() => setHidden((p) => !p)}
          >
            {hidden ? <RiArrowDownSLine /> : <RiArrowUpSLine />}
          </span>
        </div>
      </div>
      {!hidden && <UpbitOrderBookContainer marketSymbol={upbitTradeMarket} currency={currency} />}
    </div>
  );
}, isEqual);

UpbitOrderBook.displayName = 'UpbitOrderBook';

const UpbitOrderBookContainer: React.FC<{ marketSymbol: string; currency: 'krw' | 'coin' }> = ({
  marketSymbol,
  currency
}) => {
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
            ap: u.ask_price,
            as: u.ask_size,
            bp: u.bid_price,
            bs: u.bid_size
          })),
          tms: o.timestamp
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

  return <OrderBook orderbook={orderbook ?? data} market={market} currency={currency} />;
};
interface OrderBookProps {
  orderbook: IUpbitSocketMessageOrderbookSimple;
  market: IMarketTableItem;
  currency: 'krw' | 'coin';
}

const OrderBook: React.FC<OrderBookProps> = ({ market, orderbook, currency }) => {
  const orderbookRef = useRef<HTMLDivElement>(null);

  const asks = orderbook.obu.map((o) => ({ ap: o.ap, as: o.as })).reverse();
  const bids = orderbook.obu.map((o) => ({ bp: o.bp, bs: o.bs }));
  const maxAsk = Math.max(...orderbook.obu.map((o) => o.as));
  const maxBid = Math.max(...orderbook.obu.map((o) => o.bs));
  const maxVolume = Math.max(maxAsk, maxBid);

  const handleClickPrice = (price: number) => () => {
    useUpbitOrderFormStore.getState().changeNumericValue('price', 'ask', String(price));
    useUpbitOrderFormStore.getState().changeNumericValue('price', 'bid', String(price));
  };
  const handleClickVolume = (key: NumericValueType, volume: number) => () => {
    useUpbitOrderFormStore.getState().changeNumericValue(key, 'ask', String(volume));
    useUpbitOrderFormStore.getState().changeNumericValue(key, 'bid', String(volume));
  };

  useEffect(() => {
    const scrollToCenter = () => {
      if (!orderbookRef.current) return;

      const ref = orderbookRef.current;

      ref.scrollTop = ref.scrollHeight / 2 - ref.clientHeight / 2;
    };

    setTimeout(scrollToCenter, 0);
    const throttleResizeEvent = throttle(scrollToCenter, 200);

    window.addEventListener('resize', throttleResizeEvent);
    return () => window.removeEventListener('resize', throttleResizeEvent);
  }, []);

  return (
    <div
      ref={orderbookRef}
      className='relative flex flex-col text-right text-xs overflow-y-auto xl:text-sm'
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
              잔량(<span className='font-mono'>{market.cd.replace(krwRegex, '')}</span>)
            </th>
          </tr>
        </thead>
        <tbody className='font-mono'>
          {asks.map((trade, i) => {
            // const [priceInt, priceFloat] = trade.ap.toString().split('.');
            // const [quantityInt, quantityFloat] = trade.as.toString().split('.');
            const quantity = currency === 'krw' ? Math.round(trade.as * market.tp) : trade.as;
            const volumeWidth = Math.round(100 - (trade.as / maxVolume) * 100);
            const changeRate = (trade.ap / market.pcp) * 100 - 100;
            return (
              <tr
                key={trade?.ap ? `${trade.ap}` : `${trade.ap}-${i}`}
                className='ask bg-rose-700/10'
              >
                <td>
                  <span
                    className={
                      changeRate > 0 ? 'bid' : changeRate === 0 ? 'text-base-content' : 'ask'
                    }
                  >
                    {changeRate.toFixed(2)}%
                  </span>
                </td>
                <td>
                  <div
                    className='cursor-pointer hover:bg-rose-600/40'
                    onClick={handleClickPrice(trade.ap)}
                  >
                    {upbitPadEnd(trade.ap)}
                  </div>
                </td>
                <td>
                  <div
                    className='cursor-pointer hover:bg-rose-600/40'
                    onClick={handleClickVolume('volume', trade.as)}
                  >
                    <div
                      style={{
                        background: `linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) ${volumeWidth}%, rgba(244,63,94,0.15) ${volumeWidth}%)`
                      }}
                    >
                      {currency === 'krw'
                        ? numeral(quantity).format('0,0')
                        : satoshiVolumePad(trade.ap, quantity)}
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
          <MarketInfo />
          {bids.map((trade, i) => {
            // const [priceInt, priceFloat] = trade.bp.toString().split('.');
            // const [quantityInt, quantityFloat] = (trade.bs * market.tp).toString().split('.');
            const quantity = currency === 'krw' ? Math.round(trade.bs * market.tp) : trade.bs;
            const volumeWidth = Math.round(100 - (trade.bs / maxVolume) * 100);
            const changeRate = (trade.bp / market.pcp) * 100 - 100;

            return (
              <tr
                key={trade?.bp ? `${trade.bp}` : `${trade.bp}-${i}`}
                className='bid bg-zinc-700/20'
              >
                <td>
                  <span
                    className={
                      changeRate > 0 ? 'bid' : changeRate === 0 ? 'text-base-content' : 'ask'
                    }
                  >
                    {changeRate.toFixed(2)}%
                  </span>
                </td>
                <td>
                  <div
                    className='cursor-pointer hover:bg-teal-600/40'
                    onClick={handleClickPrice(trade.bp)}
                  >
                    {upbitPadEnd(trade.bp)}
                  </div>
                </td>
                <td>
                  <div
                    className='cursor-pointer hover:bg-teal-600/40'
                    onClick={handleClickVolume('volume', trade.bs)}
                  >
                    <div
                      style={{
                        background: `linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) ${volumeWidth}%, rgba(20,184,166,0.15) ${volumeWidth}%)`
                      }}
                    >
                      {currency === 'krw'
                        ? numeral(quantity).format('0,0')
                        : satoshiVolumePad(trade.bp, quantity)}
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const MarketInfo: React.FC = memo(() => {
  const upbitTradeMarket = useUpbitApiStore((state) => state.upbitTradeMarket, shallow);
  const upbitTradeMessages = useExchangeStore.getState().upbitTradeMessages;
  const lastMessage = upbitTradeMessages[upbitTradeMessages?.length - 1];
  const [trade, setTrade] = useState<IUpbitSocketMessageTradeSimple>(lastMessage);
  const [change, setChange] = useState<'RISE' | 'EVEN' | 'FALL'>('EVEN');

  const MAX_TRADE = 1;
  const { data } = useSWR<IUpbitSocketMessageTradeSimple | null>(
    `${PROXY_PATH}${apiUrls.upbit.path}${apiUrls.upbit.trades.ticks}?market=${upbitTradeMarket}&count=${MAX_TRADE}`,
    async (url: string) => {
      return await axios
        .get<Array<IUpbitTradesTicks>>(url)
        .then((res) => {
          const length = res.data.length || 0;

          const datas = res.data.map(
            (t) =>
              ({
                ty: 'trade', //								타입
                cd: t.market, //							마켓 코드 (ex. KRW-BTC)
                tp: t.trade_price, //					체결 가격
                tv: t.trade_volume, //				체결량
                ab: t.ask_bid, //							매수/매도 구분 ASK: 매도, BID: 매수
                pcp: t.prev_closing_price, //	전일 종가
                c: 'EVEN', //									전일 대비 - RISE: 상승, EVEN: 보합, FALL: 하락
                cp: t.change_price, //				부호 없는 전일 대비 값
                td: t.trade_date_utc, //			체결 일자(UTC 기준) yyyy-MM-dd
                ttm: t.trade_time_utc, //			체결 시각(UTC 기준) HH:mm:ss
                ttms: t.timestamp, //					체결 타임스탬프 (millisecond)
                tms: 0, //										타임스탬프 (millisecond)
                sid: t.sequential_id, //			체결 번호 (Unique)
                st: 'SNAPSHOT' //							스트림 타입 - SNAPSHOT : 스냅샷, REALTIME 실시간
              } as IUpbitSocketMessageTradeSimple)
          );

          return datas[length - 1];
        })
        .catch(() => null);
    },
    {
      revalidateOnFocus: false,
      errorRetryCount: 0
    }
  );

  useEffect(() => {
    let prevMessage = data || null;
    if (prevMessage) {
      setChange('EVEN');
      setTrade(prevMessage);
    }
    const unsubscribe = useExchangeStore.subscribe(({ upbitTradeMessages }) => {
      const len = upbitTradeMessages.length;

      const lastMessage = upbitTradeMessages[len - 1];
      if (lastMessage && prevMessage !== lastMessage && lastMessage.cd === upbitTradeMarket) {
        const newChange =
          !prevMessage || prevMessage.tp === lastMessage.tp
            ? 'EVEN'
            : prevMessage.tp < lastMessage.tp
            ? 'RISE'
            : 'FALL';
        prevMessage = lastMessage;
        setChange(newChange);
        setTrade(lastMessage);
      }
    });

    //? 실시간 스트림
    // const unsubscribe = subscribeOnUpbitStream<IUpbitSocketMessageTradeSimple>((newMessage) => {
    //   if (newMessage?.ty !== 'trade') {
    //     return;
    //   }
    //   if (newMessage && prevMessage !== newMessage && newMessage.cd === upbitTradeMarket) {
    //     const newChange =
    //       !prevMessage || prevMessage.tp === newMessage.tp
    //         ? 'EVEN'
    //         : prevMessage.tp < newMessage.tp
    //         ? 'RISE'
    //         : 'FALL';
    //     prevMessage = newMessage;
    //     setChange(newChange);
    //     setTrade(newMessage);
    //   }
    // });

    return () => {
      unsubscribe();
    };
  }, [data, upbitTradeMarket]);

  return <MarketInfoInner trade={trade || data} change={change} />;
}, isEqual);

MarketInfo.displayName = 'MarketInfo';

const MarketInfoInner: React.FC<{
  change: 'RISE' | 'EVEN' | 'FALL';
  trade?: IUpbitSocketMessageTradeSimple;
}> = ({ trade, change }) => {
  return (
    <tr className='text-[1.2em] h-[1.25em]'>
      {trade && (
        <td colSpan={3} className='text-center text-base-content'>
          <span className={change === 'RISE' ? 'bid' : change === 'FALL' ? 'ask' : ''}>
            {upbitPadEnd(trade.tp)}
            <span>{change === 'RISE' ? '▲' : change === 'FALL' ? '▼' : ''}</span>
          </span>
        </td>
      )}
    </tr>
  );
};
