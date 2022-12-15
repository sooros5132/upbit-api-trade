import classNames from 'classnames';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';
import { apiUrls } from 'src/lib/apiUrls';
import { subscribeOnUpbitStream, useExchangeStore } from 'src/store/exchangeSockets';
import { useSiteSettingStore } from 'src/store/siteSetting';
import { useTradingViewSettingStore } from 'src/store/tradingViewSetting';
import { useUpbitAuthStore } from 'src/store/upbitAuth';
import {
  IUpbitSocketMessageTradeSimple,
  IUpbitOrdersChance,
  IUpbitGetOrderResponse
} from 'src/types/upbit';
import { krwRegex } from 'src/utils/regex';
import { percentageCalculator, percentRatio, priceCorrection } from 'src/utils/utils';
import { GrPowerReset } from 'react-icons/gr';
import useSWR from 'swr';
import shallow from 'zustand/shallow';
import format from 'date-fns-tz/format';
import { toast } from 'react-toastify';

type Tabs = 'trade' | 'history' | 'orderCancel';

interface UpbitTradingProps {}

const UpbitTrading: React.FC<UpbitTradingProps> = ({}) => {
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
            className={classNames('tab', tabActive === 'orderCancel' ? 'tab-active' : null)}
            onClick={handleClickTabItem('orderCancel')}
          >
            주문취소
          </a>
          {process.env.NODE_ENV === 'development' && (
            <a
              className={classNames('tab', tabActive === 'history' ? 'tab-active' : null)}
              onClick={handleClickTabItem('history')}
            >
              거래내역
            </a>
          )}
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
          <div className='bg-base-200 flex-center p-5 text-center'>
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
              {tabActive === 'orderCancel' && <OrderCancel />}
            </div>
          </>
        )
      ) : null}
      <RecentTrade />
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

interface DefaultPanelProp {
  onChangeRange: (
    prop: 'balance' | 'price'
  ) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClickResetButton: (prop: 'balance' | 'price', percentage: number) => () => void;
  onChangeNumberValue: (
    key: keyof UpbitTradeValues
  ) => (event: React.ChangeEvent<HTMLInputElement>) => void;
}

type OrderBtnType = UpbitTradeValues['ord_type'] | 'reset';

const Trade = () => {
  const { upbitTradeMarket, setUpbitTradeMarket } = useSiteSettingStore(
    ({ upbitTradeMarket, setUpbitTradeMarket }) => ({
      upbitTradeMarket,
      setUpbitTradeMarket
    }),
    shallow
  );
  const { data: chance, error } = useSWR<IUpbitOrdersChance>(
    `${apiUrls.upbit.path}${apiUrls.upbit.ordersChance}?market=${upbitTradeMarket}`,
    async () => {
      return await useUpbitAuthStore.getState().getOrdersChange(upbitTradeMarket);
    },
    {
      refreshInterval: 60 * 1000
    }
  );

  if (error) {
    <div className='bg-base-200 flex-center p-5 text-center'>
      <div>
        <div>마켓 정보를 가져오는 중 에러가 발생했습니다.</div>
      </div>
    </div>;
  }

  if (!chance) {
    return (
      <div className='flex-center flex-col px-5 py-10 gap-2 text-center bg-base-200 animate-pulse'>
        <div className='animate-spin text-3xl'>
          <AiOutlineLoading3Quarters />
        </div>
        <div className='text-center'>
          <div>마켓 정보를 가져오는 중 입니다.</div>
        </div>
      </div>
    );
  }

  return <TradeInner orderChance={chance} changeMarket={setUpbitTradeMarket} />;
};

interface TradeInnerProps {
  orderChance: IUpbitOrdersChance;
  changeMarket: (market: string) => void;
}

