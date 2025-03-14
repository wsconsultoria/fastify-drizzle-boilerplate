import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { adminRoutes } from '../admin.routes';

describe('adminRoutes', () => {
  const mockFastify = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    checkRole: vi.fn(),
    authenticate: vi.fn(),
    checkAdmin: vi.fn(),
    addHook: vi.fn(),
    withTypeProvider: vi.fn().mockReturnThis(),
  } as unknown as FastifyInstance;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve registrar as rotas administrativas corretamente', async () => {
    await adminRoutes(mockFastify);

    // Verifica se as rotas foram registradas
    expect(mockFastify.get).toHaveBeenCalledTimes(2);
    
    // Verifica se a rota GET / foi registrada
    expect(mockFastify.get).toHaveBeenCalledWith(
      expect.stringContaining('/'),
      expect.any(Object),
      expect.any(Function)
    );
  });

  it('deve verificar se as hooks foram adicionadas corretamente', async () => {
    await adminRoutes(mockFastify);

    // Verifica se os hooks foram adicionados
    expect(mockFastify.addHook).toHaveBeenCalledWith('onRequest', mockFastify.authenticate);
    expect(mockFastify.addHook).toHaveBeenCalledWith('onRequest', mockFastify.checkAdmin);
  });
});
