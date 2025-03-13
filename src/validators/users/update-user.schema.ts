import { z } from 'zod';

// Schema for update user request body
export const updateUserBodySchema = z
  .object({
    name: z.string().optional(),
    email: z.string().email().optional(),
  })
  .strict();

// Type definition derived from schema
export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;
