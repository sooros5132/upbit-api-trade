import { useEffect } from 'react';
import shallow from 'zustand/shallow';
import { useSiteSettingStore } from 'src/store/siteSetting';
import Header from './header/Header';
import Footer from './footer/Footer';

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
      <Header />
      {children}
      <Footer />
    </div>
  );
};

export default Layout;
