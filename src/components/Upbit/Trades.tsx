import classNames from 'classnames';
import format from 'date-fns-tz/format';
import { useState, useEffect } from 'react';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';
import { subscribeOnUpbitStream } from 'src/store/exchangeSockets';
import { useTradingViewSettingStore } from 'src/store/tradingViewSetting';
import { useUpbitApiStore } from 'src/store/upbitApi';
import { IUpbitSocketMessageTradeSimple } from 'src/types/upbit';
import shallow from 'zustand/shallow';

const UpbitRecentTrades = () => {
  const [hidden, setHidden] = useState(false);

  return (
    <div
      className={classNames(
        'flex flex-col flex-auto p-1 bg-base-200 overflow-hidden h-full',
        hidden ? 'flex-grow-0' : 'flex-grow'
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
      {!hidden && <UpbitRecentTradesInner />}
    </div>
  );
};

const UpbitRecentTradesInner = () => {
  const [trades, setTrades] = useState<Array<IUpbitSocketMessageTradeSimple>>([]);
  const { upbitTradeMarket } = useUpbitApiStore(
    ({ upbitTradeMarket }) => ({ upbitTradeMarket }),
    shallow
  );
  const { selectedExchange, selectedMarketSymbol } = useTradingViewSettingStore(
    ({ selectedExchange, selectedMarketSymbol }) => ({ selectedExchange, selectedMarketSymbol }),
    shallow
  );

  useEffect(() => {
    setTrades([]);
    const unsubscribe = subscribeOnUpbitStream((message: IUpbitSocketMessageTradeSimple) => {
      if (message?.ty !== 'trade' || upbitTradeMarket !== message?.cd) {
        return;
      }

      setTrades((prev) => {
        const newTrade = [...prev];
        newTrade.unshift(message);
        // newTrade.push(message)
        // newTrade.slice(-200);

        return newTrade.slice(0, 200);
      });
    });

    return () => {
      unsubscribe();
    };
  }, [upbitTradeMarket]);

  useEffect(() => {
    setTrades([]);
  }, [selectedExchange, selectedMarketSymbol]);

  return (
    <div className='flex flex-col text-right text-xs overflow-y-auto font-mono bg-base-300'>
      <div className='mt-1 flex justify-between [&>span]:basis-1/3 text-zinc-500'>
        <span>체결가격</span>
        <span>체결액</span>
        <span>체결시간</span>
      </div>
      <div className='overflow-y-auto h-full [&>div]:flex [&>div>span]:basis-1/3'>
        {trades.map((trade) => (
          <div key={`${trade.cd}-${trade.sid}`} className={trade.ab.toLowerCase()}>
            <span>{trade.tp.toLocaleString()}</span>
            <span>{Math.round(trade.tv * trade.tp).toLocaleString()}</span>
            <span className='text-zinc-500'>{format(new Date(trade.ttms), 'HH:mm:ss')}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export { UpbitRecentTrades };
