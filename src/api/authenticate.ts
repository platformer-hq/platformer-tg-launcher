import type { AsyncOptions, CancelablePromise } from '@telegram-apps/sdk-solid';
import { object, string } from 'zod';

import { gqlRequest, type GqlRequestResponse } from '@/api/gqlRequest.js';
import { dateISO } from '@/parsers/dateISO.js';

export function authenticate(
  baseUrl: string,
  appId: number,
  initData: string,
  options?: AsyncOptions,
): CancelablePromise<GqlRequestResponse<{ token: string; expiresAt: Date }>> {
  return gqlRequest(
    baseUrl,
    `
mutation ($appId: Int, $initData: String!) {
    authenticateTelegram(appID: $appId, initData: $initData) {
        token
        expiresAt
    }
}`,
    { appId, initData },
    object({
      authenticateTelegram: object({
        token: string(),
        expiresAt: dateISO(),
      }),
    }),
    options,
  ).then(v => v[0] === 'ok'
    ? ['ok', v[1].authenticateTelegram]
    : v);
}