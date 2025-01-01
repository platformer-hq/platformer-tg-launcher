import {
  type Accessor,
  type FlowProps,
  type JSXElement,
  type Resource,
  Show,
} from 'solid-js';

import { splitExecutionTuple } from '@/helpers/splitExecutionTuple.js';
import type { GqlRequestError, GqlRequestResult } from '@/api/gqlRequest.js';

export type GqlResponseResourceProps<T> = FlowProps<
  {
    error: (err: Accessor<GqlRequestError>) => JSXElement;
    loading: JSXElement;
    resource: Resource<GqlRequestResult<T>>;
  },
  (data: Accessor<T>) => JSXElement
>;

/**
 * Accepts a resource containing a GraphQL request result and displays a view depending on it.
 */
export function GqlResponseResource<T>(props: GqlResponseResourceProps<T>) {
  return (
    <Show
      when={props.resource.state === 'ready' ? props.resource() : undefined}
      fallback={props.loading}
    >
      {resourceData => {
        const [data, error] = splitExecutionTuple(resourceData);
        return (
          <Show when={data.ok() && data()} fallback={props.error(error)}>
            {props.children}
          </Show>
        );
      }}
    </Show>
  );
}