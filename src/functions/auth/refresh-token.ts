import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

// Definindo o tipo para o payload do JWT
interface JwtPayload {
  id: number;
  email: string;
  role: 'ADMIN' | 'USER';
  type: 'access' | 'refresh';
}

const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

export const refreshToken = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    // Se o corpo estiver vazio ou não for um objeto, isso vai gerar um TypeError
    if (!request.body || typeof request.body !== 'object') {
      throw new TypeError('Invalid request body');
    }

    const { refreshToken } = refreshTokenSchema.parse(request.body) as RefreshTokenInput;

    // Verificar o refresh token
    const decoded = await reply.request.server.jwt.verify(refreshToken) as JwtPayload;

    // Verificar se o token é do tipo refresh
    if (decoded.type !== 'refresh') {
      return reply.code(401).send({ error: 'Invalid refresh token' });
    }

    // Extrair informações do usuário
    const { id, email, role } = decoded;

    // Gerar novo token de acesso
    const accessToken = reply.request.server.jwt.sign(
      {
        id,
        email,
        role,
        type: 'access',
      } as JwtPayload,
      { expiresIn: '15m' }
    );

    // Gerar novo refresh token
    const newRefreshToken = reply.request.server.jwt.sign(
      {
        id,
        email,
        role,
        type: 'refresh',
      } as JwtPayload,
      { expiresIn: '7d' }
    );

    // Retornar os novos tokens
    return reply.code(200).send({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    request.log.error(error);
    
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ error: 'Invalid data', errors: error.errors });
    }
    
    if (error instanceof TypeError) {
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
    
    return reply.code(401).send({ error: 'Invalid refresh token' });
  }
};
