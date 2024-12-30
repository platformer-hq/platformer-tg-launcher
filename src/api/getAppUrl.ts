import type { AsyncOptions, CancelablePromise } from '@telegram-apps/sdk-solid';
import { object, string } from 'superstruct';

import { gqlRequest, type GqlRequestResult } from '@/api/gqlRequest.js';
import { maybe } from '@/validation/maybe.js';

/**
 * Retrieves the application URL.
 * @param apiBaseURL - API base URL.
 * @param authToken - authorization token.
 * @param appId - application identifier to validate the init data.
 * @param launchParams - launch parameters.
 * @param options - additional options.
 */
export function getAppUrl(
  apiBaseURL: string,
  authToken: string,
  appId: number,
  launchParams: string,
  options?: AsyncOptions,
): CancelablePromise<GqlRequestResult<[appFound: boolean, url?: Maybe<string>]>> {
  return gqlRequest(
    apiBaseURL,
    'query ($appId: Int!, $launchParams: String!) {'
    + ' app(appID: $appId) {'
    + '  telegramURL(launchParams: $launchParams)'
    + ' }'
    + '}',
    { appId, launchParams },
    object({
      app: maybe(object({
        telegramURL: maybe(string()),
      })),
    }),
    { ...options, authToken },
  ).then(v => v[0] === 'ok'
    ? ['ok', v[1].app ? [true, v[1].app.telegramURL] : [false]]
    : v);
}