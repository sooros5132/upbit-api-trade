import type { NextApiRequest, NextApiResponse } from 'next';
import { upbitApis } from 'src-server/utils/upbitApis';
import nc from 'next-connect';
import { Error } from 'src-server/middleware/Error';
import { IUpbitAccounts } from 'src-server/types/upbit';
import { Authorization } from 'src-server/middleware/Authorization';
import httpProxyMiddleware from 'next-http-proxy-middleware';
import { apiUrls } from 'src/lib/apiUrls';

type IGetSuccess = IUpbitAccounts[];

const PATH = '/api/v1/binance';

const handler = nc<NextApiRequest, NextApiResponse>({
  onError: Error.handleError,
  onNoMatch: Error.handleNoMatch
}).get(async (req, res) => {
  httpProxyMiddleware(req, res, {
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
// .get(PATH + '/test', async (req, res: NextApiResponse<IGetSuccess>) => {
//   console.log(req.url);

//   res.status(200).json(true);
// })
// .get(PATH + '/time')
// .get(PATH + '/exchangeInfo')
// .get('');

export default handler;
