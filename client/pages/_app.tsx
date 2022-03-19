import type { AppProps } from 'next/app';
import { NextSeo } from 'next-seo';
import { createUpbitAuthStore, UpbitAuthStoreProvider } from 'src/store/upbitAuth';
import Layout from 'src/components/Layout';
import { createThemeStore, ThemeStoreProvider } from 'src/store/theme';
import CommonTheme from 'src/styles/CommomTheme';

// xs, extra-small: 0px
// sm, small: 600px
// md, medium: 900px
// lg, large: 1200px
// xl, extra-large: 1536px
declare module '@mui/material/styles' {
  interface Theme {
    size: typeof CommonTheme.size;
    color: typeof CommonTheme.color;
    mediaQuery: typeof CommonTheme.mediaQuery;
  }
  interface ThemeOptions {
    size?: typeof CommonTheme.size;
    color?: typeof CommonTheme.color;
    mediaQuery?: typeof CommonTheme.mediaQuery;
  }
}
declare global {
  interface Window {
    TradingView?: any;
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeStoreProvider createStore={createThemeStore}>
      <UpbitAuthStoreProvider createStore={createUpbitAuthStore}>
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
        >
          <link rel="icon" href="/favicon.ico" />
          <meta charSet="utf-8" />
          <meta name="viewport" content="initial-scale=1, width=device-width" />
        </NextSeo>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </UpbitAuthStoreProvider>
    </ThemeStoreProvider>
  );
}

export default MyApp;
