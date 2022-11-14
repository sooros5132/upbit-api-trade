import { siteConfig } from 'src/lib/siteConfig';

const config = siteConfig({
  TZ: 'Asia/Seoul',
  origin: process.env.NEXT_PUBLIC_BASE_API_ORIGIN || 'https://crypto.sooros.com',
  path: process.env.NEXT_PUBLIC_BASE_API_PATH || '/api/v1',
  rewritePath: '/api'
});

export default config;

export const NEXT_IMAGE_DOMAINS = ['www.notion.so', 'notion.so', 's3.us-west-2.amazonaws.com'];
