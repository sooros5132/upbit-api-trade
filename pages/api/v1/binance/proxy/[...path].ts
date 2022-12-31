import type { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import { Error } from 'src-server/middleware/Error';
import httpProxyMiddleware from 'next-http-proxy-middleware';

const PATH = '/api/v1/binance';

const handler = nc<NextApiRequest, NextApiResponse>({
  onError: Error.handleError,
  onNoMatch: Error.handleNoMatch
}).get(async (req, res) => {
  await httpProxyMiddleware(req, res, {
    target: 'https://api.binance.com',
    changeOrigin: true,
    pathRewrite: [
      {
        patternStr: `^${PATH}/proxy`,
        replaceStr: '/'
      }
    ]
  });
});

export default handler;
