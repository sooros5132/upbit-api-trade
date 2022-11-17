import Link from 'next/link';
import { SiGithub, SiMaildotru } from 'react-icons/si';
import { RiGitRepositoryFill } from 'react-icons/ri';
import { FaSlackHash } from 'react-icons/fa';

interface FooterProps {}

const Footer: React.FC<FooterProps> = ({}) => {
  return (
    <>
      <footer className='p-10 footer bg-base-200 text-base-content'>
        <div className='mx-auto max-w-7xl'>
          <p>
            <Link href='https://crypto.sooros.com/'>
              <a className='hover:underline'>crypto.sooros.com</a>
            </Link>
            은 토이프로젝트&amp;개인사용 목적으로 만들어진 사이트이며 사이트 내 모든 암호화폐 가격
            정보에 대하여 어떠한 책임을 지지 않습니다.
            <br />
            디지털 자산 투자에 대한 금전적 손실은 본인 책임이며 투자에 유의하시기 바랍니다.
          </p>
          <p className='w-full text-right text-gray-500 hover:[&>a]:underline'>
            powerd by{' '}
            <a href='https://upbit.com/' rel='noreferrer' target='_blank'>
              Upbit
            </a>
            ,{' '}
            <a href='https://www.binance.com/' rel='noreferrer' target='_blank'>
              Binance
            </a>
            ,{' '}
            <a href='https://vercel.com/' rel='noreferrer' target='_blank'>
              Vercel
            </a>
            ,{' '}
            <a href='https://www.tradingview.com/' rel='noreferrer' target='_blank'>
              TradingView
            </a>
          </p>
        </div>
      </footer>
      <footer className='px-10 py-4 border-t footer bg-base-200 text-base-content border-base-300'>
        <div className='w-full mx-auto flex-center max-w-7xl'>
          <div className='flex items-center flex-1 grid-flow-col text-3xl gap-x-2'>
            <FaSlackHash />
            <p className='font-bold'>SOOROS</p>
          </div>
          <div className='items-center h-full md:place-self-center md:justify-self-end'>
            <div className='grid grid-flow-col gap-4 text-2xl'>
              <a href='mailto:contact@sooros.com'>
                <div>
                  <SiMaildotru />
                </div>
              </a>
              <a href='https://github.com/sooros5132' rel='noreferrer' target='_blank'>
                <div>
                  <SiGithub />
                </div>
              </a>
              <a
                href='https://github.com/sooros5132/upbit-realtime-premium'
                rel='noreferrer'
                target='_blank'
              >
                <div>
                  <RiGitRepositoryFill />
                </div>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

Footer.displayName = 'Footer';

export default Footer;
