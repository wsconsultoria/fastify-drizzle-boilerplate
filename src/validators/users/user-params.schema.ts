import { z } from 'zod';

// Schema for user route parameters
export const userParamsSchema = z.object({
  id: z.string(),
});

// Type definition derived from schema
export type UserParams = z.infer<typeof userParamsSchema>;
