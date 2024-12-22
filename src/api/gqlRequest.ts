import { any, array, object, string } from 'zod';
import { type AsyncOptions, CancelablePromise } from '@telegram-apps/sdk-solid';

import { GqlError } from '@/api/GqlError.js';

interface GqlErrorShape {
  message?: string;
  extensions: {
    errorData: {
      code: string;
    };
  };
}

const responseParser = object({
  data: any(),
  errors: array(
    object({
      message: string().optional(),
      extensions: object({
        errorData: object({
          code: string(),
        }),
      }),
    }),
  )
    .optional()
    .nullable(),
});

export interface GqlRequestOptions extends AsyncOptions {
  authToken?: string;
}

export type GqlRequestResponse<T> =
  | [type: 'ok', data: T]
  | [type: 'gql', errors: GqlError[]]
  | [type: 'http', status: number, statusText: string]
  | [type: 'fetch', error: unknown]
  | [type: 'invalid-data', error: unknown];

/**
 * Performs a GraphQL request.
 *
 * This function is not throwing errors, but returns them.
 * @param baseUrl - URL to send request to.
 * @param query - GraphQL query.
 * @param variables - query variables.
 * @param parser - parser used to validate the response.
 * @param options - additional options.
 */
export function gqlRequest<T>(
  baseUrl: string,
  query: string,
  variables: Record<string, unknown>,
  parser: { parse(value: unknown): T },
  options?: GqlRequestOptions,
): CancelablePromise<GqlRequestResponse<T>> {
  return CancelablePromise.withFn(async signal => {
    let response: Response;
    try {
      response = await fetch(baseUrl, {
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
      errors?: GqlErrorShape[] | null;
    } | undefined;
    if ((response.headers.get('content-type') || '').includes('application/json')) {
      data = await response.json()
        .then(j => responseParser.parse(j))
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
        return new GqlError(e.extensions.errorData.code, e.message);
      })];
    }
    try {
      return ['ok', parser.parse(data.data)];
    } catch (e) {
      return ['invalid-data', e];
    }
  }, options);
}