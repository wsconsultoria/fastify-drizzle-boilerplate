import { z } from 'zod';

// Schema for user route parameters
export const userParamsSchema = z
  .object({
    id: z.string().transform(val => parseInt(val, 10)),
  })
  .strict();

// Type definition derived from schema
export type UserParams = z.infer<typeof userParamsSchema>;
