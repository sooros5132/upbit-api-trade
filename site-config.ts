import { siteConfigMaker } from 'src/lib/siteConfig';

const siteConfig = siteConfigMaker({
  TZ: 'Asia/Seoul',
  origin: 'https://crypto.sooros.com',

  //! 필수 설정
  /**
   *
   *? 빌드를 하려면 "tradingview/charting_library" 깃 저장소의 권한이 필요합니다.
   *
   * 아래 주소에서 권한 요청을 할 수 있습니다.
   * https://www.tradingview.com/HTML5-stock-forex-bitcoin-charting-library/?feature=technical-analysis-charts
   *
   * 이 프로젝트에 적용한 commit hash - 58407be459423b5837d6a0c6bd36d049fd6703b9
   * https://github.com/tradingview/charting_library/tree/58407be459423b5837d6a0c6bd36d049fd6703b9
   *
   * 라이브러리 권한을 받았다면 이름에 맞춰 해당 폴더를 넣어주세요.
   * 1. Copy `charting_library` folder from https://github.com/tradingview/charting_library/
   * `/public` and `/src`
   *
   * 2. 아래 haveTvChartingLibrary를 true로 변경해주세요.
   */
  haveTvChartingLibrary: true,
  //! 필수 설정

  //* 선택적인 설정
  /**
   *? origin을 변경하고싶을 경우 null을 http origin으로 변경
   * ex) 'https://api.sooros.com',
   */
  proxyOrigin: null,

  /**
   *? 주문 기능을 활성화 하는 세팅입니다. 필요한 경우 true로 변경해주세요.
   *
   *! 거래 기능을 활성화 하고 이 기능을 사용하여 금전적 손실이 발생할 경우 어떠한 책임을 지지 않습니다.
   *! 거래 기능을 활성화 하면 배포/서비스를 하여서는 안됩니다. 배포자 본인만 사용하시기 바랍니다.
   *! 업비트 이용약관: https://www.upbit.com/terms_of_service
   *! 업비트 openApi 이용약관: https://upbit.com/open_api_agreement
   */
  upbitApiTrade: false
  //* 선택적인 설정
});

export default siteConfig;
