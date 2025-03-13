import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { login, register } from '@/functions/auth';
import { userSchema, loginBodySchema, loginResponseSchema, registerBodySchema } from '@/validators';

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  // Use regular Fastify instance
  const app = fastify;

  // Login route
  app.withTypeProvider<ZodTypeProvider>().post<{
    Body: z.infer<typeof loginBodySchema>;
    Reply: z.infer<typeof loginResponseSchema>;
  }>(
    '/login',
    {
      schema: {
        body: loginBodySchema,
        response: {
          200: loginResponseSchema,
        },
      },
    },
    (request, reply) => login(app, request, reply),
  );

  // Register route
  app.withTypeProvider<ZodTypeProvider>().post<{
    Body: z.infer<typeof registerBodySchema>;
    Reply: z.infer<typeof userSchema>;
  }>(
    '/register',
    {
      schema: {
        body: registerBodySchema,
        response: {
          201: userSchema,
        },
      },
    },
    register,
  );

  // Define o schema para o corpo da requisição de refresh token
  const refreshTokenBodySchema = z
    .object({
      refreshToken: z.string(),
    })
    .strict();

  // Define o schema para a resposta do refresh token
  const refreshTokenResponseSchema = z
    .object({
      token: z.string(),
    })
    .strict();

  // Define o schema para a resposta de erro
  const errorResponseSchema = z
    .object({
      error: z.string(),
    })
    .strict();

  // Rota para renovar o token de acesso usando o refresh token
  app.withTypeProvider<ZodTypeProvider>().post<{
    Body: z.infer<typeof refreshTokenBodySchema>;
    Reply: z.infer<typeof refreshTokenResponseSchema> | z.infer<typeof errorResponseSchema>;
  }>(
    '/refresh-token',
    {
      schema: {
        body: refreshTokenBodySchema,
        response: {
          200: refreshTokenResponseSchema,
          401: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { refreshToken } = request.body;

      try {
        // Verifica o token diretamente com o método jwt.verify do fastify
        const decoded = app.jwt.verify(refreshToken) as { id: number; type: string };

        // Verifica se é um refresh token
        if (decoded.type !== 'refresh') {
          return reply.code(401).send({ error: 'Invalid refresh token' });
        }

        // Gera um novo access token
        const newAccessToken = await reply.jwtSign(
          { id: decoded.id, type: 'access' },
          { expiresIn: '15m' },
        );

        return { token: newAccessToken };
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Erro ao verificar refresh token:', error);
        return reply.code(401).send({ error: 'Invalid refresh token' });
      }
    },
  );
}
