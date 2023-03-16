import classNames from 'classnames';
import React, { FC, memo, useEffect, useRef, useState } from 'react';
import { AiFillLock, AiOutlineInfoCircle, AiOutlineLoading3Quarters } from 'react-icons/ai';
import { apiUrls } from 'src/lib/apiUrls';
import { useExchangeStore } from 'src/store/exchangeSockets';
import { useUpbitApiStore } from 'src/store/upbitApi';
import { IUpbitOrdersChance } from 'src/types/upbit';
import { krwRegex } from 'src/utils/regex';
import {
  percentageCalculator,
  percentRatio,
  priceCorrection,
  satoshiPad,
  upbitDecimalScale,
  upbitPadEnd
} from 'src/utils/utils';
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

export const UpbitOrderform = memo(() => {
  const isLogin = useUpbitApiStore((state) => state.isLogin, shallow);
  const [isPending, setPending] = useState(false);

  const handleClickRefreshButton = throttle(async () => {
    if (isPending) {
      toast.info('다시 불러오는 중 입니다.');
      return;
    }
    setPending(true);
    const { upbitTradeMarket, getOrders, getOrdersChance } = useUpbitApiStore.getState();
    await Promise.all([
      getOrdersChance(upbitTradeMarket),
      getOrders({ market: upbitTradeMarket })
    ]).finally(() => {
      setTimeout(() => {
        setPending(false);
      }, 1000);
    });
  }, 500);

  const [ordType, setOrdType] = useState<UpbitTradeValues['ord_type']>('limit');
  const [hidden, setHidden] = useState(false);

  const handleClickOrdTypeBtn = (type: UpbitTradeValues['ord_type']) => () => {
    setOrdType(type);
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
              ordType === 'limit' ? 'btn-active' : null
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
              ordType === 'price' || ordType === 'market' ? 'btn-active ' : null
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
          <button
            onClick={handleClickRefreshButton}
            className={classNames(
              'tooltip tooltip-left btn btn-xs btn-ghost !grow-0 shrink-0 px-1.5',
              isPending ? 'btn-disabled' : ''
            )}
            data-tip='잔고를 다시 불러옵니다.'
          >
            <IoMdRefresh />
          </button>
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
                  업비트 API 거래 기능을 이용하시려면 오른쪽 상단에서 업비트 API Key를 등록해주세요.
                </div>
              </div>
            </div>
          ) : (
            <TradeContainer ordType={ordType} />
          )
        ) : null}
      </div>
    </div>
  );
}, isEqual);

UpbitOrderform.displayName = 'UpbitOrderform';

type RangeType = 'balance' | 'price';
interface UpbitTradeValues {
  market: string;
  side: 'bid' | 'ask';
  volume: string; // NumberString
  price: string; // NumberString
  ord_type: 'limit' | 'price' | 'market' | 'spider';
  identifier?: string;
  krwVolume: string;
}

type OrderBtnType = UpbitTradeValues['ord_type'] | 'reset';

