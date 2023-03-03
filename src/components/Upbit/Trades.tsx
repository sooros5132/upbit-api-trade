import axios from 'axios';
import classNames from 'classnames';
import format from 'date-fns-tz/format';
import { useState, useEffect, memo } from 'react';
import isEqual from 'react-fast-compare';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';
import { apiUrls, PROXY_PATH } from 'src/lib/apiUrls';
import { subscribeOnUpbitStream } from 'src/store/exchangeSockets';
import { useSiteSettingStore } from 'src/store/siteSetting';
import { useUpbitApiStore } from 'src/store/upbitApi';
import { IUpbitSocketMessageTradeSimple, IUpbitTradesTicks } from 'src/types/upbit';
import { upbitPadEnd } from 'src/utils/utils';
import useSWR from 'swr';
import shallow from 'zustand/shallow';

const UpbitRecentTrades = memo(() => {
  const [hidden, setHidden] = useState(false);

  return (
    <div
      className={classNames(
        'flex flex-col flex-auto bg-base-200 overflow-hidden',
        hidden ? 'flex-grow-0' : 'h-full flex-grow'
      )}
    >
      <div className='flex items-center justify-between pl-1 flex-auto flex-shrink-0 flex-grow-0'>
        <span className='text-sm'>최근 거래내역</span>
        <span
          className='btn btn-circle btn-ghost btn-xs cursor-pointer'
          onClick={() => setHidden((p) => !p)}
        >
          {hidden ? <RiArrowDownSLine /> : <RiArrowUpSLine />}
        </span>
      </div>
      {!hidden && <UpbitRecentTradesContainer />}
    </div>
  );
}, isEqual);

UpbitRecentTrades.displayName = 'UpbitRecentTrades';

const MAX_TRADE = 150;

const UpbitRecentTradesContainer = () => {
  const { upbitTradeMarket } = useUpbitApiStore(
    ({ upbitTradeMarket }) => ({ upbitTradeMarket }),
    shallow
  );

  const { data, mutate } = useSWR(
    `${PROXY_PATH}${apiUrls.upbit.path}${apiUrls.upbit.trades.ticks}?market=${upbitTradeMarket}&count=${MAX_TRADE}`,
    async (url: string) => {
      return await axios
        .get<Array<IUpbitTradesTicks>>(url)
        .then((res) =>
          res.data.map(
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
          )
        )
        .catch(() => []);
    },
    {
      revalidateOnFocus: false,
      errorRetryCount: 0
    }
  );

  useEffect(() => {
    mutate(undefined);
  }, [mutate, upbitTradeMarket]);

  if (!data) {
    return null;
  }

  return <UpbitRecentTradesInner market={upbitTradeMarket} trades={data} />;
};

interface UpbitRecentTradesInnerProps {
  market: string;
  trades: Array<IUpbitSocketMessageTradeSimple>;
}

const UpbitRecentTradesInner: React.FC<UpbitRecentTradesInnerProps> = ({
  market,
  trades: tradesProp
}) => {
  const [trades, setTrades] = useState<Array<IUpbitSocketMessageTradeSimple>>(tradesProp);
  const highlight = useSiteSettingStore(({ highlight }) => highlight, shallow);
  useEffect(() => {
    const unsubscribe = subscribeOnUpbitStream((message: IUpbitSocketMessageTradeSimple) => {
      if (message?.ty !== 'trade' || market !== message?.cd) {
        return;
      }
      const newTrade = [...trades];
      newTrade.unshift(message);
      // newTrade.push(message)
      // newTrade.slice(-200);

      setTrades(newTrade.slice(0, MAX_TRADE));
    });

    return () => {
      unsubscribe();
    };
  }, [market, trades]);

  return (
    <div className='relative flex flex-col h-full text-right text-xs overflow-y-auto bg-base-300 2xl:text-sm'>
      <table className='border-separate border-spacing-0 w-full text-zinc-500'>
        <colgroup>
          <col width='35%'></col>
          <col width='35%'></col>
          <col width='30%'></col>
        </colgroup>
        <thead className='sticky top-0 left-0 bg-base-300'>
          <tr>
            <th>
              체결가격(<span className='font-mono'>KRW</span>)
            </th>
            <th>
              체결액(<span className='font-mono'>KRW</span>)
            </th>
            <th>체결시간</th>
          </tr>
        </thead>
        <tbody className='font-mono'>
          {trades.map((trade) => (
            <tr
              key={`${trade.cd}-${trade.sid}`}
              className={classNames(trade.ab.toLowerCase(), highlight ? 'highlight' : null)}
            >
              <td>{upbitPadEnd(trade.tp)}</td>
              <td>{Math.round(trade.tv * trade.tp).toLocaleString()}</td>
              <td className='text-zinc-500'>{format(new Date(trade.ttms), 'HH:mm:ss')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export { UpbitRecentTrades };
