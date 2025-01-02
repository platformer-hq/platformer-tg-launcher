import { type Accessor, createEffect } from 'solid-js';

import { TimeoutError } from '@/async/TimeoutError.js';

/**
 * Creates a new self-cleaning-up abort signal.
 * @param timeout - timeout duration
 */
export function createAbortSignal(timeout: Accessor<number>): AbortSignal {
  const controller = new AbortController();

  createEffect<number>((timeoutID) => {
    if (timeoutID) {
      clearTimeout(timeoutID);
    }

    const v = timeout();
    return setTimeout(() => {
      controller.abort(new TimeoutError(v));
    }, v);
  })

  return controller.signal;
}