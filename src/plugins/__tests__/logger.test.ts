import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import loggerPlugin from '../logger';
import logger from '../../utils/logger';

describe('Logger Plugin', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    // Espionar os métodos do logger
    vi.spyOn(logger, 'info').mockImplementation(() => logger);
    vi.spyOn(logger, 'error').mockImplementation(() => logger);

    // Criar uma instância do Fastify para cada teste
    app = Fastify({ logger: false });
    await app.register(loggerPlugin);
    
    // Adicionar rotas de teste antes de inicializar o servidor
    app.get('/test', (request, reply) => {
      return { success: true };
    });
    
    app.get('/error', () => {
      throw new Error('Erro de teste');
    });
    
    await app.ready();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    app.close();
  });

  it('deve registrar o plugin de logger corretamente', () => {
    expect(app.hasDecorator('logger')).toBe(true);
  });

  it('deve registrar logs na requisição', async () => {
    // Fazer uma requisição para a rota
    await app.inject({
      method: 'GET',
      url: '/test'
    });

    // Verificar se o logger foi chamado
    expect(logger.info).toHaveBeenCalledWith('Requisição recebida', expect.any(Object));
    expect(logger.info).toHaveBeenCalledWith('Resposta enviada', expect.any(Object));
  });

  it('deve registrar logs de erro', async () => {
    // Fazer uma requisição para a rota
    await app.inject({
      method: 'GET',
      url: '/error'
    });

    // Verificar se o logger de erro foi chamado
    expect(logger.error).toHaveBeenCalledWith('Erro na requisição', expect.any(Object));
  });
});
