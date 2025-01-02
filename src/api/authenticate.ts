import type { AsyncOptions, CancelablePromise } from '@telegram-apps/sdk-solid';
import { object } from 'superstruct';

import { gqlRequest, type GqlRequestResult } from '@/api/gqlRequest.js';
import { AuthToken } from '@/validation/AuthToken.js';

export interface AuthenticateOptions extends AsyncOptions {
  apiBaseURL: string,
  appID: number,
  initData: string,
}

/**
 * Authenticates the current user.
 * @param options - execution options
 */
export function authenticate(options: AuthenticateOptions): CancelablePromise<GqlRequestResult<{ token: string; expiresAt: Date }>> {
  return gqlRequest(
    options.apiBaseURL,
    'mutation ($appID: Int, $initData: String!) {'
    + ' authenticateTelegram(appID: $appID, initData: $initData) {'
    + '  token'
    + '  expiresAt'
    + ' }'
    + '}',
    { appID: options.appID, initData: options.initData },
    object({ authenticateTelegram: AuthToken }),
    options,
  ).then(v => v[0]
    ? [true, v[1].authenticateTelegram]
    : v);
}