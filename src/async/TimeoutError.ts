export class TimeoutError extends Error {
  constructor(readonly timeout: number) {
    super(`Timed out: ${timeout}ms`);
    this.name = 'TimeoutError';
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}