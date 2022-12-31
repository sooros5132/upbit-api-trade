import type { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import { Error } from 'src-server/middleware/Error';
import httpProxyMiddleware from 'next-http-proxy-middleware';

const PATH = '/api/v1/upbit';

const handler = nc<NextApiRequest, NextApiResponse>({
  onError: Error.handleError,
  onNoMatch: Error.handleNoMatch
}).all(async (req, res) => {
  await httpProxyMiddleware(req, res, {
    target: 'https://api.upbit.com/',
    changeOrigin: true,
    pathRewrite: [
      {
        patternStr: `^${PATH}/`,
        replaceStr: '/v1/'
      }
    ]
  });
});

export default handler;
