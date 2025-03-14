import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import checkRolePlugin from '../check-role';

// Mock do Fastify
const mockDecorate = vi.fn();
const mockFastify = {
  decorate: mockDecorate,
} as unknown as FastifyInstance;

// Mock da requisição
const mockRequest = {
  jwtVerify: vi.fn(),
  user: {
    id: 1,
    role: 'USER' as 'USER' | 'ADMIN',
  },
} as unknown as FastifyRequest;

// Mock da resposta
const mockCode = vi.fn();
const mockSend = vi.fn();
const mockReply = {
  code: mockCode,
  send: mockSend,
} as unknown as FastifyReply;

// Configura o mock do code para retornar o objeto mockReply
mockCode.mockImplementation(() => mockReply);

describe('Check Role Plugin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCode.mockImplementation(() => mockReply);
  });

  it('deve registrar as funções de verificação de roles no fastify', async () => {
    const plugin = fp(checkRolePlugin);
    await plugin(mockFastify);

    expect(mockDecorate).toHaveBeenCalledTimes(3);
    expect(mockDecorate).toHaveBeenCalledWith('checkRole', expect.any(Function));
    expect(mockDecorate).toHaveBeenCalledWith('checkAdmin', expect.any(Function));
    expect(mockDecorate).toHaveBeenCalledWith('checkUser', expect.any(Function));
  });

  it('checkRole deve permitir acesso quando o usuário tem a role necessária', async () => {
    // Registra o plugin
    await fp(checkRolePlugin)(mockFastify);

    // Simula a função checkRole que seria registrada
    const checkRoleFn = mockDecorate.mock.calls.find(
      (call: any) => call[0] === 'checkRole'
    )?.[1] as (roles: string[], request: FastifyRequest, reply: FastifyReply) => Promise<void>;

    // Verifica se a função foi encontrada
    if (!checkRoleFn) {
      throw new Error('Função checkRole não foi registrada');
    }

    // Executa a função checkRole
    await checkRoleFn(['USER', 'ADMIN'], mockRequest, mockReply);

    // Verifica se jwtVerify foi chamado
    expect(mockRequest.jwtVerify).toHaveBeenCalled();
    
    // Verifica que o código de erro não foi chamado
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('checkRole deve negar acesso quando o usuário não tem a role necessária', async () => {
    // Registra o plugin
    await fp(checkRolePlugin)(mockFastify);

    // Simula a função checkRole que seria registrada
    const checkRoleFn = mockDecorate.mock.calls.find(
      (call: any) => call[0] === 'checkRole'
    )?.[1] as (roles: string[], request: FastifyRequest, reply: FastifyReply) => Promise<void>;

    // Verifica se a função foi encontrada
    if (!checkRoleFn) {
      throw new Error('Função checkRole não foi registrada');
    }

    // Configura o mock para um usuário com role diferente
    const requestWithWrongRole = {
      ...mockRequest,
      user: { ...mockRequest.user, role: 'USER' as 'USER' | 'ADMIN' },
      jwtVerify: vi.fn(),
    } as unknown as FastifyRequest;

    // Executa a função checkRole apenas para ADMIN
    await checkRoleFn(['ADMIN'], requestWithWrongRole, mockReply);

    // Verifica se jwtVerify foi chamado
    expect(requestWithWrongRole.jwtVerify).toHaveBeenCalled();
    
    // Verifica que o código de erro foi chamado
    expect(mockReply.code).toHaveBeenCalledWith(403);
    expect(mockReply.send).toHaveBeenCalledWith({
      error: 'Acesso negado. Você não tem permissão para acessar este recurso.',
    });
  });

  it('checkRole deve retornar erro 401 quando a autenticação falha', async () => {
    // Registra o plugin
    await fp(checkRolePlugin)(mockFastify);

    // Simula a função checkRole que seria registrada
    const checkRoleFn = mockDecorate.mock.calls.find(
      (call: any) => call[0] === 'checkRole'
    )?.[1] as (roles: string[], request: FastifyRequest, reply: FastifyReply) => Promise<void>;

    // Verifica se a função foi encontrada
    if (!checkRoleFn) {
      throw new Error('Função checkRole não foi registrada');
    }

    // Configura o mock para falhar na autenticação
    const requestWithAuthError = {
      ...mockRequest,
      jwtVerify: vi.fn().mockRejectedValue(new Error('Token inválido')),
    } as unknown as FastifyRequest;

    // Executa a função checkRole
    await checkRoleFn(['USER'], requestWithAuthError, mockReply);

    // Verifica se jwtVerify foi chamado
    expect(requestWithAuthError.jwtVerify).toHaveBeenCalled();
    
    // Verifica que o código de erro foi chamado
    expect(mockReply.code).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith({ error: 'Não autorizado' });
  });
});
