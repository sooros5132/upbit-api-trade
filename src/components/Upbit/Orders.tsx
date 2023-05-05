import classNames from 'classnames';
import { format } from 'date-fns-tz';
import numeral from 'numeral';
import { memo, useEffect, useState } from 'react';
import isEqual from 'react-fast-compare';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { IoMdRefresh } from 'react-icons/io';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';
import { toast } from 'react-toastify';
import { apiUrls } from 'src/lib/apiUrls';
import { useUpbitApiStore } from 'src/store/upbitApi';
import { IUpbitGetOrderResponse } from 'src/types/upbit';
import { krwRegex } from 'src/utils/regex';
import { delay, satoshiPad, upbitPadEnd } from 'src/utils/utils';
import shallow from 'zustand/shallow';
import Image from 'next/image';
import useSWRInfinite from 'swr/infinite';
import queryString from 'query-string';

// const OrderStateRecord = {
//   wait: '체결 대기',
//   watch: '예약주문 대기',
//   done: '체결 완료',
//   cancel: '주문 취소'
// };

const PAGE_SIZE = 100;

export const UpbitOrders = memo(() => {
  const { isLogin, upbitTradeMarket, enableGetOrderAllMarket, setEnableGetOrderAllMarket } =
    useUpbitApiStore(
      (state) => ({
        isLogin: state.isLogin,
        upbitTradeMarket: state.upbitTradeMarket,
        enableGetOrderAllMarket: state.enableGetOrderAllMarket,
        setEnableGetOrderAllMarket: state.setEnableGetOrderAllMarket
      }),
      shallow
    );
  const [hidden, setHidden] = useState(false);
  const [isPending, setPending] = useState(false);
  const [tabs, setTabs] = useState<'orders' | 'ordersHistory'>('orders');
  const marketCode = upbitTradeMarket.replace(krwRegex, '');
  const handleClickRefreshButton = async () => {
    if (isPending) {
      toast.info('다시 불러오는 중 입니다.');
      return;
    }
    setPending(true);
    const { ordersSWRMutate, ordersHistorySWRMutate } = useUpbitApiStore.getState();
    switch (tabs) {
      case 'orders': {
        await ordersSWRMutate?.();
        break;
      }
      case 'ordersHistory': {
        await ordersHistorySWRMutate?.();
        break;
      }
    }
    setTimeout(() => {
      setPending(false);
    }, 500);
  };

  const handleClickTabBtn = (tab: typeof tabs) => async () => {
    setTabs(tab);
  };

  const handleChange = async () => {
    if (isPending) {
      toast.info('다시 불러오는 중 입니다.');
      return;
    }
    setEnableGetOrderAllMarket(!enableGetOrderAllMarket);
    await handleClickRefreshButton();
  };

  return (
    <div
      className={classNames(
        'flex flex-col flex-auto bg-base-200 overflow-hidden h-full',
        hidden ? 'flex-grow-0' : 'flex-grow'
      )}
    >
      <div className='btn-group w-full gap-x-0.5'>
        <button
          onClick={handleClickTabBtn('orders')}
          className={classNames(
            'btn grow btn-xs btn-ghost border-0',
            tabs === 'orders' ? 'btn-active' : null
          )}
        >
          <span>주문목록</span>
        </button>
        <button
          onClick={handleClickTabBtn('ordersHistory')}
          className={classNames(
            'btn grow btn-xs btn-ghost border-0',
            tabs === 'ordersHistory' ? 'btn-active ' : null
          )}
        >
          <span>거래내역</span>
        </button>
        <div className='flex items-center'>
          &nbsp;
          <span
            className='tooltip tooltip-bottom flex-center cursor-pointer text-zinc-500 text-xs'
            onClick={handleChange}
            data-tip='불러올 마켓 변경'
          >
            ALL&nbsp;
            <input
              type='checkbox'
              className='bg-opacity-100 border-opacity-100 toggle toggle-xs rounded-full border-zinc-500 transition-all'
              checked={!enableGetOrderAllMarket}
              disabled={isPending}
              readOnly
            />
            &nbsp;{marketCode}
          </span>
        </div>
        {isLogin && (
          <button
            className={classNames(
              'tooltip tooltip-left  btn btn-circle btn-ghost btn-xs',
              isPending ? 'btn-disabled' : ''
            )}
            data-tip='새로고침'
            onClick={handleClickRefreshButton}
          >
            <IoMdRefresh className={classNames('w-full', isPending && 'animate-spin')} />
          </button>
        )}
        <button className='btn btn-circle btn-ghost btn-xs' onClick={() => setHidden((p) => !p)}>
          {hidden ? <RiArrowDownSLine /> : <RiArrowUpSLine />}
        </button>
      </div>
      {!hidden ? (
        !isLogin ? (
          <div className='h-full bg-base-200 flex-center p-5 text-center'>
            <div>
              <div>주문 목록을 보려면 오른쪽 상단에서 업비트 API Key를 등록해주세요.</div>
            </div>
          </div>
        ) : tabs === 'orders' ? (
          <OrdersContainer />
        ) : (
          <OrdersHistoryContainer />
        )
      ) : null}
    </div>
  );
}, isEqual);
UpbitOrders.displayName = 'UpbitOrders';

