import type { NextApiRequest, NextApiResponse } from 'next';
import { upbitApis } from 'src-server/utils/upbitApis';
import nc from 'next-connect';
import { Error } from 'src-server/middleware/Error';
import { IUpbitAccounts } from 'src-server/types/upbit';
import { Authorization } from 'src-server/middleware/Authorization';

type IGetSuccess = IUpbitAccounts[];

const handler = nc<NextApiRequest, NextApiResponse>({
  onError: Error.handleError,
  onNoMatch: Error.handleNoMatch
})
  .get(Authorization.check)
  .get(async (req, res: NextApiResponse<IGetSuccess>) => {
    const request = await fetch(upbitApis.accounts, {
      headers: { Authorization: req.headers.authorization! }
    });

    const result = (await request.json()) as IGetSuccess;

    res.status(request.status).json(result);
  });

export default handler;
