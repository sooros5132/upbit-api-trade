import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';
import { subscribeOnUpbitStream } from 'src/store/exchangeSockets';
import { useSiteSettingStore } from 'src/store/siteSetting';
import { useTradingViewSettingStore } from 'src/store/tradingViewSetting';
import { useUpbitAuthStore } from 'src/store/upbitAuth';
import { IUpbitSocketMessageTradeSimple } from 'src/types/upbit';
import shallow from 'zustand/shallow';

type Tabs = 'trade' | 'history';

interface UpbitTradingProps {
  children?: React.ReactNode;
}

const UpbitTrading: React.FC<UpbitTradingProps> = ({ children }) => {
  const [tabActive, setTabActive] = useState<Tabs>('trade');
  const [hidden, setHidden] = useState(false);
  const accessKey = useUpbitAuthStore((state) => state.accessKey);

  const handleClickTabItem = (prop: Tabs) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (prop === tabActive || !accessKey) {
      return;
    }
    setTabActive(prop);
  };

  const handleClickTradingClose = () => {
    useSiteSettingStore.getState().hideTradingPanel();
  };

  return (
    <div className='h-full flex flex-col overflow-hidden'>
      <div className='mt-2 bg-base-200 flex items-center justify-between lg:mt-0'>
        <div className='tabs tabs-boxed flex-auto flex-shrink-0 flex-grow-0 p-0'>
          <a
            className={classNames('tab', tabActive === 'trade' ? 'tab-active' : null)}
            onClick={handleClickTabItem('trade')}
          >
            매수/매도
          </a>
          <a
            className={classNames('tab', tabActive === 'history' ? 'tab-active' : null)}
            onClick={handleClickTabItem('history')}
          >
            거래내역
          </a>
        </div>
        <div className='pr-1'>
          <span
            className='btn btn-circle btn-ghost btn-sm cursor-pointer'
            onClick={() => setHidden((p) => !p)}
          >
            {hidden ? <RiArrowDownSLine /> : <RiArrowUpSLine />}
          </span>
        </div>
      </div>
      {!hidden ? (
        !accessKey ? (
          <div className='h-full bg-base-200 flex-center p-5 text-center'>
            <div>
              <div>오른쪽 상단에서 업비트 API를 먼저 연결해주세요.</div>
              <div>
                <button className={'btn btn-sm mt-2'} onClick={handleClickTradingClose}>
                  매수/매도 패널 닫기
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className='overflow-y-auto scrollbar-hidden flex-grow-0 flex-shrink-0'>
              {tabActive === 'trade' && <Trade />}
              {tabActive === 'history' && <History />}
            </div>
            <RecentTrade />
          </>
        )
      ) : null}
    </div>
  );
};

interface UpbitTradeValues {
  market: string;
  side: 'bid' | 'ask';
  volume: number; // NumberString
  price: number; // NumberString
  ord_type: 'limit' | 'price' | 'market' | 'spiderBid' | 'spiderAsk';
  identifier?: string;
  krwVolume: number;
}

