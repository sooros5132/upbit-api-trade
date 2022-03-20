// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { IUpbitAccounts } from 'src-server/type/upbit';
import { upbitApis } from 'src-server/utils/upbitApis';
import queryString from 'query-string';

export default async function handler(req: NextApiRequest, res: NextApiResponse<IUpbitAccounts>) {
  const qs = queryString.stringify(req.query);
  const request = await fetch(`${upbitApis.forexRecent}?${qs}`);
  const result = await request.json();

  res.status(200).json(result);
}
