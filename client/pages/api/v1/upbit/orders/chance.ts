// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { Authorization } from 'src-server/helpers/Authorization';
import { Error } from 'src-server/helpers/Error';
import { IUpbitAccounts } from 'src-server/type/upbit';
import { upbitApis } from 'src-server/utils/upbitApis';
import queryString from 'query-string';

export default async function handler(req: NextApiRequest, res: NextApiResponse<IUpbitAccounts>) {
  try {
    if (req.method !== 'GET') {
      throw 'Not Found';
    }
    const authToken = Authorization.check(req.headers.authorization);
    const { market } = req.query;
    if (!market) {
      throw '주문 가능 정보를 조회할 market을 입력해주세요.';
    }
    const queryStringfy = queryString.stringify({
      market
    });

    const request = await fetch(`${upbitApis.ordersChance}?${queryStringfy}`, {
      headers: { Authorization: authToken }
    });

    const result = await request.json();

    res.status(200).json(result);
  } catch (e) {
    Error.errorHandler(res, e as string, 403);
  }
}
