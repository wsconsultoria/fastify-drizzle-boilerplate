import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import zodToJsonSchema from 'zod-to-json-schema';

import { login, register } from '@/functions/auth';
import { userSchema, loginBodySchema, loginResponseSchema, registerBodySchema } from '@/validators';

export async function authRoutes(fastify: FastifyInstance) {
  // Use regular Fastify instance
  const app = fastify;

  // Login route
  app.withTypeProvider<ZodTypeProvider>().post(
    '/login',
    {
      schema: {
        body: loginBodySchema,
        response: {
          200: loginResponseSchema,
        },
      },
    },
    login,
  );

  // Register route
  app.withTypeProvider<ZodTypeProvider>().post(
    '/register',
    {
      schema: {
        body: registerBodySchema,
        response: {
          201: userSchema,
        },
      },
    },
    register,
  );
}