const OrdersContainer = memo(() => {
  const { upbitTradeMarket, enableGetOrderAllMarket } = useUpbitApiStore(
    ({ upbitTradeMarket, enableGetOrderAllMarket }) => ({
      upbitTradeMarket,
      enableGetOrderAllMarket
    }),
    shallow
  );

  const { data, error, isValidating, size, setSize, mutate } = useSWRInfinite(
    (index, prevData) => {
      if (prevData && !prevData.length) return null;
      return `${apiUrls.upbit.path}${apiUrls.upbit.orders}/${upbitTradeMarket}?page=${index}&enableGetOrderAllMarket=${enableGetOrderAllMarket}`;
    },
    async (key) => {
      const { page: _page } = queryString.parse(key.split('?')[1]) as {
        page: string;
        enableGetOrderAllMarket: string;
      };
      const page = Number(_page) + 1;
      return await useUpbitApiStore
        .getState()
        .getOrders({ market: upbitTradeMarket, page, limit: PAGE_SIZE });
    },
    {
      refreshInterval: 2 * 60 * 1000,
      revalidateFirstPage: true
    }
  );

  const currentPage = size + 1;
  const isEmpty = data?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.length < PAGE_SIZE);

  useEffect(() => {
    useUpbitApiStore.setState({
      orders: data?.flat() || [],
      ordersSWRMutate: mutate
    });
  }, [data, currentPage, mutate]);

  if (error) {
    return (
      <div className='h-full bg-base-200 flex-center p-5 text-center'>
        <div>
          <div>마켓 정보를 가져오는 중 에러가 발생했습니다.</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className='h-full flex-center flex-col px-5 py-10 gap-2 text-center bg-base-200 animate-pulse'>
        <div className='animate-spin text-3xl'>
          <AiOutlineLoading3Quarters />
        </div>
        <div className='text-center'>
          <div>마켓 정보를 가져오는 중 입니다.</div>
        </div>
      </div>
    );
  }

  const handleClickMoreButton = () => {
    if (isReachingEnd || isValidating) {
      toast.info('정보를 가져오는 중 입니다.');
      return;
    }
    setSize(size + 1);
  };

  return (
    <div className='h-full min-h-12 font-mono text-xs text-right bg-base-200 overflow-y-auto whitespace-nowrap first-of-type:[&>div]:mt-0 last-of-type:[&>div]:mb-0'>
      {!isEmpty &&
        data?.map((orders) =>
          orders?.map((order) => <OrdersInner key={order.uuid} order={order} />)
        )}
      {!isEmpty ? (
        <div className='flex items-center justify-center py-4'>
          <button
            className='btn btn-sm btn-outline'
            onClick={handleClickMoreButton}
            disabled={isReachingEnd || isValidating}
          >
            {isReachingEnd ? '마지막 입니다' : '더 불러오기'}
          </button>
        </div>
      ) : (
        <div className='h-full flex-center'>
          {upbitTradeMarket.replace('-', '/')} 마켓의 주문이 없습니다.
        </div>
      )}
    </div>
  );
}, isEqual);

OrdersContainer.displayName = 'OrdersContainer';

interface OrderHistoryProps {
  orders: Array<IUpbitGetOrderResponse>;
}

// const Orders: FC<OrderHistoryProps> = memo(({ orders }) => {
//   return (
//     <>
//       {orders?.map((order) => (
//         <OrdersInner key={order.uuid} order={order} />
//       ))}
//     </>
//   );
// }, isEqual);

// Orders.displayName = 'Orders';

type OrdersInnerProps = {
  order: IUpbitGetOrderResponse;
};

