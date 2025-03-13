import { createHash } from 'crypto';

// Helper function to hash passwords
export const hashPassword = (password: string): string => {
  return createHash('sha256').update(password).digest('hex');
};
