import classNames from 'classnames';
import { useState } from 'react';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';
import { useExchangeStore } from 'src/store/exchangeSockets';
import { useUpbitApiStore } from 'src/store/upbitApi';
import shallow from 'zustand/shallow';

const UpbitOrderBook = () => {
  const [hidden, setHidden] = useState(false);
  const upbitTradeMarket = useUpbitApiStore((state) => state.upbitTradeMarket, shallow);

  return (
    <div
      className={classNames(
        'flex flex-col flex-auto p-1 bg-base-200 overflow-hidden h-full',
        hidden ? 'flex-grow-0' : 'flex-grow'
      )}
    >
      <div className='flex items-center justify-between pl-1 flex-auto flex-shrink-0 flex-grow-0'>
        <span className='text-sm'>오더북({upbitTradeMarket})</span>
        <span
          className='btn btn-circle btn-ghost btn-xs cursor-pointer'
          onClick={() => setHidden((p) => !p)}
        >
          {hidden ? <RiArrowDownSLine /> : <RiArrowUpSLine />}
        </span>
      </div>
      {!hidden && <UpbitOrderBookInner />}
    </div>
  );
};

const UpbitOrderBookInner = () => {
  const { orderbook, market } = useExchangeStore(({ upbitOrderbook, upbitMarketDatas }) => {
    return {
      orderbook: upbitOrderbook,
      market: upbitMarketDatas?.[upbitOrderbook?.cd ?? ''] ?? null
    };
  }, shallow);

  if (!orderbook || !market) {
    return <></>;
  }

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
    <div className='flex flex-col text-right text-xs overflow-y-auto font-mono bg-base-300 lg:text-sm'>
      <div className='mt-1 flex [&>div]:basis-1/2 text-zinc-500'>
        <div>호가</div>
        <div>잔량(KRW)</div>
      </div>
      <div className='overflow-y-auto h-full [&>div]:flex [&>div>div]:basis-1/2 [&>div]:gap-1'>
        {asks.map((trade) => {
          const [priceInt, priceFloat] = trade.ap.toString().split('.');
          // const [quantityInt, quantityFloat] = trade.as.toString().split('.');
          const quantity = Math.round(trade.as * market.tp);
          const volumeWidth = Math.round(100 - (trade.as / maxVolume) * 100);
          return (
            <div key={trade.ap} className='ask'>
              <div>{`${priceInt ? Number(priceInt).toLocaleString() : 0}${
                priceFloat ? `.${priceFloat.padStart(8, '0')}` : ''
              }`}</div>
              <div
                style={{
                  background: `linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) ${volumeWidth}%, rgba(244,63,94,0.15) ${volumeWidth}%)`
                }}
              >
                {quantity.toLocaleString()}
              </div>
            </div>
          );
        })}
        {bids.map((trade) => {
          const [priceInt, priceFloat] = trade.bp.toString().split('.');
          // const [quantityInt, quantityFloat] = (trade.bs * market.tp).toString().split('.');
          const quantity = Math.round(trade.bs * market.tp);
          const volumeWidth = Math.round(100 - (trade.bs / maxVolume) * 100);

          return (
            <div key={trade.bp} className='bid'>
              <div>{`${priceInt ? Number(priceInt).toLocaleString() : 0}${
                priceFloat ? `.${priceFloat.padStart(8, '0')}` : ''
              }`}</div>
              <div
                style={{
                  background: `linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) ${volumeWidth}%, rgba(20,184,166,0.15) ${volumeWidth}%)`
                }}
              >
                {quantity.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { UpbitOrderBook };
