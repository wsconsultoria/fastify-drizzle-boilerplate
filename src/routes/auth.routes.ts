import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { login, register } from '@/functions/auth';
import { refreshToken } from '@/functions/auth/refresh-token';
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
      accessToken: z.string(),
      refreshToken: z.string(),
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
          400: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    (request, reply) => refreshToken(request, reply),
  );
}
