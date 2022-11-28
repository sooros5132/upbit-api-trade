it('tradingview charting_library setting', () => {
  const TV_CHARTING_LIBRARY = process.env.NEXT_PUBLIC_TV_CHARTING_LIBRARY;
  if (process.env.TV_CHARTING_LIBRARY !== 'true') {
    const err =
      'ERROR - `tradingview/charting_library` 라이브러리가 필요합니다. 자세한 내용은 `.env.sample`을 확인해주세요.';
    console.log(err);
  }

  expect(TV_CHARTING_LIBRARY).toBe('true');
});

export {};
