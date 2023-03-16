import classNames from 'classnames';
import { format } from 'date-fns-tz';
import { throttle } from 'lodash';
import React, { FC, memo, useState } from 'react';
import isEqual from 'react-fast-compare';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { IoMdRefresh } from 'react-icons/io';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';
import { toast } from 'react-toastify';
import { apiUrls } from 'src/lib/apiUrls';
import { useUpbitApiStore } from 'src/store/upbitApi';
import { IUpbitGetOrderResponse } from 'src/types/upbit';
import useSWR from 'swr';
import shallow from 'zustand/shallow';

export const UpbitOrders = memo(() => {
  const [hidden, setHidden] = useState(false);
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

  return (
    <div
      className={classNames(
        'flex flex-col flex-auto bg-base-200 overflow-hidden h-full',
        hidden ? 'flex-grow-0' : 'flex-grow'
      )}
    >
      <div className='flex items-center justify-between pl-1 flex-auto flex-shrink-0 flex-grow-0'>
        <div className='text-sm'>주문 목록</div>
        <div
          className='ml-auto tooltip tooltip-left'
          data-tip='잔고를 다시 불러옵니다.'
          onClick={handleClickRefreshButton}
        >
          <button
            className={classNames(
              'btn btn-circle btn-ghost btn-xs',
              isPending ? 'btn-disabled' : ''
            )}
          >
            <IoMdRefresh />
          </button>
        </div>
        <button className='btn btn-circle btn-ghost btn-xs' onClick={() => setHidden((p) => !p)}>
          {hidden ? <RiArrowDownSLine /> : <RiArrowUpSLine />}
        </button>
      </div>
      {!hidden && <UpbitOrdersContainer />}
    </div>
  );
}, isEqual);
UpbitOrders.displayName = 'UpbitOrders';

const UpbitOrdersContainer = () => {
  const { isLogin, upbitTradeMarket, orders } = useUpbitApiStore(
    ({ isLogin, upbitTradeMarket, orders }) => ({
      isLogin,
      upbitTradeMarket,
      orders
    }),
    shallow
  );

  const { error, mutate } = useSWR(
    `${apiUrls.upbit.path}${apiUrls.upbit.orders}/${upbitTradeMarket}/${isLogin}`,
    async () => {
      await useUpbitApiStore.getState().getOrders({ market: upbitTradeMarket });
    },
    {
      refreshInterval: 60 * 1000
    }
  );

  if (!isLogin) {
    return (
      <div className='h-full bg-base-200 flex-center p-5 text-center'>
        <div>
          <div>오른쪽 상단에서 업비트 API를 먼저 연결해주세요.</div>
        </div>
      </div>
    );
  }

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

  return (
    <div className='h-full bg-base-300'>
      <UpbitOrdersInner upbitTradeMarket={upbitTradeMarket} orders={orders} mutate={mutate} />
    </div>
  );
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
    <div className='relative flex flex-col h-full text-right whitespace-nowrap text-xs overflow-y-auto font-mono bg-base-300'>
      <table className='border-separate border-spacing-0 w-full text-zinc-500 hover:[&>tbody>tr]:bg-base-200/40 [&_th]:py-1 [&_td]:py-1 [&_td]:border-t-[1px] [&_td]:border-t-neutral'>
        <colgroup>
          <col width='15%'></col>
          <col width='15%'></col>
          <col width='25%'></col>
          <col width='35%'></col>
          <col width='10%'></col>
        </colgroup>
        <thead className='sticky top-0 left-0 bg-base-300'>
          <tr>
            <th className='text-center'>주문시간</th>
            <th className='text-center'>
              <div>마켓</div>
              <div>구분</div>
            </th>
            <th>
              <div>감시가격</div>
              <div>주문가격</div>
            </th>
            <th>
              <div>미체결량</div>
              <div>주문량</div>
            </th>
            <th>
              <div className='text-center'>취소</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const [priceInt, priceFloat] = order.price.split('.');

            return (
              <tr key={order.uuid} className='text-neutral-content'>
                <td className='text-center'>
                  <div>{format(new Date(order.created_at), 'yyyy-MM-dd')}</div>
                  <div>{format(new Date(order.created_at), 'HH:mm:ss')}</div>
                </td>
                <td className='text-center'>
                  <div>
                    <b>{order.market.replace('-', '/')}</b>
                  </div>
                  <div className={order.side}>
                    <b>
                      {order.side === 'bid' ? '매수' : order.side === 'ask' ? '매도' : order.side}
                    </b>
                  </div>
                </td>
                <td>
                  <div>-</div>
                  {/* <div>{order.watchPrice}</div> */}
                  <div>{`${Number(priceInt).toLocaleString()}${
                    priceFloat ? `.${priceFloat}` : ''
                  }`}</div>
                </td>
                <td>
                  <div>{Number(order.volume) - Number(order.executed_volume)}</div>
                  <div>{order.volume}</div>
                </td>
                <td>
                  <div className='flex-center'>
                    <button className='btn btn-xs' onClick={handleClickCancelBtn(order.uuid)}>
                      취소
                    </button>
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
