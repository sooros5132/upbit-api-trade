import { SiteConfigType } from 'src/types/types';

export function siteConfigMaker(config: SiteConfigType) {
  if (!config?.haveTvChartingLibrary) {
    const message =
      '`tradingview/charting_library` 라이브러리가 필요합니다. 자세한 내용은 `site-config.ts`파일을 확인해주세요.';
    console.log('\x1b[37m\x1b[41m');
    console.log('ERROR - ' + message, '\x1b[0m');

    throw message;
  }

  return config;
}
