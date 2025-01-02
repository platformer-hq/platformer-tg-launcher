import type { AsyncOptions, CancelablePromise } from '@telegram-apps/sdk-solid';
import { object, string } from 'superstruct';

import { gqlRequest, type GqlRequestResult } from '@/api/gqlRequest.js';
import { maybe } from '@/validation/maybe.js';

export interface GetAppURLOptions {
  apiBaseURL: string,
  authToken: string,
  appID: number,
  launchParams: string,
}

/**
 * Retrieves the application URL.
 * @param args - execution arguments
 * @param options - execution options
 */
export function getAppUrl(
  args: GetAppURLOptions,
  options?: AsyncOptions
): CancelablePromise<GqlRequestResult<[appFound: boolean, url?: Maybe<string>]>> {
  return gqlRequest(
    args.apiBaseURL,
    'query ($appID: Int!, $launchParams: String!) {'
    + ' app(appID: $appID) {'
    + '  telegramURL(launchParams: $launchParams)'
    + ' }'
    + '}',
    { appID: args.appID, launchParams: args.launchParams },
    object({
      app: maybe(object({
        telegramURL: maybe(string()),
      })),
    }),
    { ...options, authToken: args.authToken },
  ).then(v => v[0]
    ? [true, v[1].app ? [true, v[1].app.telegramURL] : [false]]
    : v);
}