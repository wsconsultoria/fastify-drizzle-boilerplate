import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import logger, { logRequest } from '../utils/logger';

// Estendendo a interface do Fastify para incluir o timestamp
declare module 'fastify' {
  interface FastifyRequest {
    requestTimestamp?: number;
  }
}

const loggerPlugin: FastifyPluginAsync = async (fastify) => {
  // Substituir o logger padrão do Fastify pelo Winston
  fastify.decorate('logger', logger);

  // Hook para log de requisições
  fastify.addHook('onRequest', (request, reply, done) => {
    // Armazenamos o timestamp inicial da requisição
    request.requestTimestamp = Date.now();
    logger.info('Requisição recebida', logRequest(request));
    done();
  });

  // Hook para log de respostas
  fastify.addHook('onResponse', (request, reply, done) => {
    // Calculamos o tempo de resposta usando o timestamp armazenado
    const startTime = request.requestTimestamp || Date.now();
    const responseTime = Date.now() - startTime;
    logger.info('Resposta enviada', {
      ...logRequest(request),
      statusCode: reply.statusCode,
      responseTime: `${responseTime}ms`,
    });
    done();
  });

  // Hook para log de erros
  fastify.addHook('onError', (request, reply, error, done) => {
    logger.error('Erro na requisição', {
      ...logRequest(request),
      statusCode: reply.statusCode,
      error: {
        message: error.message,
        stack: error.stack,
      },
    });
    done();
  });
};

export default fp(loggerPlugin, {
  name: 'logger',
  fastify: '5.x',
});
