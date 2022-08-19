import React, { useEffect, useRef, useState } from 'react';
import { Flex11AutoBox, FlexAlignItemsCenterBox, FlexSpaceBetweenCenterBox } from '../modules/Box';
import { IoLogoVercel } from 'react-icons/io5';
import { AiFillApi, AiFillSetting } from 'react-icons/ai';
import Link from 'next/link';
import TradingViewTapeWidget from '../tradingview/Tape';
import { styled, useTheme } from '@mui/material/styles';
import { Box, Divider, IconButton, Menu, MenuItem, Switch, Typography } from '@mui/material';
import { useUpbitAuthStore } from 'src/store/upbitAuth';
import MyAccounts from './MyAccounts';
import RegisterUpbitApiFormDialog from './RegisterUpbitApiFormDialog';
import { useSiteSettingStore } from 'src/store/siteSetting';
import { useMarketTableSettingStore } from 'src/store/marketTableSetting';
import shallow from 'zustand/shallow';

const Container = styled('header')`
  position: sticky;
  top: 0;
  left: 0;
  z-index: 1;
  background-color: ${({ theme }) => theme.color.mainDeepDrakBackground};
  padding: 0 ${({ theme }) => theme.spacing(1.25)};
`;

const Inner = styled(FlexSpaceBetweenCenterBox)`
  height: ${({ theme }) => theme.spacing(5.5)};
  font-size: ${({ theme }) => theme.size.px20};
  ${({ theme }) => theme.mediaQuery.desktop} {
    /* max-width: 1200px; */
    margin: 0 auto;
  }
`;
const AccountsConintainer = styled(Box)`
  ${({ theme }) => theme.mediaQuery.desktop} {
    /* max-width: 1200px; */
    margin: 0 auto;
  }
`;

const LogoBox = styled(FlexSpaceBetweenCenterBox)(({ theme }) => ({
  color: theme.color.mainLightText
}));

const TapeWidget = styled(Flex11AutoBox)`
  padding: 0 ${({ theme }) => theme.spacing(1.25)};
`;

const HeaderIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.color.mainLightText
}));

const MenuItemInner = styled(FlexSpaceBetweenCenterBox)({
  width: '100%',
  minWidth: 120
});

const Header: React.FC = () => {
  const theme = useTheme();
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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!headerRef.current) {
      return;
    }
    const headerEl = headerRef.current;

    useSiteSettingStore.setState({ headerHeight: headerEl.scrollHeight });

    const handleResize = (evt: UIEvent) => {
      useSiteSettingStore.setState({ headerHeight: headerEl.scrollHeight });
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

  return (
    <Container ref={headerRef}>
      <Inner>
        <FlexAlignItemsCenterBox>
          <Link href={'/'}>
            <a>
              <LogoBox>
                <IoLogoVercel />
              </LogoBox>
            </a>
          </Link>
        </FlexAlignItemsCenterBox>
        <TapeWidget>
          <TradingViewTapeWidget />
        </TapeWidget>
        <HeaderIconButton onClick={handleClickOpenMenu}>
          <AiFillSetting />
        </HeaderIconButton>
        <Menu
          anchorEl={accountEl}
          keepMounted
          open={Boolean(accountEl)}
          onClose={() => setAccountEl(null)}
        >
          <MenuItem onClick={handleClickMenuItem('highlight')}>
            <MenuItemInner>
              <Typography>하이라이트</Typography>
              <Switch size="small" checked={highlight} />
            </MenuItemInner>
          </MenuItem>
          <MenuItem onClick={handleClickMenuItem('stickyChart')}>
            <MenuItemInner>
              <Typography>차트 상단 고정</Typography>
              <Switch size="small" checked={stickyChart} />
            </MenuItemInner>
          </MenuItem>
          {isMounted && upbitAuth.secretKey
            ? [
                ,
                <MenuItem
                  key={'header-menu-showMyAccounts'}
                  onClick={handleClickMenuItem('showMyAccounts')}
                >
                  <MenuItemInner>
                    <Typography>잔고 표시</Typography>
                    <Switch size="small" checked={showMyAccounts} />
                  </MenuItemInner>
                </MenuItem>,
                <Divider key={'header-menu-divider'} />,
                <MenuItem key={'header-menu-logout'} onClick={handleClickMenuItem('logout')}>
                  <Typography sx={{ color: theme.color.redMain }}>upbit API 끊기</Typography>
                </MenuItem>
              ]
            : [
                <Divider key={'header-menu-divider'} />,
                <MenuItem
                  key={'header-menu-api-connect'}
                  onClick={handleClickMenuItem('upbitApiConnect')}
                >
                  <Typography>upbit API 연결</Typography>
                </MenuItem>
              ]}
        </Menu>
      </Inner>
      {isMounted && showMyAccounts && upbitAuth.accounts.length ? (
        <AccountsConintainer>
          <MyAccounts upbitAccounts={upbitAuth.accounts} />
        </AccountsConintainer>
      ) : null}
      <RegisterUpbitApiFormDialog
        open={openRegisterUpbitApiDialog}
        onClose={(open) => setOpenRegisterUpbitApiDialog(open)}
      />
    </Container>
  );
};

Header.displayName = 'Header';

export default Header;
