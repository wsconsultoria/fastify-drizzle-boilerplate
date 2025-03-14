import '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      id: number;
      role: 'ADMIN' | 'USER';
      type: 'access' | 'refresh';
    };
    user: {
      id: number;
      role: 'ADMIN' | 'USER';
      type: 'access' | 'refresh';
    };
  }
}
