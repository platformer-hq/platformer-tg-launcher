import {
  createResource,
  type Accessor,
  createMemo,
  type FlowProps,
  type JSXElement,
  onCleanup,
  Show,
} from 'solid-js';

import type { ExecutionTuple } from '@/types/execution.js';
import { splitExecutionTuple } from '@/helpers/splitExecutionTuple.js';

export type ResourceProps<Data, Err = unknown, Source = object> = FlowProps<
  {
    abortSignal?: AbortSignal,
    error?: (error: Accessor<Err>) => JSXElement,
    fetcher(
      source: Source,
      options: { abortSignal: AbortSignal },
    ): ExecutionTuple<Data, Err> | PromiseLike<ExecutionTuple<Data, Err>>;
    loading?: JSXElement;
    source: Source;
  },
  (data: Accessor<Data>) => JSXElement
>;

/**
 * Helper to split resource results into separate views.
 */
export function Resource<Data, Err = unknown, Source = object>(
  props: ResourceProps<Data, Err, Source>,
) {
  const controller = new AbortController();
  const abortSignal = createMemo(() => props.abortSignal || controller.signal);

  const [resource] = createResource(
    () => ({
      fetcher: props.fetcher,
      options: { abortSignal: abortSignal() },
      source: props.source,
    }),
    async (args) => args.fetcher(args.source, args.options),
  );

  onCleanup(() => {
    controller.abort();
  });

  return (
    <Show when={resource.state === 'ready' ? resource() : false} fallback={props.loading}>
      {resourceData => {
        const [data, error] = splitExecutionTuple(resourceData);
        return (
          <Show when={data.ok() && data()} fallback={props.error && props.error(error)}>
            {props.children}
          </Show>
        );
      }}
    </Show>
  );
}