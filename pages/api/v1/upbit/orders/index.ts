import type { NextApiRequest, NextApiResponse } from 'next';
import { Authorization } from 'src-server/middleware/Authorization';
import { upbitApis } from 'src-server/utils/upbitApis';
import queryString from 'query-string';
import nc from 'next-connect';
import { Error } from 'src-server/middleware/Error';

type IGetSuccess = {
  uuid: string;
  side: string;
  ord_type: string;
  price: string;
  state: string;
  market: string;
  created_at: string;
  volume: string;
  remaining_volume: string;
  reserved_fee: string;
  remaining_fee: string;
  paid_fee: string;
  locked: string;
  executed_volume: string;
  trades_count: number;
};

const handler = nc<NextApiRequest, NextApiResponse>({
  onError: Error.handleError,
  onNoMatch: Error.handleNoMatch
})
  .get(Authorization.check)
  .get(async (req: NextApiRequest, res: NextApiResponse<IGetSuccess[]>) => {
    const authToken = req.headers.authorization!;
    const { uuid, identifier } = req.query;
    if (!uuid && !identifier) {
      throw 'uuid 혹은 identifier 둘 중 하나의 값이 반드시 포함되어야 합니다.';
    }

    const queryStringfy = queryString.stringify({
      uuid,
      identifier
    });

    const request = await fetch(`${upbitApis.order}?${queryStringfy}`, {
      headers: { Authorization: authToken }
    });

    const result = (await request.json()) as IGetSuccess[];

    res.status(200).json(result);
  });

export default handler;
