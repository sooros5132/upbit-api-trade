import React, { useEffect, useRef, useState } from 'react';
import { AiFillSetting } from 'react-icons/ai';
import Link from 'next/link';
import TradingViewTapeWidget from '../tradingview/Tape';
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
import classNames from 'classnames';

const Header: React.FC = () => {
  const upbitAuth = useUpbitAuthStore();
  const { showMyAccounts, setShowMyAccounts } = useSiteSettingStore(
    ({ setShowMyAccounts, showMyAccounts }) => ({
      setShowMyAccounts,
      showMyAccounts
    }),
    shallow
  );
  const { highlight, stickyChart } = useMarketTableSettingStore(
    ({ highlight, stickyChart }) => ({ highlight, stickyChart }),
    shallow
  );
  const [openRegisterUpbitApiDialog, setOpenRegisterUpbitApiDialog] = useState(false);
  const [accountEl, setAccountEl] = useState<null | HTMLElement>(null);
  const [isMounted, setMounted] = useState(false);
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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!headerRef.current) {
      return;
    }
    const headerEl = headerRef.current;

    useSiteSettingStore.setState({ headerHeight: headerEl.offsetHeight });

    const handleResize = (evt: UIEvent) => {
      useSiteSettingStore.setState({ headerHeight: headerEl.offsetHeight });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [showMyAccounts]);

  const handleClickMenuItem =
    (prop: 'logout' | 'showMyAccounts' | 'highlight' | 'upbitApiConnect' | 'stickyChart') =>
    (event: React.MouseEvent<HTMLLIElement>) => {
      switch (prop) {
        case 'logout': {
          upbitAuth.deleteKeys();
          setAccountEl(null);
          break;
        }
        case 'showMyAccounts': {
          setShowMyAccounts(!showMyAccounts);
          break;
        }
        case 'highlight': {
          useMarketTableSettingStore.setState((state) => ({
            highlight: !state.highlight
          }));
          break;
        }
        case 'stickyChart': {
          useMarketTableSettingStore.setState((state) => ({
            stickyChart: !state.stickyChart
          }));
          break;
        }
        case 'upbitApiConnect': {
          setOpenRegisterUpbitApiDialog(true);
          break;
        }
      }
    };

  const handleClickOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAccountEl(event.currentTarget);
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
        <div className='px-2.5 basis-full'>
          <TradingViewTapeWidget />
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
            <li onClickCapture={handleClickMenuItem('stickyChart')}>
              <button className='justify-between font-normal btn btn-ghost'>
                <span className='label-text'>차트 상단 고정</span>
                <input
                  type='checkbox'
                  checked={stickyChart}
                  readOnly
                  className='checkbox checkbox-sm'
                />
              </button>
            </li>
            {isMounted && upbitAuth.secretKey
              ? [
                  <div key={'header-menu-divider'} className='m-0 divider' />,
                  <li
                    key={'header-menu-showMyAccounts'}
                    onClick={handleClickMenuItem('showMyAccounts')}
                  >
                    <button className='justify-between font-normal btn btn-ghost'>
                      <span className='label-text'>잔고 표시</span>
                      <input
                        type='checkbox'
                        checked={showMyAccounts}
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
          </ul>
        </div>
      </div>
      {isMounted && showMyAccounts && upbitAuth.accounts.length ? (
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

Header.displayName = 'Header';

export default Header;
