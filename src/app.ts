import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import Fastify, { FastifyInstance } from 'fastify';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';

import authenticate from '@/plugins/authenticate';
import { registerRoutes } from '@/routes';

// @ts-ignore
const scalarUI = require('@scalar/fastify-api-reference');

// Create Fastify instance
export const app: FastifyInstance = Fastify({
  logger: true,
});

// Setup function to register all plugins and routes
export async function setupApp() {
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Register plugins
  app.register(cors, {
    origin: true,
  });

  app.register(jwt, {
    secret: process.env.JWT_SECRET || 'supersecretkey',
  });

  app.register(swagger, {
    transform: jsonSchemaTransform,
    openapi: {
      info: {
        title: 'Boilerplate API',
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

  app.register(scalarUI, {
    routePrefix: '/documentation',
  });

  // Register authentication plugin
  app.register(authenticate);

  // Register routes
  registerRoutes(app);

  return app;
}

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
