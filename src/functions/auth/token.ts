import { FastifyInstance } from 'fastify';

// Configurações de tokens
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutos
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 dias

/**
 * Gera um novo access token para um usuário
 */
export function generateAccessToken(app: FastifyInstance, userId: number): string {
  return app.jwt.sign({ id: userId, type: 'access' }, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

/**
 * Gera um novo refresh token para um usuário
 */
export function generateRefreshToken(app: FastifyInstance, userId: number): string {
  // Usamos o mesmo segredo, mas com tipo diferente e expiração mais longa
  return app.jwt.sign({ id: userId, type: 'refresh' }, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

/**
 * Verifica se um refresh token é válido
 */
export function verifyRefreshToken(
  app: FastifyInstance,
  token: string,
): { valid: boolean; userId?: number } {
  try {
    // Verificamos o token com as opções padrão
    const decoded = app.jwt.verify(token) as { id: number; type: string };

    // Verificamos se é realmente um refresh token
    if (decoded.type !== 'refresh') {
      return { valid: false };
    }

    return { valid: true, userId: decoded.id };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erro ao verificar refresh token:', error);
    return { valid: false };
  }
}

/**
 * Retorna a configuração de expiração do access token
 */
export function getAccessTokenExpiry(): string {
  return ACCESS_TOKEN_EXPIRY;
}

/**
 * Retorna a configuração de expiração do refresh token
 */
export function getRefreshTokenExpiry(): string {
  return REFRESH_TOKEN_EXPIRY;
}
