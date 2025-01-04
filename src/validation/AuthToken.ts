import { string, type } from 'superstruct';

import { DateISO } from '@/validation/DateISO.js';

export const AuthToken = type({
  token: string(),
  expiresAt: DateISO,
});