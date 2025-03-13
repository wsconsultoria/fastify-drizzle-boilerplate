import { eq } from 'drizzle-orm';
import { FastifyReply, FastifyRequest } from 'fastify';

import { hashPassword } from './utils';

import { db } from '@/drizzle/db';
import { users } from '@/drizzle/schema';

type LoginRequest = {
  email: string;
  password: string;
};

// Login function
export async function login(request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply) {
  const { email, password } = request.body;

  try {
    // Find user by email
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (user.length === 0) {
      return reply.code(401).send({ error: 'Invalid email or password' });
    }

    const foundUser = user[0];

    // Check password
    const hashedPassword = hashPassword(password);
    if (hashedPassword !== foundUser.password) {
      return reply.code(401).send({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = await reply.jwtSign(
      {
        id: foundUser.id,
        email: foundUser.email,
      },
      { expiresIn: '1d' },
    );

    return {
      token,
      user: {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
      },
    };
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal Server Error' });
  }
}
