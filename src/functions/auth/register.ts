import { FastifyReply, FastifyRequest } from 'fastify';
import { db } from '@/drizzle/db';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from './utils';

type RegisterRequest = {
  email: string;
  password: string;
  name: string;
};

// Register function
export async function register(
  request: FastifyRequest<{ Body: RegisterRequest }>,
  reply: FastifyReply,
) {
  const { email, password, name } = request.body;

  try {
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUser.length > 0) {
      return reply.code(409).send({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = hashPassword(password);

    // Create new user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        name,
      })
      .returning();

    return reply.code(201).send({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal Server Error' });
  }
}
