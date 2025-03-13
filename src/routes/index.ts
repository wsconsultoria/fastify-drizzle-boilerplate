import { FastifyInstance } from 'fastify';

import { authRoutes } from '@/routes/auth.routes';
import { userRoutes } from '@/routes/user.routes';

export const registerRoutes = (app: FastifyInstance): void => {
  // Register all route groups here
  app.register(authRoutes, { prefix: '/api/auth' });
  app.register(userRoutes, { prefix: '/api/users' });
};
