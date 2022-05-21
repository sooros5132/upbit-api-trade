import type { NextApiRequest, NextApiResponse } from 'next';
import { Authorization } from 'src-server/middleware/Authorization';
import { upbitApis } from 'src-server/utils/upbitApis';
import queryString from 'query-string';
import nc from 'next-connect';
import { Error } from 'src-server/middleware/Error';
import { IUpbitForex } from 'src/types/upbit';

type IGetSuccess = IUpbitForex;

const handler = nc<NextApiRequest, NextApiResponse>({
  onError: Error.handleError,
  onNoMatch: Error.handleNoMatch
}).get(async (req: NextApiRequest, res: NextApiResponse<IGetSuccess>) => {
  const qs = queryString.stringify(req.query);
  const request = await fetch(`${upbitApis.forexRecent}?${qs}`);
  const result = (await request.json()) as IUpbitForex;

  res.status(200).json(result);
});

export default handler;
