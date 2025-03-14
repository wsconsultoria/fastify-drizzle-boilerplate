import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

export async function protectedRoutes(fastify: FastifyInstance): Promise<void> {
  // Use o plugin de verificação de role para proteger todas as rotas
  fastify.addHook('onRequest', fastify.authenticate);
  fastify.addHook('onRequest', fastify.checkUser);

  // Use regular Fastify instance
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // Rota de informações do usuário
  app.get(
    '/',
    {
      schema: {
        response: {
          200: z.object({
            message: z.string(),
            userInfo: z.object({
              id: z.number(),
              role: z.string(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      return {
        message: 'Área protegida - Acesso para usuários autenticados',
        userInfo: {
          id: request.user.id,
          role: request.user.role,
        },
      };
    },
  );

  // Rota para dados do perfil (exemplo)
  app.get(
    '/profile',
    {
      schema: {
        response: {
          200: z.object({
            id: z.number(),
            role: z.string(),
            lastAccess: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      return {
        id: request.user.id,
        role: request.user.role,
        lastAccess: new Date().toISOString(),
      };
    },
  );
}
