import type { AsyncOptions, CancelablePromise } from '@telegram-apps/sdk-solid';
import { object, string } from 'superstruct';

import { gqlRequest, type GqlRequestResult } from '@/api/gqlRequest.js';
import { maybe } from '@/validation/maybe.js';

/**
 * Retrieves the application URL.
 * @param apiBaseURL - API base URL.
 * @param authToken - authorization token.
 * @param appID - application identifier to validate the init data.
 * @param launchParams - launch parameters.
 * @param options - additional options.
 */
export function getAppUrl(
  apiBaseURL: string,
  authToken: string,
  appID: number,
  launchParams: string,
  options?: AsyncOptions,
): CancelablePromise<GqlRequestResult<[appFound: boolean, url?: Maybe<string>]>> {
  return gqlRequest(
    apiBaseURL,
    'query ($appID: Int!, $launchParams: String!) {'
    + ' app(appID: $appID) {'
    + '  telegramURL(launchParams: $launchParams)'
    + ' }'
    + '}',
    { appID, launchParams },
    object({
      app: maybe(object({
        telegramURL: maybe(string()),
      })),
    }),
    { ...options, authToken },
  ).then(v => v[0]
    ? [true, v[1].app ? [true, v[1].app.telegramURL] : [false]]
    : v);
}