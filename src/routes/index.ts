import { FastifyInstance } from 'fastify';

import { adminRoutes } from '@/routes/admin.routes';
import { authRoutes } from '@/routes/auth.routes';
import { protectedRoutes } from '@/routes/protected.routes';
import { userRoutes } from '@/routes/user.routes';

export const registerRoutes = (app: FastifyInstance): void => {
  // Register all route groups here
  app.register(authRoutes, { prefix: '/api/auth' });
  app.register(userRoutes, { prefix: '/api/users' });
  app.register(protectedRoutes, { prefix: '/api/protected' });
  app.register(adminRoutes, { prefix: '/api/admin' });
};
