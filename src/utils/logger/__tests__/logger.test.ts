import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import logger, { logRequest } from '../index';

// Mock da requisição do Fastify
const mockRequest = {
  id: '123456',
  method: 'GET',
  url: '/api/test',
  params: { id: '1' },
  headers: {
    'user-agent': 'test-agent',
    'content-type': 'application/json',
    'content-length': '100'
  },
  ip: '127.0.0.1'
};

describe('Logger', () => {
  // Espionar os métodos do logger
  beforeEach(() => {
    vi.spyOn(logger, 'info').mockImplementation(() => logger);
    vi.spyOn(logger, 'error').mockImplementation(() => logger);
    vi.spyOn(logger, 'warn').mockImplementation(() => logger);
    vi.spyOn(logger, 'debug').mockImplementation(() => logger);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve exportar uma instância do logger', () => {
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  it('deve ter os níveis de log configurados corretamente', () => {
    expect(logger.levels).toHaveProperty('error', 0);
    expect(logger.levels).toHaveProperty('warn', 1);
    expect(logger.levels).toHaveProperty('info', 2);
    expect(logger.levels).toHaveProperty('http', 3);
    expect(logger.levels).toHaveProperty('debug', 4);
  });

  it('deve registrar mensagens de log com o nível correto', () => {
    logger.info('Mensagem de info');
    logger.error('Mensagem de erro');
    logger.warn('Mensagem de aviso');
    logger.debug('Mensagem de debug');

    expect(logger.info).toHaveBeenCalledWith('Mensagem de info');
    expect(logger.error).toHaveBeenCalledWith('Mensagem de erro');
    expect(logger.warn).toHaveBeenCalledWith('Mensagem de aviso');
    expect(logger.debug).toHaveBeenCalledWith('Mensagem de debug');
  });

  it('deve extrair informações corretas da requisição', () => {
    const requestInfo = logRequest(mockRequest as any);

    expect(requestInfo).toEqual({
      requestId: '123456',
      method: 'GET',
      url: '/api/test',
      path: '/api/test',
      parameters: { id: '1' },
      headers: {
        'user-agent': 'test-agent',
        'content-type': 'application/json',
        'content-length': '100'
      },
      ip: '127.0.0.1'
    });
  });
});
