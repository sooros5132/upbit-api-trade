import React, { useEffect, useState } from 'react';
import { Flex11AutoBox, FlexAlignItemsCenterBox, FlexSpaceBetweenCenterBox } from '../modules/Box';
import { IoLogoVercel } from 'react-icons/io5';
import { AiFillApi, AiFillSetting } from 'react-icons/ai';
import Link from 'next/link';
import TradingViewTapeWidget from '../tradingview/Tape';
import { styled, useTheme } from '@mui/material/styles';
import { Box, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import { useUpbitAuthStore } from 'src/store/upbitAuth';
import MyAccounts from './MyAccounts';
import RegisterUpbitApiFormDialog from './RegisterUpbitApiFormDialog';
import { useSiteSettingStore } from 'src/store/siteSetting';

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

const Header: React.FC = () => {
  const theme = useTheme();
  const upbitAuth = useUpbitAuthStore();
  const { showMyAccounts, setShowMyAccounts } = useSiteSettingStore();
  const [accountEl, setAccountEl] = useState<null | HTMLElement>(null);
  const [openRegisterUpbitApiDialog, setOpenRegisterUpbitApiDialog] = useState(false);
  const [isMounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClickMenuItem =
    (prop: 'logout' | 'hideAccounts' | 'showAccounts') =>
    (event: React.MouseEvent<HTMLLIElement>) => {
      switch (prop) {
        case 'logout': {
          upbitAuth.deleteKeys();
          setAccountEl(null);
          break;
        }
        case 'showAccounts': {
          setShowMyAccounts(true);
          setAccountEl(null);
          break;
        }
        case 'hideAccounts': {
          setShowMyAccounts(false);
          setAccountEl(null);
          break;
        }
      }
    };

  const handleClickOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAccountEl(event.currentTarget);
  };

  return (
    <Container>
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
        {isMounted && upbitAuth.secretKey ? (
          <>
            <HeaderIconButton onClick={handleClickOpenMenu}>
              <AiFillSetting />
            </HeaderIconButton>
            <Menu
              anchorEl={accountEl}
              keepMounted
              open={Boolean(accountEl)}
              onClose={() => setAccountEl(null)}
            >
              {showMyAccounts ? (
                <MenuItem onClick={handleClickMenuItem('hideAccounts')}>
                  <Typography>잔고 숨기기</Typography>
                </MenuItem>
              ) : (
                <MenuItem onClick={handleClickMenuItem('showAccounts')}>
                  <Typography>잔고 보기</Typography>
                </MenuItem>
              )}
              <MenuItem onClick={handleClickMenuItem('logout')}>
                <Typography sx={{ color: theme.color.redMain }}>연동 해제</Typography>
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Tooltip title="API 연결" arrow>
            <HeaderIconButton onClick={() => setOpenRegisterUpbitApiDialog(true)}>
              <AiFillApi />
            </HeaderIconButton>
          </Tooltip>
        )}
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
