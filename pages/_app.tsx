import type { AppProps } from 'next/app';
import { NextSeo } from 'next-seo';
import { createUpbitAuthStore, UpbitAuthStoreProvider } from 'src/store/upbitAuth';
import Layout from 'src/components/Layout';
import CommonTheme, { CommonCustomTheme } from 'src/styles/CommomTheme';
import { SnackbarKey, SnackbarProvider } from 'notistack';
import { createRef } from 'react';
import { Button } from '@mui/material';
import { createUpbitDataStore, UpbitDataStoreProvider } from 'src/store/upbitData';
import { createSiteSettingStore, SiteSettingStoreProvider } from 'src/store/siteSetting';
import Script from 'next/script';

// xs, extra-small: 0px
// sm, small: 600px
// md, medium: 900px
// lg, large: 1200px
// xl, extra-large: 1536px
declare module '@mui/material/styles' {
  interface Theme {
    size: typeof CommonCustomTheme.size;
    color: typeof CommonCustomTheme.color;
    mediaQuery: typeof CommonCustomTheme.mediaQuery;
  }
  interface ThemeOptions {
    size?: typeof CommonCustomTheme.size;
    color?: typeof CommonCustomTheme.color;
    mediaQuery?: typeof CommonCustomTheme.mediaQuery;
  }
}
declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    containedGray: true;
    outlinedGray: true;
    textGray: true;
    containedDisable: true;
    outlinedDisable: true;
    textDisable: true;
  }
}
declare global {
  interface Window {
    TradingView?: any;
  }
}

const notistackRef = createRef<SnackbarProvider>();

const onClickDismiss = (key: SnackbarKey) => () => {
  notistackRef?.current?.closeSnackbar(key);
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SnackbarProvider
      ref={notistackRef}
      maxSnack={3}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right'
      }}
      action={(key) => (
        <Button
          sx={{ minWidth: 0, p: '0.2em', px: '0.6em', color: 'inherit' }}
          onClick={onClickDismiss(key)}
        >
          닫기
        </Button>
      )}
      hideIconVariant={false}
      preventDuplicate
      // TransitionComponent={(props)=>(<Slide {...props} direction="right" >{props.children}</Slide>)}
    >
      <NextSeo
        title="SOOROS"
        defaultTitle="SOOROS"
        openGraph={{
          url: 'https://sooros.com',
          title: 'sooros',
          description: '실시간 업비트 - 바이낸스 프리미엄 시세를 볼 수 있습니다.',
          locale: 'ko_KR',
          type: 'website'
        }}
        description="실시간 업비트 - 바이낸스 프리미엄 시세를 볼 수 있습니다."
      >
        <link rel="icon" href="/favicon.ico" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </NextSeo>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-VYNSSXH1VE"
        strategy="beforeInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'G-VYNSSXH1VE');`}
      </Script>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SnackbarProvider>
  );
}

export default MyApp;
