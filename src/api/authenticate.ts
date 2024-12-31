import type { AsyncOptions, CancelablePromise } from '@telegram-apps/sdk-solid';
import { object } from 'superstruct';

import { gqlRequest, type GqlRequestResult } from '@/api/gqlRequest.js';
import { AuthToken } from '@/validation/AuthToken.js';

/**
 * Authenticates the current user.
 * @param apiBaseURL - API base URL.
 * @param appID - application identifier to validate the init data.
 * @param initData - init data.
 * @param options - additional options.
 */
export function authenticate(
  apiBaseURL: string,
  appID: number,
  initData: string,
  options?: AsyncOptions,
): CancelablePromise<GqlRequestResult<{ token: string; expiresAt: Date }>> {
  return gqlRequest(
    apiBaseURL,
    'mutation ($appID: Int, $initData: String!) {'
    + ' authenticateTelegram(appID: $appID, initData: $initData) {'
    + '  token'
    + '  expiresAt'
    + ' }'
    + '}',
    { appID, initData },
    object({ authenticateTelegram: AuthToken }),
    options,
  ).then(v => v[0]
    ? [true, v[1].authenticateTelegram]
    : v);
}