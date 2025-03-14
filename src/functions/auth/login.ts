import { eq } from 'drizzle-orm';
import { FastifyReply, FastifyRequest, FastifyInstance } from 'fastify';

import { db } from '@/drizzle/db';
import { users } from '@/drizzle/schema';
import { User } from '@/validators';

import { hashPassword } from './utils';

type LoginRequest = {
  email: string;
  password: string;
};

// Login function
export async function login(
  fastify: FastifyInstance,
  request: FastifyRequest<{ Body: LoginRequest }>,
  reply: FastifyReply,
): Promise<{ token: string; refreshToken: string; user: User }> {
  const { email, password } = request.body;

  try {
    // Find user by email
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      return reply.code(401).send({ error: 'Invalid email or password' });
    }

    // Check password
    const hashedPassword = hashPassword(password);
    if (hashedPassword !== user.password) {
      return reply.code(401).send({ error: 'Invalid email or password' });
    }

    // Gera o access token usando o método jwtSign do reply
    const accessToken = await reply.jwtSign(
      { id: user.id, role: user.role, type: 'access' },
      { expiresIn: '15m' }
    );

    // Gera o refresh token usando o método jwtSign do reply
    const refreshToken = await reply.jwtSign(
      { id: user.id, role: user.role, type: 'refresh' },
      { expiresIn: '7d' }
    );

    return {
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal Server Error' });
  }
}
