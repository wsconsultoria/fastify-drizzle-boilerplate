import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { registerRoutes } from '@/routes';
import authenticate from '@/plugins/authenticate';

// Create Fastify instance
export const app: FastifyInstance = Fastify({
  logger: true,
});

// Register plugins
app.register(cors, {
  origin: true,
});

app.register(jwt, {
  secret: process.env.JWT_SECRET || 'supersecretkey',
});

// Register authentication plugin
app.register(authenticate);

// Register Swagger
app.register(swagger, {
  openapi: {
    info: {
      title: 'Fastify API',
      description: 'API documentation',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
});

app.register(swaggerUi, {
  routePrefix: '/documentation',
});

// Register routes
registerRoutes(app);

// Health check route
app.get('/health', async () => {
  return { status: 'ok' };
});

// Error handler
app.setErrorHandler((error, request, reply) => {
  app.log.error(error);

  reply.status(error.statusCode || 500).send({
    error: {
      message: error.message || 'Internal Server Error',
      code: error.code || 'INTERNAL_SERVER_ERROR',
    },
  });
});

export default app;
