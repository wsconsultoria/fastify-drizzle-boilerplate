import { z } from 'zod';

// Schema for user object
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
});

// Schema for array of users
export const userArraySchema = z.array(userSchema);

// Type definitions derived from schemas
export type User = z.infer<typeof userSchema>;
export type UserArray = z.infer<typeof userArraySchema>;
