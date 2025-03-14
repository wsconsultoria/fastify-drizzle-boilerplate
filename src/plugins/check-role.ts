import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

// Declare module augmentation for TypeScript
declare module 'fastify' {
  interface FastifyInstance {
    checkRole: (
      roles: string[],
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
    checkAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    checkUser: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp(async function (fastify: FastifyInstance) {
  // Função genérica para verificar roles
  fastify.decorate(
    'checkRole',
    async function (roles: string[], request: FastifyRequest, reply: FastifyReply) {
      try {
        // Verifica se o usuário está autenticado
        await request.jwtVerify();

        // Verifica se o usuário tem a role necessária
        const userRole = request.user.role;
        if (!roles.includes(userRole)) {
          return reply.code(403).send({
            error: 'Acesso negado. Você não tem permissão para acessar este recurso.',
          });
        }
      } catch (error) {
        reply.code(401).send({ error: 'Não autorizado' });
      }
    }
  );

  // Função para verificar se o usuário é ADMIN
  fastify.decorate('checkAdmin', async function (request: FastifyRequest, reply: FastifyReply) {
    return fastify.checkRole(['ADMIN'], request, reply);
  });

  // Função para verificar se o usuário é USER ou ADMIN (ambos podem acessar)
  fastify.decorate('checkUser', async function (request: FastifyRequest, reply: FastifyReply) {
    return fastify.checkRole(['USER', 'ADMIN'], request, reply);
  });
});
