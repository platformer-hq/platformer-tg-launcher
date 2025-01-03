import { onCleanup } from 'solid-js';

import { TimeoutError } from '@/async/TimeoutError.js';

/**
 * Creates a new self-cleaning-up abort signal.
 * @param timeout - timeout duration
 */
export function createAbortSignal(timeout: number): AbortSignal {
  const controller = new AbortController();
  const timeoutID = setTimeout(() => {
    controller.abort(new TimeoutError(timeout));
  }, timeout);

  onCleanup(() => {
    clearTimeout(timeoutID);
  });

  return controller.signal;
}