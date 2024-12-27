import { coerce, date, unknown } from 'superstruct';

export const DateISO = coerce(date(), unknown(), (v) => {
  return Date.parse(String(v));
});