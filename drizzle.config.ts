import type { Config } from 'drizzle-kit';

export default {
  schema: './src/drizzle/schema.ts',
  out: './src/drizzle/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/boilerplate',
  },
} satisfies Config;
