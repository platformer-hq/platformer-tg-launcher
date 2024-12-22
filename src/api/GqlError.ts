export class GqlError extends Error {
  constructor(public readonly code: string, message?: string) {
    super(message);
    this.name = 'GqlError';
    Object.setPrototypeOf(this, GqlError.prototype);
  }
}