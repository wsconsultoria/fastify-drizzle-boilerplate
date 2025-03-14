import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { protectedRoutes } from '../protected.routes';

describe('protectedRoutes', () => {
  const mockFastify = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    checkRole: vi.fn(),
    authenticate: vi.fn(),
    addHook: vi.fn(),
    withTypeProvider: vi.fn().mockReturnThis(),
  } as unknown as FastifyInstance;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve registrar as rotas protegidas corretamente', async () => {
    await protectedRoutes(mockFastify);

    // Verifica se a rota GET / foi registrada
    expect(mockFastify.get).toHaveBeenCalledWith(
      '/',
      expect.any(Object),
      expect.any(Function)
    );

    // Verifica se a rota GET /profile foi registrada
    expect(mockFastify.get).toHaveBeenCalledWith(
      '/profile',
      expect.any(Object),
      expect.any(Function)
    );
  });

  it('deve verificar se o hook de autenticação foi adicionado', async () => {
    await protectedRoutes(mockFastify);

    // Verifica se o hook de autenticação foi adicionado
    expect(mockFastify.addHook).toHaveBeenCalledWith('onRequest', mockFastify.authenticate);
  });
});
