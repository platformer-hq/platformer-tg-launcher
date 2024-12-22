import { string } from 'zod';

export function dateISO() {
  return string()
    .refine((val) => !!Date.parse(val), {
      message: 'Invalid ISO date string',
    })
    .transform((val) => new Date(val));
}