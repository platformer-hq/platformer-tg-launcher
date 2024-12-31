import { coerce, min, integer, string } from 'superstruct';

export const PositiveIntFromStr = coerce(
  min(integer(), 1),
  string(),
  v => parseInt(v, 10),
);
