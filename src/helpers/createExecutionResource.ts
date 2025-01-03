import { createEffect, createResource, onCleanup, type ResourceSource } from 'solid-js';

import type { ExecutionTuple } from '@/types/execution.js';

/**
 * Creates a resource with some extended list of options, calling hooks.
 * @param source - fetcher source.
 * @param fetcher - fetcher function.
 * @param options - additional options.
 */
export function createExecutionResource<Data, Err = unknown, Source = object>(
  source: ResourceSource<Source>,
  fetcher: (
    source: Source,
    options: { abortSignal: AbortSignal },
  ) => ExecutionTuple<Data, Err> | PromiseLike<ExecutionTuple<Data, Err>>,
  options?: {
    abortSignal?: AbortSignal;
    onError?(err: Err): void;
    onData?(data: Data): void;
  },
) {
  options ||= {};
  const controller = new AbortController();
  const result = createResource(
    () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const s = typeof source === 'function' ? (source as any)() : source;
      return [null, undefined, false].includes(s) ? false : {
        options: { abortSignal: options.abortSignal || controller.signal },
        source: s,
      };
    },
    async (args) => fetcher(args.source, args.options),
  );

  onCleanup(() => {
    controller.abort();
  });

  createEffect(() => {
    const [resource] = result;
    if (resource.state === 'ready') {
      const tuple = resource();
      const { onData, onError } = options;
      tuple[0]
        ? onData && onData(tuple[1])
        : onError && onError(tuple[1]);
    }
  });

  return result;
}
