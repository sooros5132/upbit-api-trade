import React, { useRef, useState } from 'react';
import { AiFillSetting } from 'react-icons/ai';
import Link from 'next/link';
import { useUpbitAuthStore } from 'src/store/upbitAuth';
import MyAccounts from './MyAccounts';
import RegisterUpbitApiFormDialog from './RegisterUpbitApiFormDialog';
import { useSiteSettingStore } from 'src/store/siteSetting';
import { useMarketTableSettingStore } from 'src/store/marketTableSetting';
import shallow from 'zustand/shallow';
import { FaSlackHash } from 'react-icons/fa';
import { GoPrimitiveDot } from 'react-icons/go';
import { useExchangeStore } from 'src/store/exchangeSockets';
import { toast } from 'react-toastify';
import { IoMdRefresh } from 'react-icons/io';
import useSWR from 'swr';
import { apiUrls } from 'src/lib/apiUrls';
import { IUpbitForex } from 'src/types/upbit';
import type { ICoincodexGetMetadataPick } from 'src/types/coincodex';
import numeral from 'numeral';
import formatInTimeZone from 'date-fns-tz/formatInTimeZone';
import { ko as koLocale } from 'date-fns/locale';
import classNames from 'classnames';

const Header: React.FC = () => {
  const upbitAuth = useUpbitAuthStore();
  const {
    hideMyAccounts,
    hideTradingPanel,
    showMyAccounts,
    showTradingPanel,
    visibleMyAccounts,
    visibleTradingPanel,
    hydrated
  } = useSiteSettingStore(
    ({
      hideMyAccounts,
      hideTradingPanel,
      showMyAccounts,
      showTradingPanel,
      visibleMyAccounts,
      visibleTradingPanel,
      hydrated
    }) => ({
      hideMyAccounts,
      hideTradingPanel,
      showMyAccounts,
      showTradingPanel,
      visibleMyAccounts,
      visibleTradingPanel,
      hydrated
    }),
    shallow
  );
  const { highlight } = useMarketTableSettingStore(({ highlight }) => ({ highlight }), shallow);
  const [openRegisterUpbitApiDialog, setOpenRegisterUpbitApiDialog] = useState(false);
  const headerRef = useRef<HTMLHeadElement>(null);
  const { connectedUpbit, connectedBinance } = useExchangeStore(
    ({ upbitSocket, binanceSocket }) => {
      let connectedUpbit = false;
      let connectedBinance = false;
      if (upbitSocket?.readyState === 1) {
        connectedUpbit = true;
      }
      if (binanceSocket?.readyState === 1) {
        connectedBinance = true;
      }
      return {
        connectedUpbit,
        connectedBinance
      };
    },
    shallow
  );

  // useEffect(() => {
  //   if (!headerRef.current) {
  //     return;
  //   }
  //   const headerEl = headerRef.current;

  //   useSiteSettingStore.setState({ headerHeight: headerEl.offsetHeight });

  //   const handleResize = (evt: UIEvent) => {
  //     useSiteSettingStore.setState({ headerHeight: headerEl.offsetHeight });
  //   };

  //   window.addEventListener('resize', handleResize);

  //   return () => {
  //     window.removeEventListener('resize', handleResize);
  //   };
  // }, [showMyAccounts]);

  const handleClickMenuItem =
    (
      prop:
        | 'logout'
        | 'visibleMyAccounts'
        | 'highlight'
        | 'upbitApiConnect'
        | 'stickyChart'
        | 'visibleTradingPanel'
    ) =>
    (event: React.MouseEvent<HTMLLIElement>) => {
      switch (prop) {
        case 'logout': {
          upbitAuth.deleteKeys();
          break;
        }
        case 'visibleMyAccounts': {
          if (visibleMyAccounts) {
            hideMyAccounts();
          } else {
            showMyAccounts();
          }
          break;
        }
        case 'visibleTradingPanel': {
          if (visibleTradingPanel) {
            hideTradingPanel();
          } else {
            showTradingPanel();
          }
          break;
        }
        case 'highlight': {
          useMarketTableSettingStore.setState((state) => ({
            highlight: !state.highlight
          }));
          break;
        }
        // case 'stickyChart': {
        //   useMarketTableSettingStore.setState((state) => ({
        //     stickyChart: !state.stickyChart
        //   }));
        //   break;
        // }
        case 'upbitApiConnect': {
          setOpenRegisterUpbitApiDialog(true);
          break;
        }
      }
    };

  const handleClickConnectSocket = (prop: 'upbit' | 'binance') => () => {
    switch (prop) {
      case 'upbit': {
        const { connectUpbitSocket, disconnectUpbitSocket } = useExchangeStore.getState();
        disconnectUpbitSocket();
        toast.info('업비트 서버에 다시 연결합니다.');
        connectUpbitSocket();
        break;
      }
      case 'binance': {
        const { connectBinanceSocket, disconnectBinanceSocket } = useExchangeStore.getState();
        disconnectBinanceSocket();
        toast.info('바이낸스 서버에 다시 연결합니다.');
        connectBinanceSocket();
        break;
      }
    }
  };

  return (
    <nav className='sticky top-0 left-0 z-10 bg-base-200 px-2.5' ref={headerRef}>
      <div className='flex items-center justify-between h-11 xl:mx-auto '>
        <Link href={'/'}>
          <a>
            <button className='text-xl btn btn-circle btn-ghost btn-sm bg-base-200'>
              <FaSlackHash />
            </button>
          </a>
        </Link>
        <div className='px-2.5 basis-full text-center'>
          {/* <TradingViewTapeWidget /> */}
          <MarketInfo />
        </div>
        <div className='dropdown dropdown-end'>
          <label tabIndex={0} className='m-1 text-xl btn btn-circle btn-ghost btn-sm bg-base-200'>
            <AiFillSetting />
          </label>
          <ul
            tabIndex={0}
            className='p-2 shadow dropdown-content menu bg-base-100 rounded-box w-52 z-[10]'
          >
            <li onClickCapture={handleClickMenuItem('highlight')}>
              <button className='justify-between font-normal btn btn-ghost'>
                <span className='label-text'>시세 변경 표시</span>
                <input
                  type='checkbox'
                  checked={highlight}
                  readOnly
                  className='checkbox checkbox-sm'
                />
              </button>
            </li>
            <li onClickCapture={handleClickMenuItem('visibleTradingPanel')}>
              <button className='justify-between font-normal btn btn-ghost'>
                <span className='label-text'>트레이딩 패널 표시</span>
                <input
                  type='checkbox'
                  checked={visibleTradingPanel}
                  readOnly
                  className='checkbox checkbox-sm'
                />
              </button>
            </li>
            {hydrated && upbitAuth.secretKey
              ? [
                  <div key={'header-menu-divider'} className='m-0 divider' />,
                  <li
                    key={'header-menu-visibleMyAccounts'}
                    onClick={handleClickMenuItem('visibleMyAccounts')}
                  >
                    <button className='justify-between font-normal btn btn-ghost'>
                      <span className='label-text'>잔고 표시</span>
                      <input
                        type='checkbox'
                        checked={visibleMyAccounts}
                        readOnly
                        className='checkbox checkbox-sm'
                      />
                    </button>
                  </li>,
                  <li key={'header-menu-logout'} onClick={handleClickMenuItem('logout')}>
                    <button className='justify-between font-normal btn btn-ghost'>
                      <span className='text-red-400 label-text'>upbit API 끊기</span>
                    </button>
                  </li>
                ]
              : [
                  <div key={'header-menu-divider'} className='m-0 divider' />,
                  <li
                    key={'header-menu-api-connect'}
                    onClick={handleClickMenuItem('upbitApiConnect')}
                  >
                    <button className='justify-between font-normal btn btn-ghost'>
                      <span className='text-green-500 label-text'>upbit API 연결</span>
                    </button>
                  </li>
                ]}
            <div className='m-0 divider' />
            <li className='disabled'>
              <div className='flex justify-between'>
                <div className='flex items-center text-base-content'>
                  <div className={connectedUpbit ? 'text-green-500' : 'text-red-500'}>
                    <GoPrimitiveDot />
                  </div>
                  <span>업비트</span>
                </div>
                <button
                  className='w-6 h-6 min-h-0 btn btn-circle btn-sm btn-ghost'
                  onClick={handleClickConnectSocket('upbit')}
                >
                  <IoMdRefresh />
                </button>
              </div>
            </li>
            <li className='disabled'>
              <div className='flex justify-between'>
                <div className='flex items-center text-base-content'>
                  <div className={connectedBinance ? 'text-green-500' : 'text-red-500'}>
                    <GoPrimitiveDot />
                  </div>
                  <span>바이낸스</span>
                </div>
                <div
                  className='w-6 h-6 min-h-0 btn btn-circle btn-sm btn-ghost'
                  onClick={handleClickConnectSocket('binance')}
                >
                  <IoMdRefresh />
                </div>
              </div>
            </li>
            {/* <div className='m-0 divider' />
            <li className='disabled'>
              <UsdKrwForex />
            </li> */}
          </ul>
        </div>
      </div>
      {hydrated && visibleMyAccounts && upbitAuth.accounts.length ? (
        <div className='xl:mx-auto'>
          <MyAccounts upbitAccounts={upbitAuth.accounts} />
        </div>
      ) : null}
      {openRegisterUpbitApiDialog && (
        <RegisterUpbitApiFormDialog
          open={openRegisterUpbitApiDialog}
          onClose={(open) => setOpenRegisterUpbitApiDialog(open)}
        />
      )}
    </nav>
  );
};

