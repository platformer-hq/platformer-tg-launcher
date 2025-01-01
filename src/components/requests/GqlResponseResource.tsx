import {
  type Accessor,
  type Component,
  type JSXElement,
  type Resource,
  Show,
} from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { splitExecutionTuple } from '@/helpers/splitExecutionTuple.js';
import type { GqlRequestError, GqlRequestResult } from '@/api/gqlRequest.js';

/**
 * Accepts a resource containing a GraphQL request result and displays a view depending on it.
 */
export function GqlResponseResource<T>(props: {
  Error: (err: Accessor<GqlRequestError>) => JSXElement;
  Loading: Component;
  children: (data: Accessor<T>) => JSXElement;
  resource: Resource<GqlRequestResult<T>>;
}) {
  return (
    <Show
      when={props.resource.state === 'ready' ? props.resource() : undefined}
      fallback={<Dynamic component={props.Loading}/>}
    >
      {resourceData => {
        const [data, error] = splitExecutionTuple(resourceData);
        return (
          <Show when={data.ok() && data()} fallback={props.Error(error)}>
            {props.children}
          </Show>
        );
      }}
    </Show>
  );
}