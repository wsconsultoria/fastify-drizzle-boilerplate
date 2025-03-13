import { FastifyInstance } from 'fastify';
import { getUserById, getUsers, updateUser, deleteUser } from '@/functions/users';
import { buildJsonSchemas } from 'fastify-zod';
import {
  userSchema,
  userArraySchema,
  userParamsSchema,
  updateUserBodySchema,
} from '@/validators/users';

export async function userRoutes(fastify: FastifyInstance) {
  // Add JWT authentication to all routes in this plugin
  fastify.addHook('onRequest', fastify.authenticate);

  // Build JSON schemas for Fastify
  const { schemas: userSchemas, $ref } = buildJsonSchemas({
    userSchema,
    userArraySchema,
    userParamsSchema,
    updateUserBodySchema,
  });

  // Add schemas to Fastify instance
  for (const schema of userSchemas) {
    fastify.addSchema(schema);
  }

  // Get all users
  fastify.get(
    '/',
    {
      schema: {
        response: {
          200: $ref('userArraySchema'),
        },
      },
    },
    getUsers,
  );

  // Get user by ID
  fastify.get(
    '/:id',
    {
      schema: {
        params: $ref('userParamsSchema'),
        response: {
          200: $ref('userSchema'),
        },
      },
    },
    getUserById,
  );

  // Update user
  fastify.put(
    '/:id',
    {
      schema: {
        params: $ref('userParamsSchema'),
        body: $ref('updateUserBodySchema'),
        response: {
          200: $ref('userSchema'),
        },
      },
    },
    updateUser,
  );

  // Delete user
  fastify.delete(
    '/:id',
    {
      schema: {
        params: $ref('userParamsSchema'),
        response: {
          204: null,
        },
      },
    },
    deleteUser,
  );
}
