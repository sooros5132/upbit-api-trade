import type { AppProps } from 'next/app';
import { NextSeo } from 'next-seo';
import Layout from 'src/components/Layout';
import Script from 'next/script';
import Head from 'next/head';
import { useTradingViewSettingStore } from 'src/store/tradingViewSetting';
import { ToastContainer } from 'react-toastify';
import 'src/styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';

// 'sm': '640px',
// 'md': '768px',
// 'lg': '1024px',
// 'xl': '1280px',
// '2xl': '1536px',
declare global {
  interface Window {
    TradingView?: any;
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <NextSeo
        title='SOOROS'
        defaultTitle='SOOROS'
        openGraph={{
          url: 'https://crypto.sooros.com',
          title: 'sooros',
          description: '실시간 업비트 - 바이낸스 프리미엄 시세를 볼 수 있습니다.',
          locale: 'ko_KR',
          type: 'website'
        }}
        description='실시간 업비트 - 바이낸스 프리미엄 시세를 볼 수 있습니다.'
      />
      <Head>
        <meta name='viewport' content='initial-scale=1, width=device-width' />
      </Head>
      <Script
        src='https://s3.tradingview.com/tv.js'
        onLoad={() => useTradingViewSettingStore.setState({ scriptLoaded: true })}
      />
      <Script src='https://www.googletagmanager.com/gtag/js?id=G-VYNSSXH1VE' />
      <Script id='google-analytics' strategy='afterInteractive'>
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'G-VYNSSXH1VE');`}
      </Script>
      <Layout>
        <Component {...pageProps} />
        <ToastContainer closeButton theme='dark' closeOnClick={false} position='bottom-right' />
      </Layout>
    </>
  );
}

export default MyApp;
