import type { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import { Error } from 'src-server/middleware/Error';
import os from 'os';

type IGetSuccess = string;

const handler = nc<NextApiRequest, NextApiResponse>({
  onError: Error.handleError,
  onNoMatch: Error.handleNoMatch
}).get(async (req, res: NextApiResponse<IGetSuccess>) => {
  const ifaces = os.networkInterfaces();
  let result = '';
  for (var dev in ifaces) {
    var alias = 0;

    ifaces[dev]?.forEach(function (details) {
      if (details.family == 'IPv4' && details.internal === false) {
        result = details.address;
        ++alias;
      }
    });
  }

  res.status(200).send(result);
});

export default handler;
