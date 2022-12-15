import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import { Error } from 'src-server/middleware/Error';

type IGetSuccess = any;

const handler = nc<NextApiRequest, NextApiResponse>({
  onError: Error.handleError,
  onNoMatch: Error.handleNoMatch
}).get(async (req, res: NextApiResponse<IGetSuccess>) => {
  const response = await axios
    .get(
      'https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=BTC,ETH,XRP&convert=KRW',
      {
        headers: {
          'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY
        }
      }
    )
    .then((res) => res)
    .catch((err) => err);

  res.status(200).json(response.data);
});

export default handler;
