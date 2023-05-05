import classNames from 'classnames';
import React, { FC, memo, useEffect, useRef, useState } from 'react';
import { AiFillLock, AiOutlineInfoCircle, AiOutlineLoading3Quarters } from 'react-icons/ai';
import { apiUrls } from 'src/lib/apiUrls';
import { useExchangeStore } from 'src/store/exchangeSockets';
import { useUpbitApiStore } from 'src/store/upbitApi';
import { IUpbitOrdersChance } from 'src/types/upbit';
import { krwRegex } from 'src/utils/regex';
import { delay, satoshiPad, upbitDecimalScale, upbitPadEnd } from 'src/utils/utils';
import useSWR from 'swr';
import shallow from 'zustand/shallow';
import { toast } from 'react-toastify';
import isEqual from 'react-fast-compare';
import { NumericFormat } from 'react-number-format';
import numeral from 'numeral';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';
import { useSiteSettingStore } from 'src/store/siteSetting';
import { IoMdRefresh } from 'react-icons/io';
import { throttle } from 'lodash';
import {
  NumericValueType,
  OrderSideType,
  OrderType,
  useUpbitOrderFormStore
} from 'src/store/upbitOrderForm';

export const UpbitOrderform = memo(() => {
  const isLogin = useUpbitApiStore((state) => state.isLogin, shallow);
  const [isPending, setPending] = useState(false);

  const handleClickRefreshButton = async () => {
    if (isPending) {
      toast.info('다시 불러오는 중 입니다.');
      return;
    }
    setPending(true);
    const { revalidateOrders, revalidateOrdersChance } = useUpbitApiStore.getState();
    await delay(50);
    await Promise.all([revalidateOrdersChance(), revalidateOrders()]).finally(() => {
      setTimeout(() => {
        setPending(false);
      }, 500);
    });
  };

  const [hidden, setHidden] = useState(false);
  const { orderType, changeOrderType } = useUpbitOrderFormStore(
    (state) => ({ orderType: state.orderType, changeOrderType: state.changeOrderType }),
    shallow
  );

  const handleClickOrdTypeBtn = (type: OrderType) => () => {
    changeOrderType(type);
  };

  return (
    <div className='h-full overflow-hidden bg-base-200'>
      <div
        className={classNames(
          'h-full flex flex-col scrollbar-hidden flex-grow-0 flex-shrink-0',
          !hidden ? 'overflow-y-auto' : null
        )}
      >
        <div className='btn-group w-full [&>.btn]:grow gap-0.5'>
          <button
            onClick={handleClickOrdTypeBtn('limit')}
            className={classNames(
              'btn btn-xs btn-ghost gap-x-1',
              orderType === 'limit' ? 'btn-active' : null
            )}
          >
            <span>지정가</span>
            <div className='dropdown dropdown-hover dropdown-start'>
              <AiOutlineInfoCircle className='text-zinc-600' />
              <div className='dropdown-content bg-accent text-sm p-2 w-40'>
                <div>호가에 수량을 설정해서 주문을 넣습니다.</div>
              </div>
            </div>
          </button>
          <button
            onClick={handleClickOrdTypeBtn('market')}
            className={classNames(
              'btn btn-xs btn-ghost gap-x-1',
              orderType === 'price' || orderType === 'market' ? 'btn-active ' : null
            )}
          >
            <span>시장가</span>
            <div className='dropdown dropdown-hover dropdown-end'>
              <AiOutlineInfoCircle className='text-zinc-600' />
              <div className='dropdown-content bg-accent text-sm p-2 w-40'>
                <div>현재 호가에 설정한 수량만큼 주문을 넣습니다.</div>
              </div>
            </div>
          </button>
          {/* {process.env.NODE_ENV !== 'production' && (
            <button
              onClick={handleClickOrdTypeBtn('spider')}
              className={classNames(
                'btn btn-xs btn-ghost gap-x-1',
                ordType === 'spider' ? 'btn-active' : null
              )}
            >
              <span>거미줄</span>
              <div className='dropdown dropdown-hover dropdown-end'>
                <AiOutlineInfoCircle className='text-zinc-600' />
                <div className='dropdown-content bg-accent text-sm p-2 w-40'>
                  <div>설정한 호가부터 반복해서 주문을 넣습니다.</div>
                </div>
              </div>
            </button>
          )} */}
          {isLogin && (
            <button
              onClick={handleClickRefreshButton}
              className={classNames(
                'tooltip tooltip-left btn btn-xs btn-ghost !grow-0 shrink-0 px-1.5',
                isPending ? 'btn-disabled' : ''
              )}
              data-tip='잔고를 다시 불러옵니다.'
            >
              <IoMdRefresh className={isPending ? 'animate-spin' : ''} />
            </button>
          )}
          <button
            onClick={() => setHidden((p) => !p)}
            className={'btn btn-xs btn-ghost !grow-0 shrink-0 px-1.5'}
          >
            {hidden ? <RiArrowDownSLine /> : <RiArrowUpSLine />}
          </button>
        </div>
        {!hidden ? (
          !isLogin ? (
            <div className='flex-center p-5 h-full text-center'>
              <div>
                <div>
                  매수/매도 주문을 이용하려면 오른쪽 상단에서 업비트 API Key를 등록해주세요.
                </div>
              </div>
            </div>
          ) : (
            <TradeContainer />
          )
        ) : null}
      </div>
    </div>
  );
}, isEqual);

