import { GqlRequestError, GqlRequestResult, GqlRequestSuccess } from '@/api/gqlRequest.js';
import { Accessor } from 'solid-js';

/**
 * Splits the GQL response signal on two. The first one returns data, the second one returns
 * the occurred error.
 * @param data - response signal.
 */
export function splitGqlResponse<T>(data: () => GqlRequestResult<T>): [
  Accessor<GqlRequestSuccess<T>[1] | null>,
  Accessor<GqlRequestError | null>
] {
  return [
    () => {
      const v = data();
      return v[0] === 'ok' ? v[1] : null;
    },
    () => {
      const v = data();
      return v[0] !== 'ok' ? v : null;
    },
  ];
}