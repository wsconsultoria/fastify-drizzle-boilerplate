import { FastifyReply, FastifyRequest } from 'fastify';
import { db } from '@/drizzle/db';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

type UserParams = {
  id: string;
};

type UpdateUserBody = {
  name?: string;
  email?: string;
};

// Update user
export async function updateUser(
  request: FastifyRequest<{ Params: UserParams; Body: UpdateUserBody }>,
  reply: FastifyReply,
) {
  const { id } = request.params;
  const { name, email } = request.body;

  try {
    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.id, +id)).limit(1);

    if (existingUser.length === 0) {
      return reply.code(404).send({ error: 'User not found' });
    }

    // Prepare update data
    const updateData: { name?: string; email?: string } = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    // Update user
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, +id))
      .returning();

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
    };
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal Server Error' });
  }
}
