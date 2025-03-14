import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

export async function adminRoutes(fastify: FastifyInstance): Promise<void> {
  // Use o plugin de verificação de role para proteger todas as rotas
  fastify.addHook('onRequest', fastify.authenticate);
  fastify.addHook('onRequest', fastify.checkAdmin);

  // Use regular Fastify instance
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // Rota de informações administrativas
  app.get(
    '/',
    {
      schema: {
        response: {
          200: z.object({
            message: z.string(),
            timestamp: z.number(),
          }),
        },
      },
    },
    async (request, reply) => {
      return {
        message: 'Área administrativa - Acesso restrito a administradores',
        timestamp: Date.now(),
      };
    },
  );

  // Rota para estatísticas (exemplo)
  app.get(
    '/stats',
    {
      schema: {
        response: {
          200: z.object({
            totalUsers: z.number(),
            activeUsers: z.number(),
            lastUpdated: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      // Aqui você implementaria a lógica real para buscar estatísticas
      return {
        totalUsers: 150,
        activeUsers: 42,
        lastUpdated: new Date().toISOString(),
      };
    },
  );
}
