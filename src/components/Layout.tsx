import Header from './header/Header';
import Footer from './footer/Footer';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className='flex flex-col min-w-[320px] min-h-screen supports-[min-height:100dvh]:min-h-dvh-100 lg:min-h-0 lg:h-screen lg:supports-[height:100dvh]:h-dvh-100'>
      <Header />
      {children}
      <Footer />
    </div>
  );
};

export default Layout;
