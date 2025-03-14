import { FastifyInstance } from 'fastify';

// Configurações de tokens
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutos
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 dias

type UserRole = 'USER' | 'ADMIN';

interface JwtPayload {
  id: number;
  email?: string;
  role: UserRole;
  type: 'access' | 'refresh';
}

interface TokenVerificationResult {
  valid: boolean;
  userId?: number;
  email?: string;
  role?: UserRole;
}

/**
 * Gera um novo access token para um usuário
 */
export function generateAccessToken(
  app: FastifyInstance, 
  userId: number, 
  email: string | undefined = undefined, 
  role: UserRole = 'USER'
): string {
  return app.jwt.sign(
    { 
      id: userId,
      email,
      role,
      type: 'access'
    } as JwtPayload, 
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

/**
 * Gera um novo refresh token para um usuário
 */
export function generateRefreshToken(
  app: FastifyInstance, 
  userId: number, 
  email: string | undefined = undefined, 
  role: UserRole = 'USER'
): string {
  return app.jwt.sign(
    { 
      id: userId,
      email,
      role,
      type: 'refresh'
    } as JwtPayload, 
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
}

/**
 * Verifica se um refresh token é válido
 */
export function verifyRefreshToken(
  app: FastifyInstance,
  token: string,
): TokenVerificationResult {
  try {
    const decoded = app.jwt.verify(token) as JwtPayload;

    if (decoded.type !== 'refresh') {
      return { valid: false };
    }

    return { 
      valid: true, 
      userId: decoded.id,
      email: decoded.email,
      role: decoded.role
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Erro ao verificar refresh token:', error.message);
    }
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