const OrdersInner = memo(({ order }: OrdersInnerProps) => {
  const handleClickCancelBtn = (uuid: string) => async () => {
    const deleteOrder = useUpbitApiStore.getState().deleteOrder;

    await deleteOrder({ uuid })
      .then(async () => {
        toast.success('주문이 취소되었습니다.');
        const { revalidateOrders, revalidateOrdersChance } = useUpbitApiStore.getState();
        // 속도가 너무 빨라 제대로 가져오지 못 함. 50ms 딜레이 적용
        await delay(50);
        await Promise.all([revalidateOrdersChance(), revalidateOrders()]);
      })
      .catch((e) => {
        toast.error(e?.error?.message || '주문을 취소하지 못했습니다.');
      });
  };

  const [currency, market] = order.market.split('-') || [];
  const volumePad = ''.padStart(order.volume.split('.')?.[1]?.length || 0, '0');
  const unfastenedVolume = Number(order.volume) - Number(order.executed_volume);
  const unfastenedVolumePad = ''.padStart(
    String(unfastenedVolume).split('.')?.[1]?.length || 0,
    '0'
  );

  return (
    <div
      key={order.uuid}
      className={classNames(
        'my-0.5 grid grid-rows-[auto_auto_auto_auto_auto] grid-cols-[auto_1fr_auto] p-2 gap-y-0.5 gap-x-1.5 text-neutral-600',
        order.side === 'ask'
          ? 'bg-rose-800/10 hover:bg-rose-800/20'
          : 'bg-teal-800/10 hover:bg-teal-800/20'
      )}
    >
      <div>마켓</div>
      <div className='text-neutral-300'>
        <b>
          {`${currency}/${market}`}&nbsp;
          <span className='[&>*]:!align-text-top'>
            <Image
              className='object-contain rounded-full overflow-hidden'
              src={`/asset/upbit/logos/${market}.png`}
              width={14}
              height={14}
              quality={100}
              loading='lazy'
              alt={`${currency}/${market}-icon`}
            />
          </span>
          &nbsp;
          <span className={order.side}>
            {order.side === 'bid' ? '매수' : order.side === 'ask' ? '매도' : order.side}
          </span>
        </b>
      </div>
      <div>주문가격</div>
      <div className='text-neutral-300'>
        {upbitPadEnd(Number(order.price))}&nbsp;
        {currency}
      </div>
      <div>주문수량</div>
      <div className='text-neutral-300'>
        <span>{satoshiPad(Number(order.volume), volumePad)}</span>
        &nbsp;{market}
      </div>
      <div>주문금액</div>
      <div className='text-neutral-500'>
        {numeral(Number(order.locked) - Number(order.remaining_fee)).format('0,0')}
        &nbsp;{currency}
      </div>
      <div>미체결량</div>
      <div className='text-neutral-300'>
        <b>
          {satoshiPad(unfastenedVolume, unfastenedVolumePad || volumePad)}
          &nbsp;
          {market}
        </b>
      </div>
      <div>미체결액</div>
      <div className='text-neutral-500'>
        {numeral(unfastenedVolume * Number(order.price)).format('0,0')}
        &nbsp;{currency}
      </div>
      <div>주문시간</div>
      <div>{format(new Date(order.created_at), 'yy-MM-dd HH:mm:ss')}</div>
      <div className='col-start-3 col-end-3 row-start-1 row-end-[8] flex items-center'>
        <button className='btn btn-xs w-full' onClick={handleClickCancelBtn(order.uuid)}>
          취소
        </button>
      </div>
    </div>
  );
}, isEqual);
OrdersInner.displayName = 'OrdersInner';

const OrdersHistoryContainer = memo(() => {
  const { upbitTradeMarket, enableGetOrderAllMarket, orderFee } = useUpbitApiStore(
    ({ upbitTradeMarket, enableGetOrderAllMarket, ordersChance }) => ({
      upbitTradeMarket,
      enableGetOrderAllMarket,
      orderFee: {
        bid_fee: ordersChance?.bid_fee,
        ask_fee: ordersChance?.ask_fee
      }
    }),
    shallow
  );

  const { data, error, isValidating, size, setSize, mutate } = useSWRInfinite(
    (index, prevData) => {
      if (prevData && !prevData.length) return null;
      return `${apiUrls.upbit.path}${apiUrls.upbit.orders}/history/${upbitTradeMarket}?page=${index}&enableGetOrderAllMarket=${enableGetOrderAllMarket}`;
    },
    async (key) => {
      const { page: _page } = queryString.parse(key.split('?')[1]) as {
        page: string;
        enableGetOrderAllMarket: string;
      };
      const page = Number(_page) + 1;
      return await useUpbitApiStore
        .getState()
        .getOrdersHistory({ market: upbitTradeMarket, page, limit: PAGE_SIZE });
    },
    {
      refreshInterval: 5 * 60 * 1000,
      revalidateFirstPage: true
    }
  );

  const currentPage = size + 1;
  const isEmpty = data?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.length < PAGE_SIZE);

  useEffect(() => {
    useUpbitApiStore.setState({
      ordersHistory: data?.flat() || [],
      ordersHistorySWRMutate: mutate
    });
  }, [data, currentPage, mutate]);

  if (error) {
    return (
      <div className='h-full bg-base-200 flex-center p-5 text-center'>
        <div>
          <div>마켓 정보를 가져오는 중 에러가 발생했습니다.</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className='h-full flex-center flex-col px-5 py-10 gap-2 text-center bg-base-200 animate-pulse'>
        <div className='animate-spin text-3xl'>
          <AiOutlineLoading3Quarters />
        </div>
        <div className='text-center'>
          <div>마켓 정보를 가져오는 중 입니다.</div>
        </div>
      </div>
    );
  }

  const handleClickMoreButton = () => {
    if (isReachingEnd || isValidating) {
      toast.info('정보를 가져오는 중 입니다.');
      return;
    }
    setSize(size + 1);
  };

  return (
    <div className='h-full min-h-12 font-mono text-xs text-right bg-base-200 overflow-y-auto whitespace-nowrap first-of-type:[&>div]:mt-0 last-of-type:[&>div]:mb-0'>
      {!isEmpty &&
        data?.map((orders) =>
          orders?.map((order) => (
            <OrderHistoryInner key={order.uuid} order={order} orderFee={orderFee} />
          ))
        )}
      {!isEmpty ? (
        <div className='flex items-center justify-center py-4'>
          <button
            className='btn btn-sm btn-outline'
            onClick={handleClickMoreButton}
            disabled={isReachingEnd || isValidating}
          >
            {isReachingEnd ? '마지막 입니다' : '더 불러오기'}
          </button>
        </div>
      ) : (
        <div className='h-full flex-center'>
          {upbitTradeMarket.replace('-', '/')} 마켓의 거래내역이 없습니다.
        </div>
      )}
    </div>
  );
}, isEqual);

