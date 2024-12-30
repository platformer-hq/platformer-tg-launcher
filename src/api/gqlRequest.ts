import { any, array, create, object, string, Struct } from 'superstruct';
import { type AsyncOptions, CancelablePromise } from '@telegram-apps/sdk-solid';

import { GqlError } from '@/api/GqlError.js';
import { maybe } from '@/validation/maybe.js';

interface GqlErrorShape {
  message?: Maybe<string>;
  extensions: {
    errorData: {
      code: string;
    };
  };
}

const GqlResponse = object({
  data: any(),
  errors: maybe(array(object({
    message: maybe(string()),
    extensions: object({
      errorData: object({
        code: string(),
      }),
    }),
  }))),
});

export interface GqlRequestOptions extends AsyncOptions {
  authToken?: string;
}

export type GqlRequestError =
  | [type: 'gql', errors: GqlError[]]
  | [type: 'http', status: number, statusText: string]
  | [type: 'fetch', error: unknown]
  | [type: 'invalid-data', error: unknown];

export type GqlRequestSuccess<T> = [type: 'ok', data: T];

export type GqlRequestResult<T> = GqlRequestSuccess<T> | GqlRequestError

/**
 * Performs a GraphQL request.
 *
 * This function is not throwing errors, but returns them.
 * @param apiBaseURL - URL to send request to.
 * @param query - GraphQL query.
 * @param variables - query variables.
 * @param struct - structure used to validate the response.
 * @param options - additional options.
 */
export function gqlRequest<T, S>(
  apiBaseURL: string,
  query: string,
  variables: Record<string, unknown>,
  struct: Struct<T, S>,
  options?: GqlRequestOptions,
): CancelablePromise<GqlRequestResult<T>> {
  return CancelablePromise.withFn(async signal => {
    let response: Response;
    try {
      response = await fetch(apiBaseURL, {
        signal,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `jwt ${(options || {}).authToken}`,
        },
        body: JSON.stringify({ query, variables }),
      });
    } catch (e) {
      return ['fetch', e];
    }

    let data: {
      data?: unknown;
      errors?: Maybe<GqlErrorShape[]>;
    } | undefined;
    if ((response.headers.get('content-type') || '').includes('application/json')) {
      data = await response
        .json()
        .then(j => create(j, GqlResponse))
        .catch(() => undefined);
    }

    if (!data) {
      const { status } = response;
      return status < 200 || status >= 400
        ? ['http', status, response.statusText]
        : ['invalid-data', new Error('Invalid response')];
    }
    if (data.errors) {
      return ['gql', data.errors.map(e => {
        return new GqlError(e.extensions.errorData.code, e.message || undefined);
      })];
    }
    try {
      return ['ok', create(data.data, struct)];
    } catch (e) {
      return ['invalid-data', e];
    }
  }, options);
}