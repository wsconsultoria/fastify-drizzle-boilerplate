import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { refreshToken } from '../refresh-token';

describe('refreshToken', () => {
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    role: 'USER',
  };

  // Mock do servidor com jwt
  const mockServer = {
    jwt: {
      verify: vi.fn().mockResolvedValue({
        ...mockUser,
        type: 'refresh',
      }),
      sign: vi.fn().mockReturnValue('new_token'),
    }
  };

  // Mock da requisição
  const mockRequest = {
    body: {
      refreshToken: 'valid_refresh_token',
    },
    log: {
      error: vi.fn(),
    },
  } as unknown as FastifyRequest;

  // Mock da resposta
  const mockReply = {
    code: vi.fn().mockReturnThis(),
    send: vi.fn(),
    request: {
      server: mockServer
    }
  } as unknown as FastifyReply;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renovar o token com sucesso incluindo a role', async () => {
    await refreshToken(mockRequest, mockReply);

    expect(mockServer.jwt.verify).toHaveBeenCalledWith('valid_refresh_token');
    
    // Verifica se o token de acesso foi assinado com as informações corretas, incluindo a role
    expect(mockServer.jwt.sign).toHaveBeenCalledWith(
      {
        id: 1,
        email: 'test@example.com',
        role: 'USER',
        type: 'access',
      },
      expect.any(Object)
    );

    // Verifica se o refresh token foi assinado com as informações corretas
    expect(mockServer.jwt.sign).toHaveBeenCalledWith(
      {
        id: 1,
        email: 'test@example.com',
        role: 'USER',
        type: 'refresh',
      },
      expect.any(Object)
    );

    // Verifica se a resposta foi enviada com o código 200
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      accessToken: 'new_token',
      refreshToken: 'new_token',
    });
  });

  it('deve renovar o token com sucesso para um usuário ADMIN', async () => {
    const adminServer = {
      jwt: {
        verify: vi.fn().mockResolvedValue({
          id: 1,
          email: 'admin@example.com',
          role: 'ADMIN',
          type: 'refresh',
        }),
        sign: vi.fn().mockReturnValue('new_admin_token'),
      }
    };

    const adminReply = {
      ...mockReply,
      request: {
        server: adminServer
      }
    } as unknown as FastifyReply;

    await refreshToken(mockRequest, adminReply);

    // Verifica se o token de acesso foi assinado com as informações corretas, incluindo a role ADMIN
    expect(adminServer.jwt.sign).toHaveBeenCalledWith(
      {
        id: 1,
        email: 'admin@example.com',
        role: 'ADMIN',
        type: 'access',
      },
      expect.any(Object)
    );
  });

  it('deve retornar erro 401 se o token não for de refresh', async () => {
    const invalidServer = {
      jwt: {
        verify: vi.fn().mockResolvedValue({
          ...mockUser,
          type: 'access', // Tipo incorreto
        }),
        sign: vi.fn(),
      }
    };

    const invalidReply = {
      ...mockReply,
      request: {
        server: invalidServer
      }
    } as unknown as FastifyReply;

    await refreshToken(mockRequest, invalidReply);

    expect(mockReply.code).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith({ error: 'Invalid refresh token' });
  });

  it('deve retornar erro 401 se a verificação do token falhar', async () => {
    const errorServer = {
      jwt: {
        verify: vi.fn().mockRejectedValue(new Error('Token inválido')),
        sign: vi.fn(),
      }
    };

    const errorReply = {
      ...mockReply,
      request: {
        server: errorServer
      }
    } as unknown as FastifyReply;

    await refreshToken(mockRequest, errorReply);

    expect(mockReply.code).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith({ error: 'Invalid refresh token' });
  });

  it('deve retornar erro 400 para dados inválidos', async () => {
    const mockErrorRequest = {
      body: {},
      log: {
        error: vi.fn(),
      },
    } as unknown as FastifyRequest;

    await refreshToken(mockErrorRequest, mockReply);

    expect(mockErrorRequest.log.error).toHaveBeenCalled();
    expect(mockReply.code).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith(expect.objectContaining({ 
      error: expect.any(String) 
    }));
  });

  it('deve retornar erro 500 se ocorrer um erro inesperado', async () => {
    const mockErrorRequest = {
      body: null,
      log: {
        error: vi.fn(),
      },
    } as unknown as FastifyRequest;

    await refreshToken(mockErrorRequest, mockReply);

    expect(mockErrorRequest.log.error).toHaveBeenCalled();
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  });
});
