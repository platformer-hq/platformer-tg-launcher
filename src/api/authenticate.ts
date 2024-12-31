import type { AsyncOptions, CancelablePromise } from '@telegram-apps/sdk-solid';
import { object } from 'superstruct';

import { gqlRequest, type GqlRequestResult } from '@/api/gqlRequest.js';
import { AuthToken } from '@/validation/AuthToken.js';

/**
 * Authenticates the current user.
 * @param apiBaseURL - API base URL.
 * @param appId - application identifier to validate the init data.
 * @param initData - init data.
 * @param options - additional options.
 */
export function authenticate(
  apiBaseURL: string,
  appId: number,
  initData: string,
  options?: AsyncOptions,
): CancelablePromise<GqlRequestResult<{ token: string; expiresAt: Date }>> {
  return gqlRequest(
    apiBaseURL,
    'mutation ($appId: Int, $initData: String!) {'
    + ' authenticateTelegram(appID: $appId, initData: $initData) {'
    + '  token'
    + '  expiresAt'
    + ' }'
    + '}',
    { appId, initData },
    object({ authenticateTelegram: AuthToken }),
    options,
  ).then(v => v[0]
    ? [true, v[1].authenticateTelegram]
    : v);
}