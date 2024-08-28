import classNames from 'classnames';
import { cloneDeep, uniqWith, isEqual as lodashIsEqual } from 'lodash';
import React, { useState, useEffect, memo } from 'react';
import isEqual from 'react-fast-compare';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { toast } from 'react-toastify';
import { ResolutionString } from 'src/charting_library/charting_library';
import { useExchangeStore } from 'src/store/exchangeSockets';
import { defaultSubscribeChartCodes, useSiteSettingStore } from 'src/store/siteSetting';
import { krwRegex, usdtRegex } from 'src/utils/regex';
import { TVChart } from '../TVChart';
import Link from 'next/link';

export interface ChartProps {
  chart: {
    exchange: 'BINANCE' | 'UPBIT';
    code: string;
  };
  setChart: (chart: ChartProps['chart']) => void;
}

export const Chart = memo(() => {
  const [isReady, setIsReady] = useState(false);
  const { subscribeChartCodes } = useSiteSettingStore(({ subscribeChartCodes }) => ({
    subscribeChartCodes
  }));

  useEffect(() => {
    const interval = setInterval(() => {
      const { upbitSocket, binanceSocket } = useExchangeStore.getState();
      if (!upbitSocket || upbitSocket.readyState !== upbitSocket.OPEN) {
        return;
      }
      if (!binanceSocket || binanceSocket.readyState !== binanceSocket.OPEN) {
        return;
      }

      setIsReady(true);
      clearInterval(interval);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  if (!isReady) {
    return (
      <div className='animate-pulse flex-center flex-col gap-2 h-full bg-base-200 p-5'>
        <div className='animate-spin text-3xl'>
          <AiOutlineLoading3Quarters />
        </div>
        <div className='text-center'>
          <div>TradingView 차트를 준비 중 입니다.</div>
          <div>
            수 초 내에 연결이 되지 않을 경우 새로고침을 해주세요.
            <br />
            업비트 또는 바이낸스 연결에 실패한 경우입니다.
          </div>
        </div>
      </div>
    );
  }
  const handleClickChartUnitChange = (number: number) => () => {
    const newSubscribeChartCodes = uniqWith(
      cloneDeep(subscribeChartCodes).concat(defaultSubscribeChartCodes),
      lodashIsEqual
    );

    useSiteSettingStore.getState().setSubscribeChartCodes(newSubscribeChartCodes.slice(0, number));
  };

  return (
    <div className='flex flex-col h-full'>
      <div className='w-full flex items-center grow-0 shrink-0 px-2 gap-2 bg-base-200 text-xs'>
        <div className='tooltip tooltip-right' data-tip='차트가 많을수록 부하가 심합니다.'>
          차트 개수{' '}
        </div>
        <div className='btn-group gap-1'>
          <button
            onClick={handleClickChartUnitChange(1)}
            className={classNames(
              'btn btn-xs',
              subscribeChartCodes.length === 1 ? 'btn-active' : null
            )}
          >
            1
          </button>
          <button
            onClick={handleClickChartUnitChange(2)}
            className={classNames(
              'btn btn-xs',
              subscribeChartCodes.length === 2 ? 'btn-active' : null
            )}
          >
            2
          </button>
          <button
            onClick={handleClickChartUnitChange(3)}
            className={classNames(
              'btn btn-xs',
              subscribeChartCodes.length === 3 ? 'btn-active' : null
            )}
          >
            3
          </button>
          <button
            onClick={handleClickChartUnitChange(4)}
            className={classNames(
              'btn btn-xs',
              subscribeChartCodes.length === 4 ? 'btn-active' : null
            )}
          >
            4
          </button>
        </div>
      </div>
      <div
        className={classNames(
          'flex-auto [&>div]:flex-auto sm:[&>div]:h-[45vh] lg:[&>div]:h-[initial] lg:[&>div]:min-h-[18rem] overflow-y-auto',
          subscribeChartCodes.length === 1 ? '[&>div]:h-[45vh]' : '[&>div]:h-[35vh]',
          subscribeChartCodes.length > 3 ? 'grid grid-cols-2' : 'flex flex-col'
        )}
      >
        {subscribeChartCodes.map((chart) => (
          <ChartInner key={`${chart?.exchange}@${chart?.code}`} chart={chart} />
        ))}
      </div>
      <div className='py-1 border-t bg-base-200 border-base-300 text-zinc-400 text-xs text-center overflow-hidden'>
        차트 솔루션은 글로벌 커뮤니티를 위한 차트 플랫폼인{' '}
        <Link href='http://tradingview.com/'>
          <a rel='noreferrer' target='_blank' className='underline text-primary-content'>
            트레이딩뷰
          </a>
        </Link>
        에서 제공합니다.{' '}
        <Link href='https://kr.tradingview.com/economic-calendar/'>
          <a rel='noreferrer' target='_blank' className='underline text-primary-content'>
            이코노믹 캘린더
          </a>
        </Link>{' '}
        또는{' '}
        <Link href='https://kr.tradingview.com/screener/'>
          <a rel='noreferrer' target='_blank' className='underline text-primary-content'>
            스탁 스크리너
          </a>
        </Link>
        와 같은 고급 분석 도구를 통해 종합적인 시장 분석에 기반한 거래를 할 수 있습니다.
      </div>
    </div>
  );
}, isEqual);

Chart.displayName = 'Chart';

export const ChartInner: React.FC<Pick<ChartProps, 'chart'>> = memo(
  ({ chart }) => {
    useEffect(() => {
      if (!chart) {
        return;
      }

      switch (chart.exchange) {
        case 'UPBIT': {
          const upbitSymbol = 'KRW-' + chart.code;
          const { addUpbitTradeCode } = useExchangeStore.getState();
          addUpbitTradeCode(upbitSymbol);

          return () => {
            const { deleteUpbitTradeCode } = useExchangeStore.getState();
            deleteUpbitTradeCode(upbitSymbol);
          };
        }
        case 'BINANCE': {
          const binanceSymbol = chart.code.toLowerCase() + 'usdt@aggTrade';
          const { addBinanceTradeCode } = useExchangeStore.getState();
          addBinanceTradeCode(binanceSymbol);

          return () => {
            const { deleteBinanceTradeCode } = useExchangeStore.getState();
            deleteBinanceTradeCode(binanceSymbol);
          };
        }
        default: {
          return;
        }
      }
    }, [chart]);

    return (
      <div className='flex flex-col'>
        <div className='flex-auto flex-grow-0 flex-shrink-0'>
          <SelectChart chart={chart} />
        </div>
        {chart?.exchange === 'BINANCE' ? (
          <TVChart
            interval={'15' as ResolutionString}
            symbol={chart?.code + 'USDT'}
            currency={chart?.code}
            exchange={'BINANCE'}
          />
        ) : chart?.exchange === 'UPBIT' ? (
          <TVChart
            interval={'15' as ResolutionString}
            symbol={chart?.code + 'KRW'}
            currency={chart?.code}
            exchange={'UPBIT'}
          />
        ) : (
          <div className='flex-center h-full bg-base-200'>상단에서 차트를 선택해주세요</div>
        )}
      </div>
    );
  },
  (prev, next) => {
    return prev.chart.code === next.chart.code && prev.chart.exchange === next.chart.exchange;
  }
);

ChartInner.displayName = 'ChartInner';

const SelectChart: React.FC<Pick<ChartProps, 'chart'>> = ({ chart }) => {
  const { binanceMarkets, upbitMarkets } = useExchangeStore.getState();
  const [selected, setSelected] = useState(`${chart?.exchange}@${chart?.code}`);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const [exchange, code] = event.target.value.split('@');
    if (!exchange || !code || (exchange !== 'BINANCE' && exchange !== 'UPBIT')) {
      return;
    }
    const newChart = {
      exchange,
      code
    } as const;

    const newSubscribeChartCodes = [...useSiteSettingStore.getState().subscribeChartCodes];
    const duplicateCheck = newSubscribeChartCodes.find(
      (chartTemp) => chartTemp.code === newChart.code && chartTemp.exchange === newChart.exchange
    );
    if (duplicateCheck) {
      toast.warn('선택한 차트는 이미 있습니다. 다른 차트를 선택해주세요');
      return;
    }

    const findIndex = newSubscribeChartCodes.findIndex(
      (chartTemp) => chartTemp.code === chart.code && chartTemp.exchange === chart.exchange
    );
    if (findIndex !== -1) {
      newSubscribeChartCodes.splice(findIndex, 1, newChart);
      useSiteSettingStore.getState().setSubscribeChartCodes(newSubscribeChartCodes);
    }
    setSelected(`${exchange}@${code}`);
  };

  return (
    <div className='form-control bg-base-100'>
      <label className='input-group overflow-hidden'>
        <select
          placeholder='차트 선택'
          className='select select-ghost select-sm flex-grow min-w-0 w-full'
          value={selected}
          onChange={handleChange}
        >
          <option value=''>차트 선택</option>
          {upbitMarkets.map((market) => {
            const code = market.market.replace(krwRegex, '');
            return (
              <option key={market.market} value={'UPBIT@' + code}>
                {'업비트:' + market.korean_name}
              </option>
            );
          })}
          {binanceMarkets.map((market) => {
            const code = market.market.replace(usdtRegex, '');
            return (
              <option key={market.market} value={'BINANCE@' + code}>
                {'바이낸스:' + market.korean_name}
              </option>
            );
          })}
        </select>
      </label>
    </div>
  );
};
