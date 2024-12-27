import { coerce, date, unknown } from 'superstruct';

export const DateISO = coerce(date(), unknown(), (v) => new Date(String(v)));