import type { NextApiRequest, NextApiResponse } from 'next';
import { Authorization } from 'src-server/middleware/Authorization';
import { upbitApis } from 'src-server/utils/upbitApis';
import queryString from 'query-string';
import nc from 'next-connect';
import { Error } from 'src-server/middleware/Error';

type IGetSuccess = {
  bid_fee: string;
  ask_fee: string;
  market: {
    id: string;
    name: string;
    order_types: string[];
    order_sides: string[];
    bid: {
      currency: string;
      price_unit: string | null;
      min_total: number;
    };
    ask: {
      currency: string;
      price_unit: string | null;
      min_total: number;
    };
    max_total: string;
    state: string;
  };
  bid_account: {
    currency: string;
    balance: string;
    locked: string;
    avg_buy_price: string;
    avg_buy_price_modified: boolean;
    unit_currency: string;
  };
  ask_account: {
    currency: string;
    balance: string;
    locked: string;
    avg_buy_price: string;
    avg_buy_price_modified: boolean;
    unit_currency: string;
  };
};

const handler = nc<NextApiRequest, NextApiResponse>({
  onError: Error.handleError,
  onNoMatch: Error.handleNoMatch
})
  .get(Authorization.check)
  .get(async (req: NextApiRequest, res: NextApiResponse<IGetSuccess>) => {
    const authToken = req.headers.authorization!;
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

    const result = (await request.json()) as IGetSuccess;

    res.status(200).json(result);
  });

export default handler;
