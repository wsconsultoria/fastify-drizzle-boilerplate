import { z } from 'zod';
import { UserRoleEnum } from '../users/user.schema';

// Schema for register request body
export const registerBodySchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    role: UserRoleEnum.optional().default('USER'),
  })
  .strict();

// Type definition derived from schema
export type RegisterBody = z.infer<typeof registerBodySchema>;
