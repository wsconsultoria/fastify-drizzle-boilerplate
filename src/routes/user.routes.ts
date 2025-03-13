import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

import { getUserById, getUsers, updateUser, deleteUser } from '@/functions/users';
import {
  userSchema,
  userArraySchema,
  userParamsSchema,
  updateUserBodySchema,
} from '@/validators/users';

export async function userRoutes(fastify: FastifyInstance): Promise<void> {
  // Add JWT authentication to all routes in this plugin
  fastify.addHook('onRequest', fastify.authenticate);

  // Use regular Fastify instance
  const app = fastify;

  // Get all users
  app.withTypeProvider<ZodTypeProvider>().get(
    '/',
    {
      schema: {
        response: {
          200: userArraySchema,
        },
      },
    },
    getUsers,
  );

  // Get user by ID
  app.withTypeProvider<ZodTypeProvider>().get(
    '/:id',
    {
      schema: {
        params: userParamsSchema,
        response: {
          200: userSchema,
        },
      },
    },
    getUserById,
  );

  // Update user
  app.withTypeProvider<ZodTypeProvider>().put(
    '/:id',
    {
      schema: {
        params: userParamsSchema,
        body: updateUserBodySchema,
        response: {
          200: userSchema,
        },
      },
    },
    updateUser,
  );

  // Delete user
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/:id',
    {
      schema: {
        params: userParamsSchema,
      },
    },
    deleteUser,
  );
}
