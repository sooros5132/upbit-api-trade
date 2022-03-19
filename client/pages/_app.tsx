import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "styled-components";
import theme from "src/styles/theme";
import GlobalStyle from "src/styles/globalStyle";
import AppRoot from "src/components/AppRoot";
import { NextSeo } from "next-seo";
import Head from "next/head";
import {
  createUpbitAuthStore,
  UpbitAuthStoreProvider,
} from "src/store/upbitAuth";

type CustomTheme = typeof theme;

declare module "styled-components" {
  interface DefaultTheme extends CustomTheme {}
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UpbitAuthStoreProvider createStore={createUpbitAuthStore}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <NextSeo
          title="SOOROS"
          defaultTitle="SOOROS"
          openGraph={{
            url: "https://sooros.com",
            title: "sooros",
            description:
              "실시간 업비트 - 바이낸스 프리미엄 시세를 볼 수 있습니다.",
            locale: "ko_KR",
            type: "website",
          }}
        >
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </NextSeo>
        <AppRoot>
          <Component {...pageProps} />
        </AppRoot>
      </ThemeProvider>
    </UpbitAuthStoreProvider>
  );
}

export default MyApp;
