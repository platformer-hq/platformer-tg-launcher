import type { AsyncOptions, CancelablePromise } from '@telegram-apps/sdk-solid';
import { object, string } from 'zod';

import { gqlRequest, type GqlRequestResponse } from '@/api/gqlRequest.js';

export function getAppUrl(
  baseUrl: string,
  authToken: string,
  appId: number,
  launchParams: string,
  options?: AsyncOptions,
): CancelablePromise<GqlRequestResponse<[appFound: boolean, url?: Maybe<string>]>> {
  return gqlRequest(
    baseUrl,
    `
query ($appId: Int!, $launchParams: String!) {
  app(appID: $appId) {
    telegramURL(launchParams: $launchParams)
  }
}`,
    { appId, launchParams },
    object({
      app: object({
        telegramURL: string()
          .optional()
          .nullable(),
      })
        .optional()
        .nullable(),
    }),
    { ...options, authToken },
  ).then(v => v[0] === 'ok'
    ? ['ok', v[1].app ? [true, v[1].app.telegramURL] : [false]]
    : v);
}