import { type AsyncOptions, CancelablePromise } from '@telegram-apps/sdk-solid';
import { object, string } from 'zod';

import { getStorageItem, setStorageItem } from '@/storage/storage.js';
import { dateISO } from '@/parsers/dateISO.js';

const STORAGE_KEY = 'platformer-auth-token';

/**
 * Retrieves the authorization token.
 * @param options - additional options.
 */
export function getAuthToken(options?: AsyncOptions): CancelablePromise<{
  token: string,
  expiresAt: Date
} | undefined> {
  const authTokenParser = object({
    token: string(),
    expiresAt: dateISO(),
  });

  return CancelablePromise.withFn(async (abortSignal) => {
    try {
      const json = authTokenParser.parse(
        JSON.parse(await getStorageItem(STORAGE_KEY, { abortSignal })),
      );

      // Check if the token hasn't expired. We consider it expired if less than 30 seconds left
      // until the expiration date.
      return Date.now() + 30000 <= json.expiresAt.getTime() ? json : undefined;
    } catch (e) { /* empty */
    }
  }, options);
}

/**
 * Saves the project authorization token.
 * @param token - token to save.
 * @param expiresAt - token expiration date.
 * @param options - additional options.
 */
export function saveAuthToken(
  token: string,
  expiresAt: Date,
  options?: AsyncOptions,
): CancelablePromise<void> {
  return setStorageItem(
    STORAGE_KEY,
    JSON.stringify({ token, expiresAt: expiresAt.toISOString() }),
    options,
  );
}