UpbitOrderform.displayName = 'UpbitOrderform';

interface UpbitTradeValues {
  identifier?: string;
}

const TradeContainer: React.FC = () => {
  const { upbitTradeMarket, ordersChance } = useUpbitApiStore(
    ({ upbitTradeMarket, ordersChance }) => ({
      upbitTradeMarket,
      ordersChance
    }),
    shallow
  );

  useEffect(() => {
    const MARKET_CODE = ordersChance?.market.id;
    if (!MARKET_CODE) {
      return;
    }
    //! 가격 받아와서 적용
    const currentPrice = useExchangeStore.getState()?.upbitMarketDatas?.[MARKET_CODE]?.tp;

    if (currentPrice) {
      useUpbitOrderFormStore.setState({
        ask: {
          balanceRange: 0,
          priceRange: 0,
          volume: 0,
          krwVolume: 0,
          price: currentPrice
        },
        bid: {
          balanceRange: 0,
          priceRange: 0,
          volume: 0,
          krwVolume: 0,
          price: currentPrice
        }
      });
      return;
    }

    //! 최초 가격 설정때는 data가 없으니 구독 방식으로 가격이 오면 설정
    const unsubscribe = useExchangeStore.subscribe((state) => {
      const currentPrice = state.upbitMarketDatas?.[MARKET_CODE]?.tp || 0;

      if (currentPrice) {
        unsubscribe();
        useUpbitOrderFormStore.setState({
          ask: {
            balanceRange: 0,
            priceRange: 0,
            volume: 0,
            krwVolume: 0,
            price: currentPrice
          },
          bid: {
            balanceRange: 0,
            priceRange: 0,
            volume: 0,
            krwVolume: 0,
            price: currentPrice
          }
        });
      }
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [ordersChance?.market.id]);

  const { error } = useSWR(
    `${apiUrls.upbit.path}${apiUrls.upbit.ordersChance}?market=${upbitTradeMarket}`,
    async () => {
      const { getOrdersChance } = useUpbitApiStore.getState();
      const ordersChance = await getOrdersChance(upbitTradeMarket);

      useUpbitApiStore.setState({
        ordersChance
      });
    },
    {
      refreshInterval: 60 * 1000
    }
  );

  if (error) {
    return (
      <div className='flex-center p-5 text-center'>
        <div>마켓 정보를 가져오는 중 에러가 발생했습니다.</div>
      </div>
    );
  }

  if (!ordersChance) {
    return (
      <div className='flex-center h-full flex-col px-5 py-10 gap-2 text-center bg-base-200 animate-pulse'>
        <div className='animate-spin text-3xl'>
          <AiOutlineLoading3Quarters />
        </div>
        <div className='text-center'>
          <div>마켓 정보를 가져오는 중 입니다.</div>
        </div>
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col py-1 px-2 bg-base-300/50'>
      <div className='flex grow flex-wrap gap-y-5 sm:gap-y-0 sm:flex-nowrap sm:gap-x-6 sm:justify-evenly lg:justify-center lg:gap-x-10 lg:px-5 [&>div]:basis-full [&>div]:shrink-0 [&>div]:grow sm:[&>div]:basis-64 sm:[&>div]:max-w-sm'>
        <TradeInner side={'bid'} ordersChance={ordersChance} />
        <TradeInner side={'ask'} ordersChance={ordersChance} />
      </div>
    </div>
  );
};

interface TradeInnerProps {
  side: OrderSideType;
  ordersChance: IUpbitOrdersChance;
}

const TradeInner: FC<TradeInnerProps> = ({ side, ordersChance }) => {
  const krwBalance = Number(ordersChance.bid_account.balance);
  const orderType = useUpbitOrderFormStore((state) => state.orderType, shallow);
  const priceRef = useRef<HTMLDivElement>(null);
  const highlight = useSiteSettingStore(({ highlight }) => highlight);

  useEffect(() => {
    if (!priceRef?.current || (orderType !== 'price' && orderType !== 'market')) {
      return;
    }

    const node = priceRef.current;
    const callback: MutationCallback = (e) => {
      if (!highlight) {
        return;
      }

      for (const mutationNode of e) {
        mutationNode.target.parentElement?.classList.remove('highlight');
        // animation 초기화
        void mutationNode.target.parentElement?.offsetWidth;
        // animation 초기화
        mutationNode.target.parentElement?.classList.add('highlight');
      }
    };
    const config: MutationObserverInit = {
      subtree: true,
      characterData: true
    };
    const observer = new MutationObserver(callback);

    observer.observe(node, config);

    return () => {
      observer.disconnect();
    };
  }, [highlight, orderType, priceRef]);

  return (
    <div className='flex flex-col py-1'>
      {(orderType === 'price' || orderType === 'market') && (
        <div className='flex justify-between items-center mb-2'>
          <div className='text-sm'>{sideText[side === 'ask' ? 'bid' : 'ask']} 호가</div>
          <div className='font-mono'>
            <div className='inline-flex items-center' ref={priceRef}>
              <CurrentTradePricePanel side={side} />
            </div>
            <span className='text-xs self-end font-mono'>&nbsp;KRW</span>
          </div>
        </div>
      )}
      <div className='flex justify-between items-center'>
        <span className='text-sm font-sans'>사용 가능</span>
        <span className='text-right font-mono'>
          {side === 'bid'
            ? Math.floor(krwBalance || 0).toLocaleString()
            : satoshiPad(Number(ordersChance?.ask_account?.balance) || 0)}
          <span className='text-xs'>
            &nbsp;
            {side === 'bid' ? ordersChance.bid_account.currency : ordersChance.ask_account.currency}
          </span>
        </span>
      </div>
      <OrderPanel ordersChance={ordersChance} side={side} orderType={orderType} />
    </div>
  );
};

interface UpbitInputForm {
  volume: number;
  krwVolume: number;
  price: number;
}

interface OrderPanelProps {
  side: OrderSideType;
  orderType: OrderType;
  ordersChance: IUpbitOrdersChance;
}

const ordTypeText = {
  limit: '지정가',
  market: '시장가',
  price: '시장가',
  spider: '거미줄'
} as const;
const sideText = {
  ask: '매도',
  bid: '매수',
  ASK: '매도',
  BID: '매수'
} as const;

const OrderPanel: FC<OrderPanelProps> = ({ side, orderType, ordersChance }) => {
  return (
    <div className='h-full flex flex-col gap-y-2'>
      {orderType === 'limit' && (
        <>
          <LimitOrderPanel side={side} />
          <OrderVolumePanel ordersChance={ordersChance} side={side} />
        </>
      )}
      {(orderType === 'market' || orderType === 'price') && (
        <MarketOrderPanel ordersChance={ordersChance} side={side} />
      )}
      <div className='mt-auto'>
        <OrderBtnPanel ordersChance={ordersChance} side={side} />
      </div>
    </div>
  );
};

interface LimitOrderPanelProps {
  side: OrderSideType;
}

const LimitOrderPanel: FC<LimitOrderPanelProps> = ({ side }) => {
  const { values, changeRange, changeNumericValue } = useUpbitOrderFormStore(
    (state) => ({
      values: state[side],
      changeRange: state.changeRange,
      changeNumericValue: state.changeNumericValue
    }),
    shallow
  );
  const { price, priceRange } = values;

  const handleClickResetButton = () => {
    changeRange('price', side, 0);
  };

  const handleChangeRange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(evt.target.value) || 0;
    changeRange('price', side, value);
  };

  const handleChangeNumericValue = (evt: React.ChangeEvent<HTMLInputElement>) => {
    changeNumericValue('price', side, evt.target.value);
  };

  return (
    <div className='select-none'>
      <div className='mb-1 flex-center gap-x-2 text-sm'>
        <span className='whitespace-nowrap cursor-pointer' onClick={handleClickResetButton}>
          주문 가격
        </span>
        <div
          className='flex-center w-full tooltip'
          data-tip={`현재가 대비 ${numeral(priceRange).format(`0,0.00`)}%`}
        >
          <input
            type='range'
            min='-50'
            max='50'
            step={0.01}
            className='range range-sm'
            value={priceRange}
            onChange={handleChangeRange}
          />
        </div>
      </div>
      <div className='form-control font-mono'>
        <label className='input-group input-group-sm'>
          <NumericFormat
            type='text'
            inputMode='decimal'
            className='input input-bordered input-sm min-w-0 w-full'
            value={price}
            onChange={handleChangeNumericValue}
            placeholder={`주문 호가(KRW)`}
            decimalScale={upbitDecimalScale(price)}
            thousandSeparator=','
            allowLeadingZeros
            maxLength={Number.MAX_SAFE_INTEGER.toLocaleString().length}
          />
          <span>KRW</span>
        </label>
      </div>
    </div>
  );
};

interface OrderVolumePanelProps {
  ordersChance: IUpbitOrdersChance;
  side: OrderSideType;
}

const OrderVolumePanel: FC<OrderVolumePanelProps> = ({ ordersChance, side }) => {
  const { values, orderType, changeRange, changeNumericValue } = useUpbitOrderFormStore(
    (state) => ({
      orderType: state.orderType,
      values: state[side],
      changeRange: state.changeRange,
      changeNumericValue: state.changeNumericValue
    }),
    shallow
  );
  const ORDER_FEE = Number(ordersChance[`${side}_fee`]);
  const market = ordersChance.market.id;
  const krwBalance = ordersChance.bid_account.balance;
  const krwVolumeIsHigherThanMaximum = values.krwVolume > Number(ordersChance.market.max_total);
  const krwVolumeIsLowerThanMinimum =
    values.krwVolume < Number(ordersChance.market[side].min_total);
  const { balanceRange } = values;

  const handleClickResetButton = () => {
    changeRange('balance', side, 0);
  };

  const handleChangeRange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(evt.target.value) || 0;
    changeRange('balance', side, value);
  };

  const handleChangeNumericValue =
    (valueKey: NumericValueType) => (evt: React.ChangeEvent<HTMLInputElement>) => {
      changeNumericValue(valueKey, side, evt.target.value);
    };

  // - limit : 지정가 주문
  // - price : 시장가 주문(매수)
  // - market : 시장가 주문(매도)
  switch (orderType) {
    case 'market':
    case 'price':
    case 'limit': {
      return (
        <div>
          <div className='mb-1 flex-center gap-x-2 text-sm '>
            <span className='whitespace-nowrap cursor-pointer' onClick={handleClickResetButton}>
              주문 총액
            </span>
            <div
              className='flex-center w-full tooltip'
              data-tip={`잔고 대비 주문 비율 ${balanceRange.toLocaleString()}%`}
            >
              <input
                type='range'
                min='0'
                max='100'
                className={classNames(
                  'range range-sm',
                  side === 'bid' && values.krwVolume > Number(krwBalance) ? 'range-error' : null
                )}
                value={balanceRange}
                onChange={handleChangeRange}
              />
            </div>
          </div>
          <div className='form-control font-mono'>
            <label className='input-group input-group-sm'>
              <NumericFormat
                type='text'
                inputMode='decimal'
                className='input input-bordered input-sm min-w-0 w-full'
                value={values.volume}
                onChange={handleChangeNumericValue('volume')}
                placeholder={`주문 수량(${market.toUpperCase()?.replace(krwRegex, '')})`}
                decimalScale={8}
                thousandSeparator=','
                allowLeadingZeros
                maxLength={Number.MAX_SAFE_INTEGER.toLocaleString().length}
              />
              <span>{market.toUpperCase()?.replace(krwRegex, '')}</span>
            </label>
          </div>
          <div className='form-control font-mono'>
            <label className='input-group input-group-sm'>
              <NumericFormat
                type='text'
                inputMode='numeric'
                className='input input-bordered input-sm min-w-0 w-full'
                value={values.krwVolume}
                onChange={handleChangeNumericValue('krwVolume')}
                placeholder='주문 총액(KRW)'
                decimalScale={0}
                thousandSeparator=','
                allowLeadingZeros
                maxLength={Number.MAX_SAFE_INTEGER.toLocaleString().length}
              />
              <span>KRW</span>
            </label>
            <div
              className={classNames(
                'text-left text-xs',
                krwVolumeIsHigherThanMaximum || krwVolumeIsLowerThanMinimum
                  ? 'text-error-content'
                  : 'text-info-content'
              )}
            >
              {values.krwVolume > 0 ? (
                krwVolumeIsHigherThanMaximum ? (
                  `최대 주문은 ${Number(ordersChance.market.max_total).toLocaleString()}원입니다.`
                ) : krwVolumeIsLowerThanMinimum ? (
                  `최소 주문은 ${Number(
                    ordersChance.market[side].min_total
                  ).toLocaleString()}원입니다.`
                ) : side === 'ask' ? (
                  <span>
                    업비트 매매수수료는&nbsp;
                    <b>{satoshiPad(values.volume * ORDER_FEE, '[00000000]')}</b>
                    {ordersChance.ask_account.currency} 입니다.
                  </span>
                ) : (
                  <span>
                    업비트 매매수수료는&nbsp;
                    <b>{numeral(values.krwVolume * ORDER_FEE).format('0,0[.][00]')}</b>원 입니다.
                  </span>
                )
              ) : null}
            </div>
          </div>
        </div>
      );
    }
    default: {
      return <div></div>;
    }
  }
};

const MarketOrderPanel: FC<OrderVolumePanelProps> = ({ ordersChance, side }) => {
  const orderbook = useExchangeStore(({ upbitOrderbook }) => {
    return {
      askPrice: upbitOrderbook?.obu?.[0]?.ap ?? null,
      bidPrice: upbitOrderbook?.obu?.[0]?.bp ?? null
    };
  }, shallow);
  const ORDER_FEE = Number(ordersChance[`${side}_fee`]);

  const { values, changeRange, changeNumericValue } = useUpbitOrderFormStore(
    (state) => ({
      values: state[side],
      changeRange: state.changeRange,
      changeNumericValue: state.changeNumericValue
    }),
    shallow
  );
  const { balanceRange } = values;

  if (!orderbook.askPrice || !orderbook.bidPrice) {
    return <>시장가 데이터를 불러오는 중 입니다.</>;
  }
  const market = ordersChance.market.id;
  const krwBalance = ordersChance.bid_account.balance;

  const handleClickResetButton = () => {
    changeRange('balance', side, 0);
  };

  const handleChangeRange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(evt.target.value) || 0;
    changeRange('balance', side, value);
  };

  const handleChangeNumericValue =
    (valueKey: NumericValueType) => (evt: React.ChangeEvent<HTMLInputElement>) => {
      changeNumericValue(valueKey, side, evt.target.value);
    };

  switch (side) {
    case 'bid': {
      const krwVolumeIsHigherThanMaximum = values.krwVolume > Number(ordersChance.market.max_total);
      const krwVolumeIsLowerThanMinimum =
        values.krwVolume < Number(ordersChance.market[side].min_total);
      return (
        <div>
          <div className='mb-1 flex-center gap-x-2 text-sm '>
            <span className='whitespace-nowrap cursor-pointer' onClick={handleClickResetButton}>
              주문 총액
            </span>
            <div
              className='flex-center w-full tooltip'
              data-tip={`잔고 대비 주문 비율 ${balanceRange.toLocaleString()}%`}
            >
              <input
                type='range'
                min='0'
                max='100'
                className={classNames(
                  'range range-sm',
                  side === 'bid' && values.krwVolume > Number(krwBalance) ? 'range-error' : null
                )}
                value={balanceRange}
                onChange={handleChangeRange}
              />
            </div>
          </div>
          <div className='form-control'>
            <label className='input-group input-group-sm'>
              <NumericFormat
                type='text'
                inputMode='numeric'
                className='input input-bordered input-sm min-w-0 w-full'
                value={values.krwVolume}
                onChange={handleChangeNumericValue('krwVolume')}
                placeholder='주문 총액(KRW)'
                decimalScale={0}
                thousandSeparator=','
                allowLeadingZeros
                maxLength={Number.MAX_SAFE_INTEGER.toLocaleString().length}
              />
              <span>KRW</span>
            </label>
            <div className='text-left text-xs'>
              {values.krwVolume > 0 ? (
                krwVolumeIsHigherThanMaximum ? (
                  <span className='text-error-content'>{`최대 주문은 ${Number(
                    ordersChance.market.max_total
                  ).toLocaleString()}원입니다.`}</span>
                ) : krwVolumeIsLowerThanMinimum ? (
                  <span className='text-error-content'>
                    {`최소 주문은 ${Number(ordersChance.market[side].min_total).toLocaleString()}
                  원입니다.`}
                  </span>
                ) : (
                  <div>
                    <div>
                      <span>
                        {`≈ ${numeral(values.krwVolume / orderbook.askPrice).format(
                          '0,0[.][00000000]'
                        )}${ordersChance.ask_account.currency}`}
                      </span>
                    </div>
                    <div className='text-info-content'>
                      업비트 매매수수료&nbsp;
                      <b>
                        {satoshiPad(values.volume * ORDER_FEE, '[00000000]')}
                        {ordersChance.ask_account.currency}
                      </b>
                      &nbsp;포함
                    </div>
                  </div>
                )
              ) : null}
            </div>
          </div>
        </div>
      );
    }
    case 'ask': {
      const volumeIsHigherThanMaximum =
        values.volume * orderbook.askPrice > Number(ordersChance.market.max_total);
      const volumeIsLowerThanMinimum =
        values.volume * orderbook.askPrice < Number(ordersChance.market[side].min_total);
      return (
        <div>
          <div className='mb-1 flex-center gap-x-2 text-sm '>
            <span className='whitespace-nowrap cursor-pointer' onClick={handleClickResetButton}>
              주문 총액
            </span>
            <div
              className='flex-center w-full tooltip'
              data-tip={`잔고 대비 주문 비율 ${balanceRange.toLocaleString()}%`}
            >
              <input
                type='range'
                min='0'
                max='100'
                className={classNames(
                  'range range-sm',
                  values.krwVolume > Number(krwBalance) ? 'range-error' : null
                )}
                value={balanceRange}
                onChange={handleChangeRange}
              />
            </div>
          </div>
          <div className='form-control font-mono'>
            <label className='input-group input-group-sm'>
              <NumericFormat
                type='text'
                inputMode='decimal'
                className='input input-bordered input-sm min-w-0 w-full'
                value={values.volume}
                onChange={handleChangeNumericValue('volume')}
                placeholder={`주문 수량(${market.toUpperCase()?.replace(krwRegex, '')})`}
                decimalScale={8}
                thousandSeparator=','
                allowLeadingZeros
                maxLength={Number.MAX_SAFE_INTEGER.toLocaleString().length}
              />
              <span>{market.toUpperCase()?.replace(krwRegex, '')}</span>
            </label>
            <div className='text-left text-xs'>
              {values.krwVolume > 0 ? (
                volumeIsHigherThanMaximum ? (
                  <span className='text-error-content'>{`최대 주문은 ${Number(
                    ordersChance.market.max_total
                  ).toLocaleString()}원입니다.`}</span>
                ) : volumeIsLowerThanMinimum ? (
                  <span className='text-error-content'>
                    {`최소 주문은 ${Number(ordersChance.market[side].min_total).toLocaleString()}
                  원입니다.`}
                  </span>
                ) : (
                  <div>
                    <div>
                      <span>
                        {`≈ ${numeral(values.volume * orderbook.bidPrice).format('0,0[.][00]')}${
                          ordersChance.bid_account.currency
                        }`}
                      </span>
                    </div>
                    <div className='text-info-content'>
                      업비트 매매수수료&nbsp;
                      <b>
                        {numeral(values.volume * orderbook.bidPrice * ORDER_FEE).format(
                          '0,0[.][00]'
                        )}
                      </b>
                      원 포함
                    </div>
                  </div>
                )
              ) : null}
            </div>
          </div>
        </div>
      );
    }
    default: {
      return null;
    }
  }
};

interface OrderBtnPanelProps {
  ordersChance: IUpbitOrdersChance;
  side: OrderSideType;
}

const OrderBtnPanel: FC<OrderBtnPanelProps> = ({ ordersChance, side }) => {
  const krwBalance = Number(ordersChance.bid_account.balance);
  const coinBalance = Number(ordersChance.ask_account.balance);
  const ORDER_FEE = Number(ordersChance[`${side}_fee`]);
  const isShortBalance =
    (side === 'bid' && krwBalance < 5000 * (1 + ORDER_FEE)) ||
    (side === 'ask' && coinBalance === 0);

  const { orderType, createOrder } = useUpbitOrderFormStore(
    (state) => ({
      orderType: state.orderType,
      createOrder: state.createOrder
    }),
    shallow
  );

  const handleClickButton = async () => {
    await createOrder(side);
  };

  return (
    <button
      key={`ORDER_MARKET_${side}`}
      onClick={handleClickButton}
      className={classNames(
        `btn btn-sm w-full`,
        isShortBalance ? 'btn-disabled bg-neutral' : `btn-order-${side}`
      )}
    >
      {isShortBalance ? (
        <div className='flex-center gap-x-1'>
          <AiFillLock />
          <span>{sideText[side]} 잔고가 부족합니다.</span>
        </div>
      ) : (
        `${ordTypeText[orderType]} ${sideText[side]}`
      )}
    </button>
  );
};

interface CurrentTradePricePanelProps {
  side: OrderSideType;
}

const CurrentTradePricePanel: FC<CurrentTradePricePanelProps> = ({ side }) => {
  const { askPrice, bidPrice } = useExchangeStore(({ upbitOrderbook }) => {
    return {
      askPrice: upbitOrderbook?.obu?.[0]?.ap ?? null,
      bidPrice: upbitOrderbook?.obu?.[0]?.bp ?? null
    };
  }, shallow);

  return <span>{upbitPadEnd((side === 'bid' ? askPrice : bidPrice) || 0) || '오류'}</span>;
};
