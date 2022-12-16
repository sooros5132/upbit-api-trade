import { format } from 'date-fns-tz';
import React, { FC } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { toast } from 'react-toastify';
import { apiUrls } from 'src/lib/apiUrls';
import { useUpbitApiStore } from 'src/store/upbitApi';
import { IUpbitGetOrderResponse } from 'src/types/upbit';
import useSWR from 'swr';
import shallow from 'zustand/shallow';

export const UpbitOrders = () => {
  const { upbitTradeMarket, setUpbitTradeMarket } = useUpbitApiStore(
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
      return await useUpbitApiStore.getState().getOrders({ market: upbitTradeMarket });
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

  return (
    <div className='h-full bg-base-300'>
      <UpbitOrdersInner orders={orders} mutate={mutate} />
    </div>
  );
};

interface UpbitOrdersInnerProps {
  orders: Array<IUpbitGetOrderResponse>;
  mutate: () => void;
}

const UpbitOrdersInner: FC<UpbitOrdersInnerProps> = ({ orders, mutate }) => {
  const handleClickCancelBtn = (uuid: string) => async () => {
    await useUpbitApiStore
      .getState()
      .deleteOrder({ uuid })
      .then(() => {
        toast.success('주문이 취소되었습니다.');
        mutate();
      })
      .catch(() => {
        toast.error('주문을 취소하지 못 했습니다.');
      });
  };

  return (
    <div className='grid grid-cols-[1fr_1fr_1fr_2fr_auto] px-1 text-xs whitespace-nowrap text-right [&>div]:border-b-[1px] [&>div]:border-zinc-800 [&>div]:p-1 overflow-y-auto'>
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
