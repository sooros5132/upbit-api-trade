// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { IUpbitForex } from "src/types/upbit";
import { apiRequestURLs } from "src/utils/apiRequestURLs";

const url =
  "https://quotation-api-cdn.dunamu.com/v1/forex/recent?codes=FRX.KRWUSD";

type Data = {
  forex: IUpbitForex;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const request = await fetch(url);
  const forex = await request.json();

  if (!forex) {
    res.status(403);
  }
  res.status(200).json({ ...forex });
}
