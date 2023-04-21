import classNames from 'classnames';
import { format } from 'date-fns-tz';
import { throttle } from 'lodash';
import numeral from 'numeral';
import { FC, memo, useState } from 'react';
import isEqual from 'react-fast-compare';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { IoMdRefresh } from 'react-icons/io';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';
import { toast } from 'react-toastify';
import { apiUrls } from 'src/lib/apiUrls';
import { useUpbitApiStore } from 'src/store/upbitApi';
import { IUpbitGetOrderResponse } from 'src/types/upbit';
import { satoshiPad, upbitPadEnd } from 'src/utils/utils';
import useSWR from 'swr';
import shallow from 'zustand/shallow';

// const OrderStateRecord = {
//   wait: '체결 대기',
//   watch: '예약주문 대기',
//   done: '체결 완료',
//   cancel: '주문 취소'
// };

export const UpbitOrders = memo(() => {
  const isLogin = useUpbitApiStore((state) => state.isLogin, shallow);
  const [hidden, setHidden] = useState(false);
  const [isPending, setPending] = useState(false);
  const [tabs, setTabs] = useState<'orders' | 'ordersHistory'>('orders');

  const handleClickRefreshButton = throttle(async () => {
    if (isPending) {
      toast.info('다시 불러오는 중 입니다.');
      return;
    }
    setPending(true);
    const { upbitTradeMarket, getOrders, getOrdersChance, getOrdersHistory } =
      useUpbitApiStore.getState();
    switch (tabs) {
      case 'orders': {
        await Promise.all([
          getOrdersChance(upbitTradeMarket),
          getOrders({ market: upbitTradeMarket })
        ]);
        break;
      }
      case 'ordersHistory': {
        await getOrdersHistory({ market: upbitTradeMarket });
        break;
      }
    }
    setTimeout(() => {
      setPending(false);
    }, 1000);
  }, 500);

  const handleClickTabBtn = (tab: typeof tabs) => async () => {
    setTabs(tab);
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
          <span>주문 목록</span>
        </button>
        <button
          onClick={handleClickTabBtn('ordersHistory')}
          className={classNames(
            'btn grow btn-xs btn-ghost border-0',
            tabs === 'ordersHistory' ? 'btn-active ' : null
          )}
        >
          <span>거래 내역</span>
        </button>
        {isLogin && (
          <button
            className={classNames(
              'tooltip tooltip-left  btn btn-circle btn-ghost btn-xs',
              isPending ? 'btn-disabled' : ''
            )}
            data-tip='새로고침'
            onClick={handleClickRefreshButton}
          >
            <IoMdRefresh className='w-full' />
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
          <UpbitOrdersContainer />
        ) : (
          <UpbitOrdersHistoryContainer />
        )
      ) : null}
    </div>
  );
}, isEqual);
UpbitOrders.displayName = 'UpbitOrders';

const UpbitOrdersContainer = () => {
  const { upbitTradeMarket, orders } = useUpbitApiStore(
    ({ upbitTradeMarket, orders }) => ({
      upbitTradeMarket,
      orders
    }),
    shallow
  );

  const { error, mutate } = useSWR(
    `${apiUrls.upbit.path}${apiUrls.upbit.orders}/${upbitTradeMarket}`,
    async () => {
      await useUpbitApiStore.getState().getOrders({ market: upbitTradeMarket });
    },
    {
      refreshInterval: 2 * 60 * 1000
    }
  );

  if (error) {
    return (
      <div className='h-full bg-base-200 flex-center p-5 text-center'>
        <div>
          <div>마켓 정보를 가져오는 중 에러가 발생했습니다.</div>
        </div>
      </div>
    );
  }

  if (!orders) {
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

  return <UpbitOrdersInner upbitTradeMarket={upbitTradeMarket} orders={orders} mutate={mutate} />;
};

interface UpbitOrdersInnerProps {
  upbitTradeMarket: string;
  orders: Array<IUpbitGetOrderResponse>;
  mutate: () => void;
}

const UpbitOrdersInner: FC<UpbitOrdersInnerProps> = ({ upbitTradeMarket, orders, mutate }) => {
  const handleClickCancelBtn = (uuid: string) => async () => {
    await useUpbitApiStore
      .getState()
      .deleteOrder({ uuid })
      .then(async () => {
        toast.success('주문이 취소되었습니다.');
        mutate();
        await useUpbitApiStore.getState().getOrdersChance(upbitTradeMarket);
      })
      .catch(() => {
        toast.error('주문을 취소하지 못 했습니다.');
      });
  };

  return (
    <div className='font-mono text-right bg-base-200 text-xs overflow-y-auto whitespace-nowrap first-of-type:[&>div]:mt-0 last-of-type:[&>div]:mb-0'>
      {orders.map((order) => {
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
      })}
    </div>
  );
};

const UpbitOrdersHistoryContainer = () => {
  const { upbitTradeMarket, ordersHistory } = useUpbitApiStore(
    ({ upbitTradeMarket, ordersHistory }) => ({
      upbitTradeMarket,
      ordersHistory
    }),
    shallow
  );

  const { error, mutate } = useSWR(
    `${apiUrls.upbit.path}${apiUrls.upbit.orders}/history/${upbitTradeMarket}`,
    async () => {
      await useUpbitApiStore.getState().getOrdersHistory({ market: upbitTradeMarket });
    },
    {
      refreshInterval: 5 * 60 * 1000
    }
  );

  if (error) {
    return (
      <div className='h-full bg-base-200 flex-center p-5 text-center'>
        <div>
          <div>마켓 정보를 가져오는 중 에러가 발생했습니다.</div>
        </div>
      </div>
    );
  }

  if (!ordersHistory) {
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

  return (
    <UpbitOrdersHistoryInner
      upbitTradeMarket={upbitTradeMarket}
      orders={ordersHistory}
      mutate={mutate}
    />
  );
};

const UpbitOrdersHistoryInner: FC<UpbitOrdersInnerProps> = ({ orders }) => {
  return (
    <div className='font-mono text-right bg-base-200 text-xs overflow-y-auto whitespace-nowrap'>
      {orders.map((order) => {
        if (!order.price) {
          return <tr key={order?.uuid} />;
        }
        const [currency, market] = order.market.split('-') || [];

        return (
          <div
            key={order.uuid}
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
                <span className={order.side}>
                  {order.side === 'bid' ? '매수' : order.side === 'ask' ? '매도' : order.side}
                </span>
              </b>
            </div>
            <div>체결가격</div>
            <div className='text-zinc-300'>
              {upbitPadEnd(Number(order.price))}&nbsp;
              {currency}
            </div>
            <div>체결수량</div>
            <div className='text-zinc-300'>
              {order.volume}&nbsp;
              {market}
            </div>
            <div>체결금액</div>
            <div className='text-zinc-300'>
              {numeral(Number(order.volume) * Number(order.price)).format('0,0')}&nbsp;{currency}
            </div>
            <div>체결시간</div>
            <div>{format(new Date(order.created_at), 'yy-MM-dd HH:mm:ss')}</div>
          </div>
        );
      })}
    </div>
  );
};
