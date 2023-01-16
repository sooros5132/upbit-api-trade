export interface SiteConfigType extends Record<string, any> {
  TZ: string;
  proxyOrigin: string | null;
  haveTvChartingLibrary: boolean;
  upbitApiTrade: boolean;
}
