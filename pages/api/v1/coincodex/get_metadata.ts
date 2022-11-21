import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import { Error } from 'src-server/middleware/Error';
import { apiUrls } from 'src/lib/apiUrls';
import { ICoincodexGetMetadata } from 'src/types/coincodex';

type IGetSuccess = Pick<
  ICoincodexGetMetadata,
  | 'btc_dominance'
  | 'btc_dominance_24h_change_percent'
  | 'btc_growth'
  | 'total_market_cap'
  | 'total_market_cap_24h_change_percent'
  | 'total_volume'
  | 'total_volume_24h_change_percent'
  | 'fiat_rates'
  | 'eth_gas'
>;

const handler = nc<NextApiRequest, NextApiResponse>({
  onError: Error.handleError,
  onNoMatch: Error.handleNoMatch
}).get(async (req, res: NextApiResponse<IGetSuccess>) => {
  const response = await axios
    .get<ICoincodexGetMetadata>(apiUrls.coincodex.origin + apiUrls.coincodex.getMetadata)
    .then((res) => res);

  const {
    btc_dominance,
    btc_dominance_24h_change_percent,
    btc_growth,
    total_market_cap,
    total_market_cap_24h_change_percent,
    total_volume,
    total_volume_24h_change_percent,
    fiat_rates,
    eth_gas
  } = response.data;

  const result = {
    btc_dominance,
    btc_dominance_24h_change_percent,
    btc_growth,
    total_market_cap,
    total_market_cap_24h_change_percent,
    total_volume,
    total_volume_24h_change_percent,
    fiat_rates,
    eth_gas
  };

  res.status(response.status).json(result);
});

export default handler;
