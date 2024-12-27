import { nullable, optional, Struct } from 'superstruct';

export function maybe<T, S>(struct: Struct<T, S>) {
  return optional(nullable(struct));
}