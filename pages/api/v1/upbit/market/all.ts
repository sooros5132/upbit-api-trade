import type { NextApiRequest, NextApiResponse } from 'next';
import { upbitApis } from 'src-server/utils/upbitApis';
import queryString from 'query-string';
import nc from 'next-connect';
import { Error } from 'src-server/middleware/Error';
import { IUpbitMarket } from 'src/types/upbit';

type IGetSuccess = IUpbitMarket;

const handler = nc<NextApiRequest, NextApiResponse>({
  onError: Error.handleError,
  onNoMatch: Error.handleNoMatch
}).get(async (req: NextApiRequest, res: NextApiResponse<IGetSuccess>) => {
  const qs = queryString.stringify(req.query);
  const request = await fetch(`${upbitApis.marketAll}?${qs}`);
  const result = (await request.json()) as IUpbitMarket;

  res.status(200).json(result);
});

export default handler;
