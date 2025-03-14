import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import Fastify, { FastifyInstance } from 'fastify';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';

import authenticate from '@/plugins/authenticate';
import checkRole from '@/plugins/check-role';
import loggerPlugin from '@/plugins/logger';
import { registerRoutes } from '@/routes';

// Scalar UI precisa ser importado via require
/* eslint-disable @typescript-eslint/no-require-imports */
const scalarUI = require('@scalar/fastify-api-reference');
/* eslint-enable @typescript-eslint/no-require-imports */

// Create Fastify instance
export const app: FastifyInstance = Fastify({
  logger: false, // Desativamos o logger padrão do Fastify pois usaremos o Winston
});

// Setup function to register all plugins and routes
export async function setupApp(): Promise<FastifyInstance> {
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Register plugins
  app.register(cors, {
    origin: true,
  });

  app.register(jwt, {
    secret: process.env.JWT_SECRET || 'supersecretkey',
    verify: {
      extractToken: request => {
        // Tenta extrair o token do header de autorização
        const authHeader = request.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          return authHeader.substring(7);
        }

        // Tenta extrair o token do corpo da requisição (para refresh tokens)
        if (request.body && typeof request.body === 'object' && 'refreshToken' in request.body) {
          return request.body.refreshToken as string;
        }

        // Retorna undefined em vez de null
        return undefined;
      },
    },
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

  // Register logger plugin
  app.register(loggerPlugin);
  
  // Register authentication plugins
  app.register(authenticate);
  app.register(checkRole);

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