OrdersHistoryContainer.displayName = 'OrdersHistoryContainer';

// const OrderHistory: FC<OrderHistoryProps> = memo(({ orders }) => {
//   return (
//     <>
//       {orders.map((order) => {
//         return <OrderHistoryInner key={order.uuid} order={order} orderFee={orderFee} />;
//       })}
//     </>
//   );
// }, isEqual);

// OrderHistory.displayName = 'OrderHistory';

type OrderHistoryInnerProps = {
  order: IUpbitGetOrderResponse;
  orderFee: {
    bid_fee?: string;
    ask_fee?: string;
  };
};

const OrderHistoryInner = memo(({ order, orderFee }: OrderHistoryInnerProps) => {
  const fee = Number(orderFee[(order.side + '_fee') as keyof typeof orderFee]);

  // 시장가 계산
  const marketKrwVolume =
    !order.price && ['ask', 'bid'].includes(order.side) && fee && Number(order.paid_fee)
      ? Number(order.paid_fee) / fee
      : null;
  const marketAveragePrice =
    marketKrwVolume && Number(order.volume) ? marketKrwVolume / Number(order.volume) : null;
  // 시장가 계산

  const [currency, market] = order.market.split('-') || [];

  return (
    <div
      className={classNames(
        'my-0.5 grid grid-rows-[auto_auto_auto_auto] grid-cols-[auto_1fr] p-2 gap-y-0.5 gap-x-1 text-zinc-600 hover:bg-base-content/5',
        order.side === 'ask'
          ? 'bg-rose-800/10 hover:bg-rose-800/20'
          : 'bg-teal-800/10 hover:bg-teal-800/20'
      )}
    >
      <div>마켓</div>
      <div className='text-zinc-300'>
        <b>
          {`${currency}/${market}`}&nbsp;
          <span className='[&>*]:!align-text-top'>
            <Image
              className='object-contain rounded-full overflow-hidden'
              src={`/asset/upbit/logos/${market}.png`}
              width={14}
              height={14}
              quality={100}
              loading='lazy'
              alt={`${currency}/${market}-icon`}
            />
          </span>
          &nbsp;
          <span className={order.side}>
            {order.ord_type === 'market'
              ? '시장가 '
              : order.ord_type === 'limit'
              ? '지정가 '
              : order.ord_type}
            {order.side === 'bid' ? '매수' : order.side === 'ask' ? '매도' : order.side}
          </span>
        </b>
      </div>
      <div>{marketAveragePrice ? '평균가격' : '체결가격'}</div>
      <div className='text-zinc-300'>
        {upbitPadEnd(marketAveragePrice ? marketAveragePrice : Number(order.price))}&nbsp;
        {currency}
      </div>
      <div>체결수량</div>
      <div className='text-zinc-300'>
        {order.volume}&nbsp;
        {market}
      </div>
      <div>체결금액</div>
      <div className='text-zinc-300'>
        {numeral(
          marketKrwVolume ? marketKrwVolume : Number(order.volume) * Number(order.price)
        ).format('0,0')}
        &nbsp;{currency}
      </div>
      <div>체결시간</div>
      <div>{format(new Date(order.created_at), 'yy-MM-dd HH:mm:ss')}</div>
    </div>
  );
}, isEqual);

OrderHistoryInner.displayName = 'OrderHistoryInner';