const MarketInfo = () => {
  const { data: forex } = useSWR<IUpbitForex>(
    apiUrls.upbit.rewriteUrl + apiUrls.upbit.forex.recent
  );
  const { data: metadata } = useSWR<ICoincodexGetMetadataPick>(
    apiUrls.coincodex.path + apiUrls.coincodex.getMetadata
  );

  return (
    <div className='flex flex-nowrap items-center gap-x-2 text-xs sm:text-sm font-mono sm:gap-x-3'>
      {forex?.basePrice && (
        <div className='dropdown dropdown-hover [&>span]:whitespace-nowrap'>
          <span className='text-zinc-500'>USD/KRW</span>{' '}
          <span>{forex?.basePrice.toLocaleString()}₩</span>
          <div className='dropdown-content bg-base-300 p-2 whitespace-nowrap'>
            <div>
              <span>달러/원 환율</span>
            </div>
            <div className='text-zinc-500'>
              <span>
                {formatInTimeZone(new Date(forex.timestamp), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss', {
                  locale: koLocale
                })}
              </span>
            </div>
          </div>
        </div>
      )}
      {metadata?.btc_dominance && (
        <div className='dropdown dropdown-hover [&>span]:whitespace-nowrap'>
          <span className='text-zinc-500'>BTC.D</span> <span>{metadata.btc_dominance}% </span>
          <div className='dropdown-content bg-base-300 p-2 whitespace-nowrap'>
            <div>비트코인 시장 점유율</div>
            <div className='grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 bg-base-300 p-2 [&>p:nth-child(even)]:text-right'>
              <p>24시간 변동</p>
              <p
                className={
                  !metadata.btc_dominance_24h_change_percent ||
                  metadata.btc_dominance_24h_change_percent === 0
                    ? 'text-gray-400'
                    : metadata.btc_dominance_24h_change_percent > 0
                    ? 'text-teal-500'
                    : 'text-rose-500'
                }
              >
                {metadata.btc_dominance_24h_change_percent}%
              </p>
            </div>
          </div>
        </div>
      )}
      {metadata?.total_market_cap && (
        <div className='dropdown dropdown-hover [&>span]:whitespace-nowrap'>
          <span className='text-zinc-500'>Total</span>{' '}
          <span>{numeral(metadata.total_market_cap).format('0.0a').toUpperCase()}</span>
          <div className='dropdown-content bg-base-300 p-2 whitespace-nowrap'>
            <div>코인 시장 토탈(달러)</div>
            <div className='grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 bg-base-300 p-2 [&>p:nth-child(even)]:text-right'>
              <p>24시간 변동</p>
              <p
                className={
                  !metadata.total_market_cap_24h_change_percent ||
                  metadata.total_market_cap_24h_change_percent === 0
                    ? 'text-gray-400'
                    : metadata.total_market_cap_24h_change_percent > 0
                    ? 'text-teal-500'
                    : 'text-rose-500'
                }
              >
                {metadata.total_market_cap_24h_change_percent}%
              </p>
            </div>
          </div>
        </div>
      )}
      {metadata?.eth_gas && (
        <div
          className={classNames(
            'dropdown dropdown-hover [&>span]:whitespace-nowrap',
            forex ? 'dropdown-end' : null
          )}
        >
          <span className='text-zinc-500'>ETH.Gas</span>{' '}
          <span>{metadata.eth_gas.standard}Gwei</span>
          <div className='dropdown-content bg-base-300 p-2'>
            <div>
              <span>이더리움 가스 비용</span>
            </div>
            <div className='m-0 divider' />
            <div className='flex items-center flex-nowrap gap-x-2 [&>div>div:nth-of-type(3)]:text-zinc-500 whitespace-nowrap'>
              <div className='text-green-300'>
                <div className='mb-1'>느림</div>
                <div>
                  <b>{metadata.eth_gas.slow}Gwei</b>
                </div>
                <div>{metadata.eth_gas.slow_estimation}secs</div>
              </div>
              <div className='text-blue-200'>
                <div className='mb-1'>보통</div>
                <div>
                  <b>{metadata.eth_gas.standard}Gwei</b>
                </div>
                <div>{metadata.eth_gas.standard_estimation}secs</div>
              </div>
              <div className='text-red-300'>
                <div className='mb-1'>빠름</div>
                <div>
                  <b>{metadata.eth_gas.fast}Gwei</b>
                </div>
                <div>{metadata.eth_gas.fast_estimation}secs</div>
              </div>
            </div>
            <div className='m-0 divider' />
            <div className='text-zinc-500'>
              <span>
                {formatInTimeZone(
                  new Date(metadata.eth_gas.timestamp),
                  'Asia/Seoul',
                  'yyyy-MM-dd HH:mm:ss',
                  {
                    locale: koLocale
                  }
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// const UsdKrwForex = () => {
//   const { data: forexRecent } = useSWR<IUpbitForex>(
//     apiUrls.upbit.rewriteUrl + apiUrls.upbit.forex.recent
//   );

//   return (
//     <div className='tooltip tooltip-bottom' data-tip='계산에 적용된 달러 환율입니다.'>
//       <span className='text-base-content'>
//         USD/KRW {forexRecent?.basePrice?.toLocaleString() || '환율 오류'}
//       </span>
//     </div>
//   );
// };

Header.displayName = 'Header';

export default Header;
