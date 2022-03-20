import { NextApiRequest, NextApiResponse } from 'next';

const authRegex = /^Bearer /i;

export class Error {
  constructor() {}

  static errorHandler(res: NextApiResponse, errorMessage?: string | object, errorCode?: number) {
    return res
      .status(errorCode ?? 404)
      .json(
        typeof errorMessage === 'string'
          ? { error: { message: errorMessage } }
          : errorMessage ?? 'Not Found'
      );
  }
}
