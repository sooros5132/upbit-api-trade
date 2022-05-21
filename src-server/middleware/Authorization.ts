import type { NextApiRequest, NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';

const authRegex = /^Bearer /i;

export class Authorization {
  constructor() {}

  static check(req: NextApiRequest, res: NextApiResponse, next?: NextHandler) {
    try {
      const token = req.headers.authorization;
      if (token && token.replace(authRegex, '')) {
        return next && next();
      }
      throw 'Authorization 토큰 정보가 없습니다.';
    } catch (e) {
      throw e as string;
    }
  }

  static checkToken(token?: string) {
    try {
      if (token && token.replace(authRegex, '')) {
        return token;
      }
      throw 'Authorization 토큰 정보가 없습니다.';
    } catch (e) {
      return e as string;
    }
  }
}
