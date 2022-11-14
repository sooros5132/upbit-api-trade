export interface SiteConfig extends Record<string, any> {
  TZ: string;
  origin: string;
  path: string;
  rewritePath: string;
}
