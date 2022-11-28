import { SiteConfig } from 'src/types/types';

export function siteConfig(config: SiteConfig) {
  if (process.env.NEXT_PUBLIC_TV_CHARTING_LIBRARY !== 'true') {
    console.log('\x1b[37m\x1b[41m');
    console.log(
      'ERROR - `tradingview/charting_library` 라이브러리가 필요합니다. 자세한 내용은 `.env.sample`을 확인해주세요.',
      '\x1b[0m'
    );

    throw 'tradingview/charting_library setting error';
  }

  return config;
}
