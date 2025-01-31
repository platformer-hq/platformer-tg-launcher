import { errorClass } from 'error-kid';

export const [TimeoutError] = errorClass<[timeout: number]>(
  'TimeoutError',
  timeout => [`Timed out: ${timeout}ms`]
)