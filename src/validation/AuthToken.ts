import { object, string } from 'superstruct';

import { DateISO } from '@/validation/DateISO.js';

export const AuthToken = object({
  token: string(),
  expiresAt: DateISO,
});