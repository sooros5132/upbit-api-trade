export interface SiteConfigType extends Record<string, any> {
  TZ: string;
  origin: string | null;
  proxyOrigin: string | null;
  haveTvChartingLibrary: boolean;
  upbitApiTrade: boolean;
}
