import siteConfig from 'site-config';

it('tradingview charting_library setting', () => {
  const haveTvChartingLibrary = siteConfig.haveTvChartingLibrary;
  if (!haveTvChartingLibrary) {
    const err =
      'ERROR - `tradingview/charting_library` 라이브러리 세팅이 필요합니다. 자세한 내용은 `site-config.ts`파일을 확인해주세요.';
    console.log(err);
  }

  expect(haveTvChartingLibrary).toBe(true);
});

export {};
