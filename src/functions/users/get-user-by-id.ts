import { FastifyReply, FastifyRequest } from 'fastify';
import { db } from '@/drizzle/db';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

type UserParams = {
  id: string;
};

// Get user by ID
export async function getUserById(
  request: FastifyRequest<{ Params: UserParams }>,
  reply: FastifyReply,
) {
  const { id } = request.params;

  try {
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
      })
      .from(users)
      .where(eq(users.id, +id))
      .limit(1);

    if (user.length === 0) {
      return reply.code(404).send({ error: 'User not found' });
    }

    return user[0];
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal Server Error' });
  }
}
