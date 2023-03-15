import Link from 'next/link';
import { SiGithub, SiMaildotru } from 'react-icons/si';
import { RiGitRepositoryFill } from 'react-icons/ri';
import { AiFillWarning } from 'react-icons/ai';

interface FooterProps {}

const Footer: React.FC<FooterProps> = ({}) => {
  return (
    <>
      <footer className='sticky bottom-0 left-0 py-1 border-t bg-base-200 border-base-300 text-xs sm:text-sm lg:text-md'>
        <div className='w-full flex items-center gap-x-1 px-1 sm:px-2 sm:gap-x-2'>
          <div className='flex grow shrink-0 items-center sm:gap-x-1'>
            <p className='font-bold hidden xs:block'>SOOROS</p>
            <div className='dropdown dropdown-hover dropdown-right dropdown-top'>
              <div className='text-yellow-400'>
                <AiFillWarning />
              </div>
              <div className='dropdown-content w-[75vw] md:w-[50vw] bg-base-100 rounded-xl text-sm overflow-hidden'>
                <div className='bg-yellow-700/20 p-3 py-2'>
                  <Link href='https://crypto.sooros.com/'>
                    <a className='underline'>crypto.sooros.com</a>
                  </Link>
                  은 토이프로젝트&amp;개인사용 목적으로 만들어진 사이트이며 사이트 내 모든 암호화폐
                  가격 정보에 대하여 어떠한 책임을 지지 않습니다. 디지털 자산 투자에 대한 금전적
                  손실은 본인 책임이며 투자에 유의하시기 바랍니다.
                </div>
              </div>
            </div>
          </div>
          <div className='text-gray-500 whitespace-nowrap hover:[&_a]:underline [&_a]:text-gray-400 text-xs'>
            Powered by{' '}
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
          </div>
          <div className='items-center h-full md:place-self-center md:justify-self-end'>
            <div className='grid grid-flow-col gap-x-2'>
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
