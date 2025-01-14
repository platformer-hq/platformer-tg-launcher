import { any, array, create, string, type Struct, StructError, type } from 'superstruct';
import { type AsyncOptions, CancelablePromise } from '@telegram-apps/sdk-solid';

import { GqlError } from '@/api/GqlError.js';
import { maybe } from '@/validation/maybe.js';
import type { ExecutionFailedTuple, ExecutionTuple } from '@/types/execution.js';

interface GqlErrorShape {
  message?: Maybe<string>;
  extensions: {
    errorData: {
      code: string;
    };
  };
}

const GqlResponse = type({
  data: any(),
  errors: maybe(array(type({
    message: maybe(string()),
    extensions: type({
      errorData: type({
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
  | [type: 'invalid-data', error: Error | StructError];

export type GqlRequestResult<T> = ExecutionTuple<T, GqlRequestError>;

function toFailedExecutionTuple<T>(error: T): ExecutionFailedTuple<T> {
  return [false, error];
}

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
  async function perform(signal: AbortSignal): Promise<GqlRequestResult<T>> {
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
      return toFailedExecutionTuple(['fetch', e]);
    }

    let data: {
      data?: unknown;
      errors?: Maybe<GqlErrorShape[]>;
    } | undefined | void;
    let err: Error | StructError | undefined;
    if ((response.headers.get('content-type') || '').includes('application/json')) {
      data = await response
        .json()
        .then(j => create(j, GqlResponse))
        .catch(e => {
          err = e;
        });
    }

    if (!data) {
      const { status } = response;
      return toFailedExecutionTuple(
        status < 200 || status >= 400
          ? ['http', status, response.statusText]
          : ['invalid-data', err!],
      );
    }
    if (data.errors) {
      return toFailedExecutionTuple(['gql', data.errors.map(e => {
        return new GqlError(e.extensions.errorData.code, e.message || undefined);
      })]);
    }
    try {
      return [true, create(data.data, struct)];
    } catch (e) {
      return toFailedExecutionTuple(['invalid-data', e as StructError]);
    }
  }

  return CancelablePromise.withFn(async signal => {
    const retries = 3;
    for (let i = 0; i < retries; i++) {
      const result = await perform(signal);
      if (result[0] || i === retries - 1) {
        return result;
      }
      // Sleep: 800ms, 1600ms
      await new Promise(res => {
        setTimeout(res, Math.pow(2, i + 3) * 100);
      });
    }
  }, options) as CancelablePromise<GqlRequestResult<T>>;
}