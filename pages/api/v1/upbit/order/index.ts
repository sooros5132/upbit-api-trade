// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { Authorization } from 'src-server/helpers/Authorization';
import { Error } from 'src-server/helpers/Error';
import { IUpbitAccounts } from 'src-server/type/upbit';
import { upbitApis } from 'src-server/utils/upbitApis';
import queryString from 'query-string';

export default async function handler(req: NextApiRequest, res: NextApiResponse<IUpbitAccounts>) {
  try {
    switch (req.method) {
      case 'DELETE': {
        handleDelete(req, res);
      }
      case 'POST': {
        handlePost(req, res);
      }
      default: {
        throw 'Not Found';
      }
    }
  } catch (e) {
    Error.errorHandler(res, e as string, 403);
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse<IUpbitAccounts>) {
  const authToken = Authorization.check(req.headers.authorization);
  const { market, side, volume, price, ord_type, identifier } = req.query;
  if (!market && !side && !volume && !price && !ord_type) {
    throw 'market, side, volume, price, ord_type 중에 비어있는 값이 있는지 확인해주세요.';
  }

  const queryStringfy = queryString.stringify({
    market,
    side,
    volume,
    price,
    ord_type,
    identifier
  });

  const request = await fetch(`${upbitApis.orders}?${queryStringfy}`, {
    headers: { Authorization: authToken }
  });

  const result = await request.json();

  res.status(200).json(result);
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse<IUpbitAccounts>) {
  const authToken = Authorization.check(req.headers.authorization);
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

  const result = await request.json();

  res.status(200).json(result);
}
