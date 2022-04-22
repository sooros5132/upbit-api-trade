import React from 'react';
import {
  createTheme,
  ThemeOptions,
  ThemeProvider as MuiThemeProvider,
  Theme as MuiTheme,
  styled,
  useTheme
} from '@mui/material/styles';
import Footer from './footer/Footer';
import Header from './header/Header';
import { FlexColumnHeight100Box } from './modules/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { useThemeStore } from 'src/store/theme';
import _ from 'lodash';
import CommonTheme from 'src/styles/CommomTheme';
import darkScrollbar from '@mui/material/darkScrollbar';
import LightTheme from 'src/styles/LightTheme';
import DarkTheme from 'src/styles/DarkTheme';
import { useSiteSettingStore } from 'src/store/siteSetting';

const LayoutContainer = styled(FlexColumnHeight100Box)`
  min-width: 250px;
  min-height: 100vh;
`;

const MainBox = styled('main')`
  flex: 1 0 auto;
`;

interface LayoutProps {}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme: themeMode, fontSize: siteFontSize } = useSiteSettingStore((state) => ({
    fontSize: state.fontSize,
    theme: state.theme
  }));
  const themes = useTheme();

  const theme = React.useMemo(() => {
    let theme: MuiTheme;
    const fontSize: ThemeOptions = {
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            html: {
              fontSize: siteFontSize,
              [`${themes.breakpoints.down('sm')}`]: {
                fontSize: siteFontSize * 0.8571428571428571
              }
            },
            body: themeMode === 'dark' ? { ...darkScrollbar() } : {}
          }
        }
      }
    };
    switch (themeMode) {
      case 'light': {
        theme = createTheme(_.merge(fontSize, CommonTheme, LightTheme));
        break;
      }
      case 'dark': {
        theme = createTheme(_.merge(fontSize, CommonTheme, DarkTheme));
        break;
      }
    }
    return theme;
  }, [siteFontSize, themeMode, themes.breakpoints]);

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
