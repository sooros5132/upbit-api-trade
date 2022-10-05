import Link from 'next/link';
import { SiGithub, SiMaildotru } from 'react-icons/si';
import { RiGitRepositoryFill } from 'react-icons/ri';
import { FaSlackHash } from 'react-icons/fa';

// const Container = styled('footer')(({ theme }) => ({
//   backgroundColor: theme.color.gray90,
//   color: theme.color.gray30
// }));

// const Inner = styled(FlexJustifyContentCenterBox)`
//   padding: ${({ theme }) => theme.spacing(2)} 0;
//   ${({ theme }) => theme.mediaQuery.mobile} {
//     padding: ${({ theme }) => theme.spacing(3)} 0;
//     flex-wrap: wrap;
//     flex-direction: column-reverse;
//   }
//   ${({ theme }) => theme.mediaQuery.desktop} {
//     max-width: 1200px;
//     margin: 0 auto;
//   }
// `;

// const LogoBox = styled(TextAlignCenterBox)`
//   color: ${({ theme }) => theme.color.mainLightText};
//   font-weight: bold;
//   font-size: ${({ theme }) => theme.size.px30};
// `;

// const ContactBox = styled(TextAlignCenterBox)``;

// const DescriptionContainer = styled(FlexAlignItemsCenterBox)`
//   height: 100%;
//   line-height: 1.25em;
// `;
// const DescriptionInner = styled('div')`
//   ${({ theme }) => theme.mediaQuery.mobile} {
//     padding-bottom: ${({ theme }) => theme.spacing(3)};
//     text-align: center;
//     border-left: 0;
//   }
//   border-left: 1px solid ${({ theme }) => theme.color.gray70};
//   padding: 0 ${({ theme }) => theme.spacing(4)};
//   height: 65%;
//   display: flex;
//   align-items: center;
// `;

// const ContactContainer = styled(FlexJustifyContentFlexEndBox)`
//   margin-right: ${({ theme }) => theme.spacing(1.25)};
//   padding-bottom: ${({ theme }) => theme.spacing(4)};
// `;

interface FooterProps {}

const Footer: React.FC<FooterProps> = ({}) => {
  // const { data, error } = useSWR("/key", fetch);

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
              {/* <a>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='24'
                height='24'
                viewBox='0 0 24 24'
                className='fill-current'
              >
                <path d='M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z'></path>
              </svg>
            </a>
            <a>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='24'
                height='24'
                viewBox='0 0 24 24'
                className='fill-current'
              >
                <path d='M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z'></path>
              </svg>
            </a>
            <a>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='24'
                height='24'
                viewBox='0 0 24 24'
                className='fill-current'
              >
                <path d='M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z'></path>
              </svg>
            </a> */}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

Footer.displayName = 'Footer';

export default Footer;
{
  /* <footer className='text-gray-400 bg-base-300'>
      <div className='flex flex-col-reverse py-6 mx-auto flex-warp max-w-7xl sm:py-4 sm:flex-row'>
        <div className='basis-1/3'>
          <div className='flex items-center h-full'>
            <div className='w-full'>
              <div className='text-3xl text-center text-base-200'>
                <p>SOOROS</p>
              </div>
               <ContactBox>
                <Typography>
                  <Link href="mailto:contact@sooros.com">
                    <a>contact@sooros.com</a>
                  </Link>
                </Typography>
              </ContactBox> 
              <div className='text-2xl flex-center gap-x-4'>
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
              <div className='mt-2 flex-center'>
                {process.env.NODE_ENV === 'production' ? (
                  eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt='number of visitors'
                    src={`https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=${encodeURIComponent(
                      `https://crypto.sooros.com`
                    )}&count_bg=%2379C83D&title_bg=%23555555&icon=&icon_color=%23E7E7E7&title=hits&edge_flat=false`}
                  />
                ) : (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    xmlnsXlink='http://www.w3.org/1999/xlink'
                    width='75'
                    height='20'
                  >
                    <linearGradient id='smooth' x2='0' y2='100%'>
                      <stop offset='0' stopColor='#bbb' stopOpacity='.1' />
                      <stop offset='1' stopOpacity='.1' />
                    </linearGradient>

                    <mask id='round'>
                      <rect width='75' height='20' rx='3' ry='3' fill='#fff' />
                    </mask>

                    <g mask='url(#round)'>
                      <rect width='30' height='20' fill='#555555' />
                      <rect x='30' width='45' height='20' fill='#79C83D' />
                      <rect width='75' height='20' fill='url(#smooth)' />
                    </g>

                    <g
                      fill='#fff'
                      textAnchor='middle'
                      fontFamily='Verdana,DejaVu Sans,Geneva,sans-serif'
                      fontSize='11'
                    >
                      <text x='16' y='15' fill='#010101' fillOpacity='.3'>
                        hits
                      </text>
                      <text x='16' y='14' fill='#fff'>
                        hits
                      </text>
                      <text x='51.5' y='15' fill='#010101' fillOpacity='.3'>
                        {' '}
                        1 / 1{' '}
                      </text>
                      <text x='51.5' y='14' fill='#fff'>
                        {' '}
                        1 / 1{' '}
                      </text>
                    </g>
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className='flex items-center border-l-0 border-gray-100 basis-2/3 sm:px-8 sm:border-l-1 '>
          <div className='h-4/6 sm:h-auto'>
            <p>
              SOOROS(
              <Link href='https://sooros.com'>
                <a>sooros.com</a>
              </Link>
              )는 토이프로젝트&amp;개인사용 목적으로 만들어진 사이트이며 사이트 내 모든 암호화폐
              가격 정보에 대하여 어떠한 책임을 지지 않습니다. 디지털 자산 투자에 대한 금전적 손실은
              본인 책임이며 투자에 유의하시기 바랍니다.
            </p>
          </div>
        </div>
      </div>
    </footer> */
}