interface DefaultPanelProp {
  onChangeRange: (
    rangeType: RangeType,
    side: UpbitTradeValues['side']
  ) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClickResetButton: (
    rangeType: RangeType,
    percentage: number,
    side: UpbitTradeValues['side']
  ) => () => void;
  onChangeNumericValue: (
    key: keyof UpbitTradeValues,
    side: UpbitTradeValues['side']
  ) => (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface TradeContainerProps {
  ordType: UpbitTradeValues['ord_type'];
}

const TradeContainer: FC<TradeContainerProps> = ({ ordType }) => {
  const { upbitTradeMarket, ordersChance } = useUpbitApiStore(
    ({ upbitTradeMarket, ordersChance }) => ({
      upbitTradeMarket,
      ordersChance
    }),
    shallow
  );
  const { error } = useSWR(
    `${apiUrls.upbit.path}${apiUrls.upbit.ordersChance}?market=${upbitTradeMarket}`,
    async () => {
      await useUpbitApiStore.getState().getOrdersChance(upbitTradeMarket);
    },
    {
      refreshInterval: 60 * 1000
    }
  );

  if (error) {
    return (
      <div className='bg-base-200 flex-center p-5 text-center'>
        <div>
          <div>마켓 정보를 가져오는 중 에러가 발생했습니다.</div>
        </div>
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

  return <Trade orderChance={ordersChance} ordType={ordType} />;
};

interface TradeProps {
  ordType: UpbitTradeValues['ord_type'];
  orderChance: IUpbitOrdersChance;
}

const Trade: FC<TradeProps> = ({ orderChance, ordType }) => {
  const { upbitTradeMarket, setUpbitTradeMarket } = useUpbitApiStore(
    ({ upbitTradeMarket, setUpbitTradeMarket }) => ({
      upbitTradeMarket,
      setUpbitTradeMarket
    }),
    shallow
  );
  // const upbitMarkets = useExchangeStore((state) => state.upbitMarkets, shallow);

  const { error, mutate: mutateChance } = useSWR(
    `${apiUrls.upbit.path}${apiUrls.upbit.ordersChance}?market=${upbitTradeMarket}`,
    async () => {
      await Promise.all([
        useUpbitApiStore.getState().getOrdersChance(upbitTradeMarket),
        useUpbitApiStore.getState().getOrders({ market: upbitTradeMarket })
      ]);
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

  if (!orderChance) {
    return (
      <div className='flex-center flex-col px-5 py-10 gap-2 text-center animate-pulse'>
        <div className='animate-spin text-3xl'>
          <AiOutlineLoading3Quarters />
        </div>
        <div className='text-center'>
          <div>마켓 정보를 가져오는 중 입니다.</div>
        </div>
      </div>
    );
  }

  // const handleChangeMarket = (event: React.ChangeEvent<HTMLSelectElement>) => {
  //   const newMarket = event.target.value;
  //   setUpbitTradeMarket(newMarket);
  //   useExchangeStore.getState().changedOrderbookCode();
  // };

  return (
    <div className='h-full flex flex-col py-1 px-2 bg-base-300/50'>
      {/* <div className='flex-center'>
        <div className='form-control bg-base-200'>
          <label className='input-group overflow-hidden'>
            <select
              placeholder='코인 선택'
              className='select select-ghost select-xs flex-grow min-w-[200px] w-full'
              value={upbitTradeMarket}
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
      </div> */}
      <div className='flex grow flex-wrap gap-y-5 sm:gap-y-0 sm:flex-nowrap sm:gap-x-6 sm:justify-evenly lg:justify-center lg:gap-x-10 lg:px-5 [&>div]:basis-full [&>div]:shrink-0 [&>div]:grow sm:[&>div]:basis-64 sm:[&>div]:max-w-sm'>
        <TradeInner
          ord_type={ordType}
          side={'bid'}
          orderChance={orderChance}
          mutateChance={mutateChance}
        />
        <TradeInner
          ord_type={ordType}
          side={'ask'}
          orderChance={orderChance}
          mutateChance={mutateChance}
        />
      </div>
    </div>
  );
};

interface TradeInnerProps {
  side: UpbitTradeValues['side'];
  ord_type: UpbitTradeValues['ord_type'];
  orderChance: IUpbitOrdersChance;
  mutateChance: () => void;
}

const TradeInner: FC<TradeInnerProps> = ({ ord_type, side, orderChance, mutateChance }) => {
  const krwBalance = Number(orderChance.bid_account.balance);

  const priceRef = useRef<HTMLDivElement>(null);
  const highlight = useSiteSettingStore(({ highlight }) => highlight);

  useEffect(() => {
    if (!priceRef?.current || (ord_type !== 'price' && ord_type !== 'market')) {
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
  }, [highlight, ord_type, priceRef]);

  return (
    <div className='flex flex-col py-1'>
      {(ord_type === 'price' || ord_type === 'market') && (
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
            : satoshiPad(Number(orderChance?.ask_account?.balance) || 0)}
          <span className='text-xs'>
            &nbsp;
            {side === 'bid' ? orderChance.bid_account.currency : orderChance.ask_account.currency}
          </span>
        </span>
      </div>
      <OrderPanel
        orderChance={orderChance}
        side={side}
        ord_type={ord_type}
        mutateChance={mutateChance}
      />
    </div>
  );
};

interface UpbitInputForm {
  volume: number;
  krwVolume: number;
  price: number;
}

interface OrderPanelProps {
  side: UpbitTradeValues['side'];
  ord_type: UpbitTradeValues['ord_type'];
  orderChance: IUpbitOrdersChance;
  mutateChance: () => void;
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

const OrderPanel: FC<OrderPanelProps> = ({ side, ord_type, orderChance, mutateChance }) => {
  const marketCode = orderChance.market.id;
  // const krwBalance = Math.floor(Number(orderChance.bid_account.balance)) || 0;
  // const coinBalance = orderChance.ask_account.balance;
  const [balanceRange, setBalanceRange] = useState(0);
  const [priceRange, setPriceRange] = useState(0);
  const [values, setValues] = useState<UpbitInputForm>({
    volume: 0,
    krwVolume: 0,
    price: useExchangeStore.getState()?.upbitMarketDatas?.[marketCode]?.tp || 1
  });

  const handleChangeNumericValue =
    (key: keyof UpbitTradeValues, side: UpbitTradeValues['side']) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      let { volume, krwVolume, price } = values;
      // const value = event.target.value?.replaceAll('[^0-9.,e+-]', '');
      const value = event.target.value?.replaceAll(',', '');
      const numberValue = Number(value);
      const ORDER_FEE = Number(orderChance[`${side}_fee`]);
      // const BALANCE = Number(orderChance[`${side}_account`].balance);
      const BALANCE = Number(side === 'ask' ? '0.1' : orderChance[`${side}_account`].balance);

      switch (ord_type) {
        case 'price':
        case 'market': {
          switch (side) {
            case 'ask': {
              const currentPrice = useExchangeStore.getState()?.upbitOrderbook?.obu?.[0]?.bp;
              price = currentPrice ?? price;
              setPriceRange(0);
              break;
            }
            case 'bid': {
              const currentPrice = useExchangeStore.getState()?.upbitOrderbook?.obu?.[0]?.ap;
              price = currentPrice ?? price;
              setPriceRange(0);
              break;
            }
          }
          break;
        }
      }

      switch (side) {
        case 'bid': {
          switch (key) {
            case 'price': {
              price = Number(numberValue.toFixed(upbitDecimalScale(numberValue)));
              krwVolume = Math.round(volume * price);

              const newBalanceRange = Math.round((krwVolume / BALANCE) * 100);
              setBalanceRange(newBalanceRange);
              break;
            }
            case 'volume': {
              volume = numberValue;
              krwVolume = Math.round(volume * price * (1 + ORDER_FEE));
              setBalanceRange(Math.round((krwVolume / BALANCE) * 100));
              break;
            }
            case 'krwVolume': {
              krwVolume = numberValue;
              volume =
                Number(
                  numeral((krwVolume * (1 - ORDER_FEE)) / price).format(`0.[00000000]`, Math.floor)
                ) || 0;

              setBalanceRange(Math.round((krwVolume / BALANCE) * 100));
              break;
            }
          }
          break;
        }
        case 'ask': {
          switch (key) {
            case 'price': {
              price = Number(numberValue.toFixed(upbitDecimalScale(numberValue)));
              krwVolume = Math.round(volume * price);

              const newBalanceRange = Math.round((krwVolume / BALANCE) * 100);
              setBalanceRange(newBalanceRange);
              break;
            }
            case 'volume': {
              volume = numberValue;
              krwVolume = Math.round(volume * price * (1 + ORDER_FEE));
              setBalanceRange(Math.round((krwVolume / BALANCE) * 100));
              break;
            }
            case 'krwVolume': {
              krwVolume = numberValue;
              volume = Number(numeral(krwVolume / price).format(`0.[00000000]`, Math.round)) || 0;

              setBalanceRange(Math.round((krwVolume / BALANCE) * 100));
              break;
            }
          }
          break;
        }
      }
      setValues({ ...values, price, volume, krwVolume });
    };

  const changeRange = (
    rangeType: RangeType,
    percentage: number,
    side: UpbitTradeValues['side']
  ) => {
    let { volume, krwVolume, price } = values;
    const ORDER_FEE = Number(orderChance[`${side}_fee`]);
    const BALANCE = Number(orderChance[`${side}_account`].balance);

    switch (ord_type) {
      case 'price':
      case 'market': {
        switch (side) {
          case 'ask': {
            const currentPrice = useExchangeStore.getState()?.upbitOrderbook?.obu?.[0]?.bp;
            price = currentPrice ?? price;
            setPriceRange(0);
            break;
          }
          case 'bid': {
            const currentPrice = useExchangeStore.getState()?.upbitOrderbook?.obu?.[0]?.ap;
            price = currentPrice ?? price;
            setPriceRange(0);
            break;
          }
        }
        break;
      }
      case 'limit': {
        if (rangeType === 'price') {
          const currentTradePrice = useExchangeStore.getState()?.upbitMarketDatas?.[marketCode]?.tp;
          price = priceCorrection(percentageCalculator(currentTradePrice, percentage));
        }
        break;
      }
    }

    switch (side) {
      case 'bid': {
        switch (rangeType) {
          case 'price': {
            krwVolume = Math.round(volume * price);

            const newBalanceRange = Math.round((krwVolume / BALANCE) * 100);
            setBalanceRange(newBalanceRange || 0);
            setPriceRange(percentage || 0);
            break;
          }
          case 'balance': {
            volume = Number(
              numeral(
                percentRatio(Math.floor(BALANCE * (1 - ORDER_FEE)) / price, percentage)
              ).format(`0.[00000000]`, Math.round)
            );
            krwVolume = Math.floor(volume * price * (1 + ORDER_FEE));
            setBalanceRange(percentage || 0);
            break;
          }
        }
        break;
      }
      case 'ask': {
        switch (rangeType) {
          case 'price': {
            krwVolume = Math.round(BALANCE * price);

            const newBalanceRange = Math.round((volume / BALANCE) * 100);
            setBalanceRange(newBalanceRange || 0);
            setPriceRange(percentage || 0);
            break;
          }
          case 'balance': {
            volume = percentRatio(BALANCE, percentage);

            krwVolume = Math.floor(volume * price);
            setBalanceRange(percentage || 0);
            break;
          }
        }
        break;
      }
    }
    setValues({ ...values, price, volume, krwVolume });
  };

  const handleChangeRange =
    (rangeType: RangeType, side: UpbitTradeValues['side']) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const percentage = Number(event.target.value);
      changeRange(rangeType, percentage, side);
    };

  const handleClickResetButton =
    (rangeType: RangeType, percentage: number, side: UpbitTradeValues['side']) => () => {
      changeRange(rangeType, percentage, side);
    };

  const handleClickOrderBtn =
    (orderType: OrderBtnType, side?: UpbitTradeValues['side']) => async () => {
      switch (orderType) {
        case 'limit': {
          // 지정가 주문
          const { volume, price } = values;
          if (!side || volume === 0 || price === 0) {
            return;
          }
          const params = {
            market: marketCode,
            side,
            volume: volume.toString(),
            price: price.toString(),
            ord_type: 'limit'
          } as const;
          await useUpbitApiStore
            .getState()
            .createOrder(params)
            .then((res) => {
              toast.info(
                `${numeral(Number(res.price)).format(`0,0[.][0000]`)}가격에 ${numeral(
                  Number(res.volume)
                ).format(`0,0[.][00000000]`)}만큼 주문을 넣었습니다.`
              );
              mutateChance();
            })
            .catch((err) => {
              toast.error(err?.response?.data?.error?.message ?? '주문에 실패했습니다.');
            });
          break;
        }
        case 'price':
        case 'market': {
          // 시장가 주문
          switch (side) {
            case 'bid': {
              // 시장가 매수
              const { krwVolume } = values;
              if (!side || krwVolume === 0) {
                return;
              }
              const params = {
                market: marketCode,
                side,
                price: krwVolume.toString(),
                ord_type: 'price'
              } as const;
              await useUpbitApiStore
                .getState()
                .createOrder(params)
                .then((res) => {
                  toast.info(
                    `${numeral(Number(res.price)).format(`0,0[.][0000]`)}가격에 ${numeral(
                      Number(res.volume)
                    ).format(`0,0[.][00000000]`)}만큼 시장가매수 주문을 넣었습니다.`
                  );
                  mutateChance();
                })
                .catch((err) => {
                  toast.error(
                    err?.response?.data?.error?.message ?? '시장가 매도주문을 실패했습니다.'
                  );
                });
              break;
            }
            case 'ask': {
              // 시장가 매도
              const { volume } = values;
              if (!side || volume === 0) {
                return;
              }
              const params = {
                market: marketCode,
                side,
                volume: volume.toString(),
                ord_type: 'market'
              } as const;
              await useUpbitApiStore
                .getState()
                .createOrder(params)
                .then((res) => {
                  toast.info(
                    `${numeral(Number(res.price)).format(`0,0[.][0000]`)}가격에 ${numeral(
                      Number(res.volume)
                    ).format(`0,0[.][00000000]`)}만큼 시장가매도 주문을 넣었습니다.`
                  );
                  mutateChance();
                })
                .catch((err) => {
                  toast.error(
                    err?.response?.data?.error?.message ?? '시장가 매수주문을 실패했습니다.'
                  );
                });
              break;
            }
          }
          break;
        }
        case 'reset': {
          resetValuesAndRanges();
          break;
        }
      }
    };

  const resetValuesAndRanges = (newMarket?: string) => {
    const selectedMarket = newMarket ? newMarket : marketCode;
    setValues({
      ...values,
      price: useExchangeStore.getState()?.upbitMarketDatas?.[selectedMarket.toUpperCase()]?.tp || 1,
      volume: 0,
      krwVolume: 0
    });
    setBalanceRange(0);
    setPriceRange(0);
  };

  useEffect(() => {
    // 최초 주문 가격 설정, setInterval이 아닌 구독 방식
    const unsubscribe = useExchangeStore.subscribe((state) => {
      if (state.upbitMarketDatas?.[marketCode]?.tp) {
        unsubscribe();
        setValues({
          ...values,
          price: state.upbitMarketDatas?.[marketCode]?.tp
        });
      }
    });
    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setValues((prev) => ({
      ...prev,
      price: useExchangeStore.getState()?.upbitMarketDatas?.[marketCode.toUpperCase()]?.tp || 1,
      volume: 0,
      krwVolume: 0
    }));
    setBalanceRange(0);
    setPriceRange(0);
  }, [marketCode]);

  return (
    <div className='h-full flex flex-col gap-y-2'>
      {ord_type === 'limit' && (
        <>
          <LimitOrderPanel
            side={side}
            price={values.price}
            priceRange={priceRange}
            onChangeRange={handleChangeRange}
            onClickResetButton={handleClickResetButton}
            onChangeNumericValue={handleChangeNumericValue}
          />
          <OrderVolumePanel
            orderChance={orderChance}
            side={side}
            ord_type={ord_type}
            values={values}
            balanceRange={balanceRange}
            onChangeRange={handleChangeRange}
            onClickResetButton={handleClickResetButton}
            onChangeNumericValue={handleChangeNumericValue}
          />
        </>
      )}
      {(ord_type === 'market' || ord_type === 'price') && (
        <MarketOrderPanel
          orderChance={orderChance}
          side={side}
          ord_type={ord_type}
          values={values}
          balanceRange={balanceRange}
          onChangeRange={handleChangeRange}
          onClickResetButton={handleClickResetButton}
          onChangeNumericValue={handleChangeNumericValue}
        />
      )}
      <div className='mt-auto'>
        <OrderBtnPanel
          orderChance={orderChance}
          ord_type={ord_type}
          side={side}
          onClickOrderBtn={handleClickOrderBtn}
        />
      </div>
    </div>
  );
};

interface LimitOrderPanelProps extends DefaultPanelProp {
  side: UpbitTradeValues['side'];
  price: number;
  priceRange: number;
}

const LimitOrderPanel: FC<LimitOrderPanelProps> = ({
  side,
  price,
  priceRange,
  onChangeNumericValue,
  onChangeRange,
  onClickResetButton
}) => {
  return (
    <div className='select-none'>
      <div className='mb-1 flex-center gap-x-2 text-sm'>
        <span
          className='whitespace-nowrap cursor-pointer'
          onClick={onClickResetButton('price', 0, side)}
        >
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
            onChange={onChangeRange('price', side)}
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
            onChange={onChangeNumericValue('price', side)}
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

interface OrderVolumePanelProps extends DefaultPanelProp {
  orderChance: IUpbitOrdersChance;
  side: UpbitTradeValues['side'];
  ord_type: UpbitTradeValues['ord_type'];
  values: UpbitInputForm;
  balanceRange: number;
}

const OrderVolumePanel: FC<OrderVolumePanelProps> = ({
  orderChance,
  side,
  ord_type,
  values,
  balanceRange,
  onChangeNumericValue,
  onChangeRange,
  onClickResetButton
}) => {
  const market = orderChance.market.id;
  const krwBalance = orderChance.bid_account.balance;
  const krwVolumeIsHigherThanMaximum = values.krwVolume > Number(orderChance.market.max_total);
  const krwVolumeIsLowerThanMinimum = values.krwVolume < Number(orderChance.market[side].min_total);
  // - limit : 지정가 주문
  // - price : 시장가 주문(매수)
  // - market : 시장가 주문(매도)
  switch (ord_type) {
    case 'market':
    case 'price':
    case 'limit': {
      return (
        <div>
          <div className='mb-1 flex-center gap-x-2 text-sm '>
            <span
              className='whitespace-nowrap cursor-pointer'
              onClick={onClickResetButton('balance', 0, side)}
            >
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
                onChange={onChangeRange('balance', side)}
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
                onChange={onChangeNumericValue('volume', side)}
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
                onChange={onChangeNumericValue('krwVolume', side)}
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
                  `최대 주문은 ${Number(orderChance.market.max_total).toLocaleString()}원입니다.`
                ) : krwVolumeIsLowerThanMinimum ? (
                  `최소 주문은 ${Number(
                    orderChance.market[side].min_total
                  ).toLocaleString()}원입니다.`
                ) : (
                  <span>
                    업비트 매매수수료{' '}
                    <b>
                      {numeral(values.krwVolume * Number(orderChance.bid_fee)).format('0,0[.][00]')}
                    </b>
                    원이 포함되어 있습니다.
                  </span>
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

const MarketOrderPanel: FC<OrderVolumePanelProps> = ({
  orderChance,
  ord_type,
  side,
  balanceRange,
  values,
  onChangeNumericValue,
  onChangeRange,
  onClickResetButton
}) => {
  const orderbook = useExchangeStore(({ upbitOrderbook }) => {
    return {
      askPrice: upbitOrderbook?.obu?.[0]?.ap ?? null,
      bidPrice: upbitOrderbook?.obu?.[0]?.bp ?? null
    };
  }, shallow);

  if (!orderbook.askPrice || !orderbook.bidPrice) {
    return <>시장가 데이터를 불러오는 중 입니다.</>;
  }
  const market = orderChance.market.id;
  const krwBalance = orderChance.bid_account.balance;

  switch (side) {
    case 'bid': {
      const krwVolumeIsHigherThanMaximum = values.krwVolume > Number(orderChance.market.max_total);
      const krwVolumeIsLowerThanMinimum =
        values.krwVolume < Number(orderChance.market[side].min_total);
      return (
        <div>
          <div className='mb-1 flex-center gap-x-2 text-sm '>
            <span
              className='whitespace-nowrap cursor-pointer'
              onClick={onClickResetButton('balance', 0, side)}
            >
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
                onChange={onChangeRange('balance', side)}
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
                onChange={onChangeNumericValue('krwVolume', side)}
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
                    orderChance.market.max_total
                  ).toLocaleString()}원입니다.`}</span>
                ) : krwVolumeIsLowerThanMinimum ? (
                  <span className='text-error-content'>
                    {`최소 주문은 ${Number(orderChance.market[side].min_total).toLocaleString()}
                  원입니다.`}
                  </span>
                ) : (
                  <div>
                    <div>
                      <span>
                        {`≈ ${numeral(values.krwVolume / orderbook.askPrice).format(
                          '0,0[.][00000000]'
                        )} ${orderChance.ask_account.currency}`}
                      </span>
                    </div>
                    <div className='text-info-content'>
                      업비트 매매수수료&nbsp;
                      <b>
                        {numeral(values.krwVolume * Number(orderChance.bid_fee)).format(
                          '0,0[.][00]'
                        )}
                      </b>
                      원이 포함되어 있습니다.
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
        values.volume * orderbook.askPrice > Number(orderChance.market.max_total);
      const volumeIsLowerThanMinimum =
        values.volume * orderbook.askPrice < Number(orderChance.market[side].min_total);
      return (
        <div>
          <div className='mb-1 flex-center gap-x-2 text-sm '>
            <span
              className='whitespace-nowrap cursor-pointer'
              onClick={onClickResetButton('balance', 0, side)}
            >
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
                onChange={onChangeRange('balance', side)}
              />
            </div>
          </div>
          <div className='form-control'>
            <label className='input-group input-group-sm'>
              <NumericFormat
                type='text'
                inputMode='decimal'
                className='input input-bordered input-sm min-w-0 w-full'
                value={values.volume}
                onChange={onChangeNumericValue('volume', side)}
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
                    orderChance.market.max_total
                  ).toLocaleString()}원입니다.`}</span>
                ) : volumeIsLowerThanMinimum ? (
                  <span className='text-error-content'>
                    {`최소 주문은 ${Number(orderChance.market[side].min_total).toLocaleString()}
                  원입니다.`}
                  </span>
                ) : (
                  <div>
                    <div>
                      <span>
                        {`≈ ${numeral(values.volume * orderbook.bidPrice).format('0,0[.][00]')} ${
                          orderChance.bid_account.currency
                        }`}
                      </span>
                    </div>
                    <div className='text-info-content'>
                      업비트 매매수수료&nbsp;
                      <b>
                        {numeral(
                          values.volume * orderbook.bidPrice * Number(orderChance.ask_fee)
                        ).format('0,0[.][00]')}
                      </b>
                      원이 포함되어 있습니다.
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
  orderChance: IUpbitOrdersChance;
  side: UpbitTradeValues['side'];
  ord_type: UpbitTradeValues['ord_type'];
  onClickOrderBtn: (orderType: OrderBtnType, side?: UpbitTradeValues['side']) => () => void;
}

const OrderBtnPanel: FC<OrderBtnPanelProps> = ({
  orderChance,
  ord_type,
  side,
  onClickOrderBtn
}) => {
  const krwBalance = Number(orderChance.bid_account.balance);
  const coinBalance = Number(orderChance.ask_account.balance);
  const isShortBalance =
    (side === 'bid' && krwBalance < 5000 * (1 + Number(orderChance.bid_fee))) ||
    (side === 'ask' && coinBalance === 0);

  return (
    <button
      key={`ORDER_MARKET_${side}`}
      onClick={onClickOrderBtn(ord_type, side)}
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
        `${ordTypeText[ord_type]} ${sideText[side]}`
      )}
    </button>
  );
};

interface CurrentTradePricePanelProps {
  side: UpbitTradeValues['side'];
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