const Trade = () => {
  const account = useUpbitAuthStore(
    (state) => state.accounts.find((account) => account.currency === 'KRW'),
    shallow
  );

  const [values, setValues] = useState<UpbitTradeValues>({
    market: '',
    side: 'bid',
    volume: 0,
    krwVolume: 0,
    price: 0,
    ord_type: 'limit',
    identifier: ''
  });
  const [balanceRange, setBalanceRange] = useState(0);

  const handleChangeNumberValue =
    (key: keyof UpbitTradeValues) => (event: React.ChangeEvent<HTMLInputElement>) => {
      let { price, volume, krwVolume } = values;
      const value = Number(event.target.value);

      setValues((prev) => ({ ...prev, [key]: value }));
    };

  const handleClickOrdTypeBtn = (type: UpbitTradeValues['ord_type']) => () => {
    setValues((prev) => ({ ...prev, ord_type: type }));
  };

  const handleChangeBalanceRange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setBalanceRange(value);
  };

  return (
    <div className='h-full bg-base-300 p-1'>
      <div className='btn-group w-full [&>.btn]:flex-grow'>
        <button
          onClick={handleClickOrdTypeBtn('spiderBid')}
          className={classNames(
            'btn btn-sm lg:btn-xs',
            values.ord_type === 'spiderBid' ? 'btn-active' : null
          )}
        >
          거미줄 매수
        </button>
        <button
          onClick={handleClickOrdTypeBtn('spiderAsk')}
          className={classNames(
            'btn btn-sm lg:btn-xs',
            values.ord_type === 'spiderAsk' ? 'btn-active' : null
          )}
        >
          거미줄 매도
        </button>
      </div>
      <div className='btn-group w-full [&>.btn]:flex-grow'>
        <button
          onClick={handleClickOrdTypeBtn('limit')}
          className={classNames(
            'btn btn-sm lg:btn-xs',
            values.ord_type === 'limit' ? 'btn-active' : null
          )}
        >
          지정가
        </button>
        <button
          onClick={handleClickOrdTypeBtn('price')}
          className={classNames(
            'btn btn-sm lg:btn-xs',
            values.ord_type === 'price' ? 'btn-active' : null
          )}
        >
          시장가매수
        </button>
        <button
          onClick={handleClickOrdTypeBtn('market')}
          className={classNames(
            'btn btn-sm lg:btn-xs',
            values.ord_type === 'market' ? 'btn-active ' : null
          )}
        >
          시장가매도
        </button>
      </div>
      <div className='mt-4 p-1'>
        <div className='flex justify-between items-center'>
          <span className='text-sm'>보유 잔고</span>
          <span className='text-right'>
            {Math.round(Number(account?.balance) || 0).toLocaleString()}{' '}
            <span className='text-xs'>KRW</span>
          </span>
        </div>
      </div>
      <div className='font-mono'>
        <div className='form-control'>
          <label className='label'>
            <span className='label-text'>주문 가격</span>
          </label>
          <label className='input-group input-group-sm'>
            <input
              type='number'
              placeholder='0.01'
              className='input input-bordered input-sm min-w-0 w-full'
              value={values.price}
              onChange={handleChangeNumberValue('price')}
            />
            <span>KRW</span>
          </label>
        </div>
        <div className='form-control'>
          <label className='label'>
            <span className='label-text'>주문 총액</span>
          </label>
          <label className='input-group input-group-sm'>
            <input
              type='number'
              placeholder='0.01'
              className='input input-bordered input-sm min-w-0 w-full'
              value={values.volume}
              onChange={handleChangeNumberValue('volume')}
            />
            <span>BTC</span>
          </label>
        </div>
        <div className='tooltip w-full' data-tip={balanceRange + '%'}>
          <input
            type='range'
            min='0'
            max='100'
            className='range range-xs'
            value={balanceRange}
            onChange={handleChangeBalanceRange}
          />
        </div>
        <div className='form-control'>
          <label className='input-group input-group-sm'>
            <input
              type='number'
              placeholder='0.01'
              className='input input-bordered input-sm min-w-0 w-full'
              value={values.krwVolume}
              onChange={handleChangeNumberValue('krwVolume')}
            />
            <span>KRW</span>
          </label>
        </div>
      </div>
      <div className='mt-4'>
        <div className='btn-group w-full [&>.btn]:flex-grow'>
          <button
            onClick={handleClickOrdTypeBtn('limit')}
            className='btn btn-sm lg:btn-xs xl:btn-sm basis-1/3'
          >
            초기화
          </button>
          <button
            onClick={handleClickOrdTypeBtn('price')}
            className={classNames(
              'btn btn-sm lg:btn-xs xl:btn-sm basis-2/3',
              values.ord_type === 'limit'
                ? 'btn-order'
                : values.ord_type === 'price' || values.ord_type === 'spiderBid'
                ? 'btn-order-bid'
                : values.ord_type === 'market' || values.ord_type === 'spiderAsk'
                ? 'btn-order-ask'
                : null
            )}
          >
            {values.ord_type === 'limit'
              ? '지정가 주문'
              : values.ord_type === 'price'
              ? '시장가 매수'
              : values.ord_type === 'market'
              ? '시장가 매도'
              : values.ord_type === 'spiderAsk'
              ? '거미줄 매도'
              : values.ord_type === 'spiderBid'
              ? '거미줄 매수'
              : ''}
          </button>
        </div>
      </div>
    </div>
  );
};

const History = () => {
  return <div>history</div>;
};

const RecentTrade = () => {
  const [hidden, setHidden] = useState(false);

  return (
    <div
      className={classNames(
        'flex flex-col flex-auto mt-2 p-1 bg-base-200 overflow-hidden',
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
      {!hidden && <RecentTradeInner />}
    </div>
  );
};

const RecentTradeInner = () => {
  const [trades, setTrades] = useState<Array<IUpbitSocketMessageTradeSimple>>([]);
  const { selectedExchange, selectedMarketSymbol } = useTradingViewSettingStore(
    ({ selectedExchange, selectedMarketSymbol }) => ({ selectedExchange, selectedMarketSymbol }),
    shallow
  );

  useEffect(() => {
    const unsubscribe = subscribeOnUpbitStream((message: IUpbitSocketMessageTradeSimple) => {
      if (message.ty !== 'trade') {
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
  }, []);

  useEffect(() => {
    setTrades([]);
  }, [selectedExchange, selectedMarketSymbol]);

  return (
    <>
      <div className='mt-1 flex justify-between text-right [&>span]:flex-1 text-xs bg-base-300'>
        <span className='grow-0 shrink-0'>마켓</span>
        <span>체결가격</span>
        <span>체결액</span>
      </div>
      <div className='h-32 font-mono text-xs bg-base-300 overflow-y-auto lg:h-full'>
        {trades.map((trade) => (
          <div
            key={`${trade.cd}-${trade.sid}`}
            className={classNames(
              'flex justify-between text-right [&>span]:flex-1',
              trade.ab.toLowerCase()
            )}
          >
            <span className='grow-0 shrink-0'>{trade.cd}</span>
            <span>{trade.tp.toLocaleString()}</span>
            <span>{Math.round(trade.tv * trade.tp).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </>
  );
};

export default UpbitTrading;
