import { FastifyReply, FastifyRequest } from 'fastify';
import { db } from '@/drizzle/db';
import { users } from '@/drizzle/schema';

// Get all users
export async function getUsers(request: FastifyRequest, reply: FastifyReply) {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
      })
      .from(users);

    return allUsers;
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal Server Error' });
  }
}
