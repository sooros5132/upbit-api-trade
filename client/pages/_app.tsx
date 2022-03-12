import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { createStore, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { ThemeProvider } from "styled-components";
import rootReducer from "src/store";
import logger from "redux-logger";
import theme from "src/styles/theme";
import GlobalStyle from "src/styles/globalStyle";
import AppRoot from "src/components/AppRoot";
import { RootState } from "src/store";
import { persistStore } from "redux-persist";
import { NextSeo } from "next-seo";
import Head from "next/head";

type CustomTheme = typeof theme;

declare module "styled-components" {
  interface DefaultTheme extends CustomTheme {}
}

declare module "react-redux" {
  interface DefaultRootState extends RootState {}
}

const store =
  process.env.NODE_ENV !== "production"
    ? createStore(rootReducer, composeWithDevTools(applyMiddleware(logger)))
    : createStore(rootReducer);

const persistor = persistStore(store);

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider theme={theme}>
          <GlobalStyle />
          <Head>
            <link rel="icon" href="/favicon.ico" />
            <meta charSet="utf-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
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
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
          </NextSeo>
          <AppRoot>
            <Component {...pageProps} />
          </AppRoot>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

export default MyApp;
