import {
  type Accessor,
  type Component,
  type JSXElement,
  Match,
  type Resource,
  Show,
  Switch,
} from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { splitGqlResponse } from '@/helpers/splitGqlResponse.js';
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
      {data => {
        const [okData, errData] = splitGqlResponse(data);
        return (
          <Switch>
            <Match when={okData()}>
              {props.children}
            </Match>
            <Match when={errData()}>
              {props.Error}
            </Match>
          </Switch>
        );
      }}
    </Show>
  );
}