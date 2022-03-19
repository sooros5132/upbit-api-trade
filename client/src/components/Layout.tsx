import { NextPage } from 'next';
import React from 'react';
import {
  createTheme,
  ThemeOptions,
  ThemeProvider as MuiThemeProvider,
  Theme as MuiTheme,
  styled
} from '@mui/material/styles';
import Footer from './footer/Footer';
import Header from './header/Header';
import { FlexColumnHeight100Box } from './modules/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { useThemeStore } from 'src/store/theme';
import _ from 'lodash';
import CommonTheme from 'src/styles/CommomTheme';
import darkScrollbar from '@mui/material/darkScrollbar';

const LayoutContainer = styled(FlexColumnHeight100Box)`
  min-height: 100vh;
`;

const MainBox = styled('main')`
  flex: 1 0 auto;
`;

interface LayoutProps {}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const themeStore = useThemeStore();

  const theme = React.useMemo(() => {
    let theme: MuiTheme;
    const fontSize: ThemeOptions = {
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            html: {
              fontSize: themeStore.fontSize
            },
            body: themeStore.mode === 'dark' ? { ...darkScrollbar() } : {}
          }
        }
      }
    };
    switch (themeStore.mode) {
      case 'light': {
        theme = createTheme(_.merge(fontSize, CommonTheme));
        break;
      }
      case 'dark': {
        theme = createTheme(_.merge(fontSize, CommonTheme));
        break;
      }
    }
    return theme;
  }, [themeStore]);

  return (
    <MuiThemeProvider<MuiTheme> theme={theme}>
      <CssBaseline />
      <LayoutContainer>
        <Header></Header>
        {children}
        <Footer></Footer>
      </LayoutContainer>
    </MuiThemeProvider>
  );
};

export default Layout;
