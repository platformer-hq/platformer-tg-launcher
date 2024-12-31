import type { Accessor } from 'solid-js';
import type { ExecutionTuple } from '@/types/execution.js';

interface SplitResultSignal<T> extends Accessor<T> {
  ok: Accessor<boolean>;
}

function createSignal<T, E>(
  executionResult: Accessor<ExecutionTuple<T, E>>,
  isOk: true,
): SplitResultSignal<T>;

function createSignal<T, E>(
  executionResult: Accessor<ExecutionTuple<T, E>>,
  isOk: false,
): SplitResultSignal<E>;

function createSignal<T, E>(
  executionResult: Accessor<ExecutionTuple<T, E>>,
  status: boolean,
): SplitResultSignal<T | E> {
  return Object.assign(
    () => {
      const tuple = executionResult();
      if (tuple[0] !== status) {
        throw new Error('Illegal data access. Data is not ready');
      }
      return tuple[1];
    },
    {
      ok() {
        return executionResult()[0] === status;
      },
    },
  );
}

/**
 * Splits a signal, containing the operation execution tuple into two signals, containing
 * data and error.
 * @param executionTuple - signal returning execution result.
 */
export function splitExecutionTuple<T, E>(executionTuple: Accessor<ExecutionTuple<T, E>>): [
  SplitResultSignal<T>,
  SplitResultSignal<E>
] {
  return [
    createSignal(executionTuple, true),
    createSignal(executionTuple, false),
  ];
}