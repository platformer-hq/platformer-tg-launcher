import { string, looseObject, pipe, date, number, transform } from 'valibot';

export const AuthToken = looseObject({
  token: string(),
  expiresAt: pipe(
    number(),
    transform((v) => new Date(String(v))),
    date(),
  ),
});