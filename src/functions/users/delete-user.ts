import { eq } from 'drizzle-orm';
import { FastifyReply, FastifyRequest } from 'fastify';

import { db } from '@/drizzle/db';
import { users } from '@/drizzle/schema';

type UserParams = {
  id: string;
};

// Delete user
export async function deleteUser(
  request: FastifyRequest<{ Params: UserParams }>,
  reply: FastifyReply,
) {
  const { id } = request.params;

  try {
    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.id, +id)).limit(1);

    if (existingUser.length === 0) {
      return reply.code(404).send({ error: 'User not found' });
    }

    // Delete user
    await db.delete(users).where(eq(users.id, +id));

    return reply.code(204).send();
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal Server Error' });
  }
}