const TradeInner: FC<TradeInnerProps> = ({ orderChance, changeMarket }) => {
  const marketId = orderChance.market.id;
  const krwBalance = orderChance.bid_account.balance;
  const upbitMarkets = useExchangeStore((state) => state.upbitMarkets, shallow);

  const [balanceRange, setBalanceRange] = useState(0);
  const [priceRange, setPriceRange] = useState(0);
  const [values, setValues] = useState<UpbitTradeValues>({
    market: '',
    side: 'bid',
    volume: 0,
    krwVolume: 0,
    price: useExchangeStore.getState()?.upbitMarketDatas?.[marketId]?.tp || 1,
    ord_type: 'limit',
    identifier: ''
  });

  const handleChangeMarket = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newMarket = event.target.value;
    changeMarket(newMarket);
    resetValuesAndRanges(newMarket);
  };

  const handleChangeNumberValue =
    (key: keyof UpbitTradeValues) => (event: React.ChangeEvent<HTMLInputElement>) => {
      let { volume, krwVolume, price } = values;
      const value = Number(event.target.value);

      switch (key) {
        case 'price': {
          price = value;
          krwVolume = Math.round(volume * price);

          const newBalanceRange = Math.round((krwVolume / Number(krwBalance)) * 100);
          setBalanceRange(newBalanceRange);
          break;
        }
        case 'volume': {
          volume = value;
          krwVolume = Math.round(volume * price);
          setBalanceRange(Math.round((krwVolume / Number(krwBalance)) * 100));
          break;
        }
        case 'krwVolume': {
          krwVolume = value;
          volume = Number(Math.floor((krwVolume / price) * 0.95 * 100000000).toFixed()) / 100000000;
          setBalanceRange(Math.round((krwVolume / Number(krwBalance)) * 100));
          break;
        }
      }

      setValues({ ...values, price, volume, krwVolume });
    };

  const handleClickOrdTypeBtn = (type: UpbitTradeValues['ord_type']) => () => {
    setValues((prev) => ({ ...prev, ord_type: type }));
  };

  const changeRange = (prop: 'balance' | 'price', percentage: number) => {
    let { volume, krwVolume, price } = values;

    switch (prop) {
      case 'price': {
        const currentPrice = useExchangeStore.getState().upbitMarketDatas[marketId].tp;
        price = priceCorrection(percentageCalculator(currentPrice, percentage));
        krwVolume = Math.round(volume * price);

        const newBalanceRange = Math.round((krwVolume / Number(krwBalance)) * 100);
        setBalanceRange(newBalanceRange);
        setPriceRange(percentage);
        break;
      }
      case 'balance': {
        const currentBalance = Number(krwBalance || 0);
        const currentPrice = price;
        volume =
          Number(
            Math.floor(
              percentRatio(currentBalance / currentPrice, percentage) * 100000000
            ).toFixed()
          ) / 100000000;
        krwVolume = Math.round(volume * currentPrice);
        setBalanceRange(percentage);
        break;
      }
    }
    setValues({ ...values, price, volume, krwVolume });
  };

  const handleChangeRange =
    (prop: 'balance' | 'price') => (event: React.ChangeEvent<HTMLInputElement>) => {
      const percentage = Number(event.target.value);
      changeRange(prop, percentage);
    };

  const handleClickResetButton = (prop: 'balance' | 'price', percentage: number) => () => {
    changeRange(prop, percentage);
  };

  const handleClickOrderBtn = (orderType: OrderBtnType, side?: 'ask' | 'bid') => async () => {
    switch (orderType) {
      case 'limit': {
        const { volume, price } = values;
        if (!side || volume === 0 || price === 0) {
          return;
        }
        const params = {
          market: marketId,
          side,
          volume: volume.toString(),
          price: price.toString(),
          ord_type: 'limit'
        } as const;
        await useUpbitAuthStore.getState().createOrder(params);
        break;
      }
      case 'market': {
        break;
      }
      case 'price': {
        break;
      }
      case 'reset': {
        resetValuesAndRanges();
        break;
      }
    }
  };

  useEffect(() => {
    // 최초 주문 가격 설정, setInterval이 아닌 구독 방식
    const unsubscribe = useExchangeStore.subscribe((state) => {
      if (state.upbitMarketDatas?.[marketId]?.tp) {
        unsubscribe();
        setValues({
          ...values,
          price: state.upbitMarketDatas?.[marketId]?.tp
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetValuesAndRanges = useCallback(
    (newMarket?: string) => {
      const selectedMarket = newMarket ? newMarket : marketId;
      setValues({
        ...values,
        price:
          useExchangeStore.getState()?.upbitMarketDatas?.[selectedMarket.toUpperCase()]?.tp || 1,
        volume: 0,
        krwVolume: 0
      });
      setBalanceRange(0);
      setPriceRange(0);
    },
    [marketId, values]
  );

  useEffect(() => {
    setValues((prev) => ({
      ...prev,
      price:
        useExchangeStore.getState()?.upbitMarketDatas?.[orderChance.market.id.toUpperCase()]?.tp ||
        1,
      volume: 0,
      krwVolume: 0
    }));
    setBalanceRange(0);
    setPriceRange(0);
  }, [orderChance.market.id]);

  return (
    <div className='h-full bg-base-300 p-1 font-mono'>
      {false && process.env.NODE_ENV !== 'production' && (
        <div className='btn-group w-full [&>.btn]:flex-grow gap-0.5'>
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
      )}
      <div className='btn-group w-full [&>.btn]:flex-grow gap-0.5'>
        <button
          onClick={handleClickOrdTypeBtn('limit')}
          className={classNames(
            'btn btn-sm btn-ghost lg:btn-xs',
            values.ord_type === 'limit' ? 'btn-active' : null
          )}
        >
          지정가
        </button>
        <button
          onClick={handleClickOrdTypeBtn('market')}
          className={classNames(
            'btn btn-sm btn-ghost lg:btn-xs',
            values.ord_type === 'price' || values.ord_type === 'market' ? 'btn-active ' : null
          )}
        >
          시장가
        </button>
      </div>
      <div className='[&>div]:mt-1 [&>div]:p-1'>
        <div className='flex justify-between items-center gap-x-1'>
          <span className='text-sm whitespace-nowrap'>코인 선택</span>
          <div className='form-control bg-base-200'>
            <label className='input-group overflow-hidden'>
              <select
                placeholder='코인 선택'
                className='select select-ghost select-sm flex-grow min-w-0 w-full'
                value={marketId}
                onChange={handleChangeMarket}
              >
                <option value='' disabled>
                  코인 선택
                </option>
                {upbitMarkets.map((market) => {
                  const code = market.market;
                  return (
                    <option key={market.market} value={code}>
                      {market.korean_name}
                    </option>
                  );
                })}
              </select>
            </label>
          </div>
        </div>
        <div className='flex justify-between items-center'>
          <span className='text-sm'>보유 잔고</span>
          <span className='text-right'>
            {Math.round(Number(krwBalance) || 0).toLocaleString()}{' '}
            <span className='text-xs'>KRW</span>
          </span>
        </div>
        {/* control panel */}
        {values.ord_type === 'limit' && (
          <OrderPricePanel
            price={values.price}
            priceRange={priceRange}
            onChangeRange={handleChangeRange}
            onClickResetButton={handleClickResetButton}
            onChangeNumberValue={handleChangeNumberValue}
          />
        )}
        {(values.ord_type === 'limit' ||
          values.ord_type === 'market' ||
          values.ord_type === 'price') && (
          <OrderVolumePanel
            market={orderChance.ask_account.currency}
            volume={values.volume}
            krwVolume={values.krwVolume}
            krwBalance={Number(krwBalance)}
            balanceRange={balanceRange}
            onChangeRange={handleChangeRange}
            onClickResetButton={handleClickResetButton}
            onChangeNumberValue={handleChangeNumberValue}
          />
        )}
        {/* // control panel */}
        {/* order btn */}
        {values.ord_type === 'limit' ? (
          <LimitOrderBtnPanel onClickOrder={handleClickOrderBtn} />
        ) : values.ord_type === 'market' || values.ord_type === 'price' ? (
          <MarketOrderBtnPanel onClickOrder={handleClickOrderBtn} />
        ) : null}
        {/* // order btn */}
      </div>
    </div>
  );
};

interface OrderPricePanelProps extends DefaultPanelProp {
  price: number;
  priceRange: number;
}

const OrderPricePanel: FC<OrderPricePanelProps> = ({
  price,
  priceRange,
  onChangeRange,
  onClickResetButton,
  onChangeNumberValue
}) => {
  return (
    <div>
      <div
        className='mb-1 flex-center gap-x-2 text-sm tooltip'
        data-tip={`현재가 대비 ${priceRange}%`}
      >
        <span className='whitespace-nowrap cursor-pointer' onClick={onClickResetButton('price', 0)}>
          주문 가격
        </span>
        <div className='flex-center w-full'>
          <input
            type='range'
            min='-50'
            max='50'
            step={1}
            className='range range-xs tooltip'
            value={priceRange}
            onChange={onChangeRange('price')}
          />
        </div>
      </div>
      <div className='form-control'>
        <label className='input-group input-group-sm'>
          <input
            type='number'
            placeholder='0.01'
            className='input input-bordered input-sm min-w-0 w-full'
            value={price}
            onChange={onChangeNumberValue('price')}
          />
          <span>KRW</span>
        </label>
      </div>
    </div>
  );
};

interface OrderVolumePanelProps extends DefaultPanelProp {
  market: string;
  volume: number;
  krwVolume: number;
  krwBalance: number;
  balanceRange: number;
}

const OrderVolumePanel: FC<OrderVolumePanelProps> = ({
  market,
  volume,
  krwVolume,
  krwBalance,
  balanceRange,
  onChangeNumberValue,
  onChangeRange,
  onClickResetButton
}) => {
  return (
    <div>
      <div
        className='mb-1 flex-center gap-x-2 text-sm tooltip'
        data-tip={`잔고 대비 주문 비율 ${balanceRange}%`}
      >
        <span
          className='whitespace-nowrap cursor-pointer'
          onClick={onClickResetButton('balance', 0)}
        >
          주문 총액
        </span>
        <div className='flex-center w-full'>
          <input
            type='range'
            min='0'
            max='100'
            className={classNames(
              'range range-xs tooltip',
              krwVolume > krwBalance ? 'range-error' : null
            )}
            value={balanceRange}
            onChange={onChangeRange('balance')}
          />
        </div>
      </div>
      <div className='form-control'>
        <label className='input-group input-group-sm'>
          <input
            type='number'
            placeholder='0.01'
            className='input input-bordered input-sm min-w-0 w-full'
            value={volume}
            onChange={onChangeNumberValue('volume')}
          />
          <span>{market.toUpperCase()?.replace(krwRegex, '')}</span>
        </label>
      </div>
      <div className='form-control'>
        <label className='input-group input-group-sm'>
          <input
            type='number'
            placeholder='0.01'
            className='input input-bordered input-sm min-w-0 w-full'
            value={krwVolume}
            onChange={onChangeNumberValue('krwVolume')}
          />
          <span>KRW</span>
        </label>
      </div>
    </div>
  );
};

interface OrderBtnPanel {
  onClickOrder: (orderType: OrderBtnType, side?: 'ask' | 'bid') => () => void;
}

const LimitOrderBtnPanel: FC<OrderBtnPanel> = ({ onClickOrder }) => {
  return (
    <div className='btn-group w-full [&>.btn]:flex-grow'>
      <button onClick={onClickOrder('reset')} className='btn btn-sm lg:btn-xs xl:btn-sm basis-1/5 '>
        <GrPowerReset />
      </button>
      <button
        key={'ORDER_MARKET_BID'}
        onClick={onClickOrder('limit', 'bid')}
        className='btn btn-sm lg:btn-xs xl:btn-sm basis-2/5 btn-order-bid'
      >
        지정가 매수
      </button>
      <button
        key={'ORDER_MARKET_ASK'}
        onClick={onClickOrder('limit', 'ask')}
        className='btn btn-sm lg:btn-xs xl:btn-sm basis-2/5 btn-order-ask'
      >
        지정가 매도
      </button>
    </div>
  );
};

const MarketOrderBtnPanel: FC<OrderBtnPanel> = ({ onClickOrder }) => {
  return (
    <div className='btn-group w-full [&>.btn]:flex-grow'>
      <button
        key={'ORDER_MARKET_BID'}
        onClick={onClickOrder('price', 'bid')}
        className='btn btn-sm lg:btn-xs xl:btn-sm basis-1/2 btn-order-bid'
      >
        시장사 매수
      </button>
      <button
        key={'ORDER_MARKET_ASK'}
        onClick={onClickOrder('market', 'ask')}
        className='btn btn-sm lg:btn-xs xl:btn-sm basis-1/2 btn-order-ask'
      >
        시장가 매도
      </button>
    </div>
  );
};

const OrderCancel = () => {
  const { upbitTradeMarket, setUpbitTradeMarket } = useSiteSettingStore(
    ({ upbitTradeMarket, setUpbitTradeMarket }) => ({
      upbitTradeMarket,
      setUpbitTradeMarket
    }),
    shallow
  );
  const {
    data: orders,
    error,
    mutate
  } = useSWR<Array<IUpbitGetOrderResponse>>(
    `${apiUrls.upbit.path}${apiUrls.upbit.orders}/DELETE`,
    async () => {
      return await useUpbitAuthStore.getState().getOrders({ market: upbitTradeMarket });
    },
    {
      refreshInterval: 60 * 1000
    }
  );

  if (error) {
    <div className='bg-base-200 flex-center p-5 text-center'>
      <div>
        <div>마켓 정보를 가져오는 중 에러가 발생했습니다.</div>
      </div>
    </div>;
  }

  if (!orders) {
    return (
      <div className='flex-center flex-col px-5 py-10 gap-2 text-center bg-base-200 animate-pulse'>
        <div className='animate-spin text-3xl'>
          <AiOutlineLoading3Quarters />
        </div>
        <div className='text-center'>
          <div>마켓 정보를 가져오는 중 입니다.</div>
        </div>
      </div>
    );
  }

  return <OrderCancelInner orders={orders} mutate={mutate} />;
};

interface OrderCancelInnerProps {
  orders: Array<IUpbitGetOrderResponse>;
  mutate: () => void;
}

const OrderCancelInner: FC<OrderCancelInnerProps> = ({ orders, mutate }) => {
  const handleClickCancelBtn = (uuid: string) => async () => {
    await useUpbitAuthStore
      .getState()
      .deleteOrder({ uuid })
      .then(() => {
        toast.success('주문을 취소하였습니다.');
        mutate();
      })
      .catch(() => {
        toast.error('주문을 취소하지 못 했습니다.');
      });
  };

  return (
    <div className='grid grid-cols-[1fr_1fr_1fr_2fr_auto] px-1 bg-base-300 text-xs whitespace-nowrap text-right [&>div]:border-b-[1px] [&>div]:border-zinc-800 [&>div]:p-1 max-h-80 overflow-y-auto'>
      <div className='flex-center text-zinc-500'>
        <div>주문시간</div>
      </div>
      <div className='text-center text-zinc-500'>
        <div>마켓</div>
        <div>구분</div>
      </div>
      <div className='text-zinc-500'>
        <div>감시가격</div>
        {/* <div>{order.watchPrice}</div> */}
        <div>주문가격</div>
      </div>
      <div className=' text-zinc-500'>
        <div>미체결량</div>
        <div>주문량</div>
      </div>
      <div className='flex-center text-zinc-500'>취소</div>
      {orders.map((order) => (
        <React.Fragment key={order.uuid}>
          <div className='text-zinc-500'>
            <div>{format(new Date(order.created_at), 'yyyy-MM-dd')}</div>
            <div>{format(new Date(order.created_at), 'HH:mm:ss')}</div>
          </div>
          <div className='text-center'>
            <div>
              <b>{order.market.replace('-', '/')}</b>
            </div>
            <div className={order.side}>
              <b>{order.side === 'bid' ? '매수' : order.side === 'ask' ? '매도' : order.side}</b>
            </div>
          </div>
          <div>
            <div>-</div>
            {/* <div>{order.watchPrice}</div> */}
            <div>{order.price}</div>
          </div>
          <div>
            <div>{Number(order.volume) - Number(order.executed_volume)}</div>
            <div>{order.volume}</div>
          </div>
          <div className='flex-center'>
            <button className='btn btn-xs' onClick={handleClickCancelBtn(order.uuid)}>
              취소
            </button>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
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
