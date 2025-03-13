import { FastifyInstance } from 'fastify';
import { login, register } from '@/functions/auth';
import { buildJsonSchemas } from 'fastify-zod';
import { userSchema, loginBodySchema, loginResponseSchema, registerBodySchema } from '@/validators';

export async function authRoutes(fastify: FastifyInstance) {
  // Build JSON schemas for Fastify
  const { schemas: authSchemas, $ref } = buildJsonSchemas({
    userSchema,
    loginBodySchema,
    loginResponseSchema,
    registerBodySchema,
  });

  // Add schemas to Fastify instance
  for (const schema of authSchemas) {
    fastify.addSchema(schema);
  }

  // Login route
  fastify.post(
    '/login',
    {
      schema: {
        body: $ref('loginBodySchema'),
        response: {
          200: $ref('loginResponseSchema'),
        },
      },
    },
    login,
  );

  // Register route
  fastify.post(
    '/register',
    {
      schema: {
        body: $ref('registerBodySchema'),
        response: {
          201: $ref('userSchema'),
        },
      },
    },
    register,
  );
}
