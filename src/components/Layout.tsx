import { useEffect } from 'react';
import shallow from 'zustand/shallow';
import { useSiteSettingStore } from 'src/store/siteSetting';
import Header from './header/Header';
import Footer from './footer/Footer';
import { useTradingViewSettingStore } from 'src/store/tradingViewSetting';
import { useExchangeStore } from 'src/store/exchangeSockets';
import { NextSeo } from 'next-seo';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useSiteSettingStore((state) => state.theme, shallow);

  // React.useEffect(() => {
  //   const handleRouteChangeStart = (url: string) => {

  //   };
  //   router.events.on('routeChangeStart', handleRouteChangeStart);
  //   return () => router.events.off('routeChangeStart', handleRouteChangeStart);
  // }, [router.events, router]);

  useEffect(() => {
    if (theme) {
      document.documentElement.dataset.theme = theme;
    }
  }, [theme]);

  return (
    <div className='flex flex-col h-full min-h-screen'>
      <SiteTitleSeo />
      <Header />
      {children}
      <Footer />
    </div>
  );
};

const SiteTitleSeo = () => {
  const { selectedMarketSymbol, selectedExchange } = useTradingViewSettingStore();
  const marketSymbol = 'KRW-' + selectedMarketSymbol;
  // selectedExchange === 'UPBIT'
  //   ? 'KRW-' + selectedMarketSymbol
  //   : selectedExchange === 'BINANCE'
  //   ? selectedMarketSymbol + 'USDT'
  //   : '';
  const upbitMarket = useExchangeStore((state) => state.upbitMarketDatas[marketSymbol], shallow);

  const usdPriceNum = Number(upbitMarket?.binance_price);
  const krwPriceNum = Number(upbitMarket?.tp);

  const krwPrice = krwPriceNum > 1 ? krwPriceNum.toLocaleString() : upbitMarket?.tp;
  const usdPrice = usdPriceNum > 1 ? usdPriceNum.toLocaleString() : upbitMarket?.binance_price;

  let title = 'SOOROS';
  if (upbitMarket) {
    // const titleSymbol = `KRW-${selectedMarketSymbol || 'BTC'}`;
    switch (selectedExchange) {
      case 'BINANCE': {
        title = upbitMarket.binance_price ? `${selectedMarketSymbol} ${usdPrice}$` : '';
        break;
      }
      case 'UPBIT': {
        title = `${selectedMarketSymbol} ${krwPrice}₩`;
        break;
      }
    }
  }

  return <NextSeo title={title} />;
};

export default Layout;
