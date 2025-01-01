import { type Accessor, type JSXElement, Match, Switch } from 'solid-js';

import type { GqlError } from '@/api/GqlError.js';
import type { GqlRequestError } from '@/api/gqlRequest.js';

/**
 * Helper component allowing to display separate views for different types of GQL request errors.
 */
export function GqlResponseError(props: {
  error: GqlRequestError;
  fetch: (error: Accessor<unknown>) => JSXElement;
  gql: (errors: Accessor<GqlError[]>) => JSXElement;
  http: (error: Accessor<[status: number, statusText: string]>) => JSXElement;
  invalidData: (error: Accessor<unknown>) => JSXElement;
}) {
  function withError<T>(fn: (err: GqlRequestError) => T) {
    return () => fn(props.error);
  }

  const whenFetch = withError(e => e[0] === 'fetch' ? e[1] : false);
  const whenGql = withError(e => e[0] === 'gql' ? e[1] : false);
  const whenHttp = withError(e => e[0] === 'http' ? [e[1], e[2]] as [number, string] : false);
  const whenInvalidData = withError(e => e[0] === 'invalid-data' ? e[1] : false);

  return (
    <Switch>
      <Match when={whenFetch()}>{props.fetch}</Match>
      <Match when={whenGql()}>{props.gql}</Match>
      <Match when={whenHttp()}>{props.http}</Match>
      <Match when={whenInvalidData()}>{props.invalidData}</Match>
    </Switch>
  );
}