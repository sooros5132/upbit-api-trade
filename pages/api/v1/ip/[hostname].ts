import type { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import { Error } from 'src-server/middleware/Error';
import dns from 'dns';
import { IErrorResponse } from 'src-server/types/response';

type IGetSuccess = string;

const handler = nc<NextApiRequest, NextApiResponse>({
  onError: Error.handleError,
  onNoMatch: Error.handleNoMatch
}).get(async (req, res: NextApiResponse<IGetSuccess>) => {
  const hostname = req.query.hostname as string;

  const result = await new Promise((resolve, reject) => {
    dns.lookup(hostname, (err, address, family) => {
      if (err) reject(err);
      resolve(address);
    });
  }).catch(() => {
    throw {
      error: 'not found ip',
      status: 400,
      success: false
    } as IErrorResponse;
  });

  res.status(200).send(result as string);
});

export default handler;
