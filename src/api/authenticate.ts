import type { AsyncOptions, CancelablePromise } from '@telegram-apps/sdk-solid';
import { object } from 'superstruct';

import { gqlRequest, type GqlRequestResult } from '@/api/gqlRequest.js';
import { AuthToken } from '@/validation/AuthToken.js';

export interface AuthenticateOptions {
  apiBaseURL: string,
  appID: number,
  initData: string,
}

/**
 * Authenticates the current user.
 * @param args - execution arguments
 * @param options - execution options
 */
export function authenticate(
  args: AuthenticateOptions,
  options?: AsyncOptions,
): CancelablePromise<GqlRequestResult<{ token: string; expiresAt: Date }>> {
  return gqlRequest(
    args.apiBaseURL,
    'mutation ($appID: Int, $initData: String!) {'
    + ' authenticateTelegram(appID: $appID, initData: $initData) {'
    + '  token'
    + '  expiresAt'
    + ' }'
    + '}',
    { appID: args.appID, initData: args.initData },
    object({ authenticateTelegram: AuthToken }),
    options,
  ).then(v => v[0]
    ? [true, v[1].authenticateTelegram]
    : v);
}