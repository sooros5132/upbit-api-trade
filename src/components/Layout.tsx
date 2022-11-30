import Header from './header/Header';
import Footer from './footer/Footer';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className='flex flex-col h-full min-h-screen lg:min-h-[800px] lg:h-screen'>
      <Header />
      {children}
      <Footer />
    </div>
  );
};

export default Layout;
