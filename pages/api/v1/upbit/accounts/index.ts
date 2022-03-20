// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { IUpbitAccounts } from 'src-server/type/upbit';
import { upbitApis } from 'src-server/utils/upbitApis';

export default async function handler(req: NextApiRequest, res: NextApiResponse<IUpbitAccounts>) {
  try {
    if (req.method !== 'GET') {
      throw 'Not Found';
    }
    const authToken = req.headers.authorization;

    if (!authToken) {
      throw 'Authorization 토큰이 없습니다.';
    }

    const request = await fetch(upbitApis.accounts, {
      headers: { Authorization: authToken }
    });

    const result = await request.json();

    res.status(200).json(result);
  } catch (e) {
    res.status(403).json({ message: e } as any);
  }
}
