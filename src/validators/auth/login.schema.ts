import { z } from 'zod';

import { userSchema } from '../users';

// Schema for login request body
export const loginBodySchema = z
  .object({
    email: z.string().email(),
    password: z.string(),
  })
  .strict();

// Schema for login response
export const loginResponseSchema = z
  .object({
    token: z.string(),
    user: userSchema,
  })
  .strict();

// Type definitions derived from schemas
export type LoginBody = z.infer<typeof loginBodySchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
