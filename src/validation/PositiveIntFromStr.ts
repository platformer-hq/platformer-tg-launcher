import { coerce, min, integer, string } from 'superstruct';

export const PositiveIntFromStr = coerce(
  min(integer(), 1),
  string(),
  v => {
    // Preserving v to display the initial value in the error.
    return parseInt(v, 10) || v;
  },
);
