import { useEffect } from 'react';
import shallow from 'zustand/shallow';
import { useThemeStore } from 'src/store/theme';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const themeStore = useThemeStore((state) => state, shallow);

  // React.useEffect(() => {
  //   const handleRouteChangeStart = (url: string) => {

  //   };
  //   router.events.on('routeChangeStart', handleRouteChangeStart);
  //   return () => router.events.off('routeChangeStart', handleRouteChangeStart);
  // }, [router.events, router]);

  useEffect(() => {
    if (themeStore.mode) {
      document.documentElement.dataset.theme = themeStore.mode;
    }
  }, [themeStore]);

  return (
    <div className='flex flex-col h-full min-h-screen'>
      {/* <Header></Header> */}
      {children}
      {/* <Footer></Footer> */}
    </div>
  );
};

export default Layout;
