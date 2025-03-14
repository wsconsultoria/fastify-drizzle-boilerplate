import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FastifyReply, FastifyRequest, FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';

import { login } from '../login';
import { users } from '@/drizzle/schema';
import { db } from '@/drizzle/db';
import { hashPassword } from '../utils';

// Mock para o módulo utils
vi.mock('../utils', () => ({
  hashPassword: vi.fn().mockReturnValue('hashed_password123')
}));

// Mock para a função eq do drizzle-orm
vi.mock('drizzle-orm', () => ({
  eq: vi.fn()
}));

describe('login', () => {
  // Tipo para o corpo da requisição
  type LoginBody = {
    email: string;
    password: string;
  };

  // Tipo estendido para incluir o JWT no request
  type ExtendedRequest = FastifyRequest<{ Body: LoginBody }> & {
    log: {
      error: (error: any) => void;
    };
  };

  // Mock para o Fastify
  const mockFastify = {
    jwt: {
      sign: vi.fn().mockReturnValue('access_token'),
    },
  } as unknown as FastifyInstance;

  const mockRequest = {
    body: {
      email: 'test@example.com',
      password: 'password123',
    },
    log: {
      error: vi.fn(),
    },
  } as unknown as ExtendedRequest;

  const mockReply = {
    code: vi.fn().mockReturnThis(),
    send: vi.fn(),
    jwtSign: vi.fn().mockImplementation((payload, options) => {
      return Promise.resolve('access_token');
    }),
  } as unknown as FastifyReply;

  // Mocks para os métodos encadeados do Drizzle
  const mockSelectResult = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnValue([]),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Configuração do mock do db.select
    (db.select as any) = vi.fn().mockReturnValue(mockSelectResult);
  });

  it('deve fazer login com sucesso e retornar tokens com role', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password: 'hashed_password123',
      name: 'Test User',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Configurar o mock para retornar o usuário
    mockSelectResult.limit.mockReturnValue([mockUser]);
    
    await login(mockFastify, mockRequest, mockReply);

    expect(hashPassword).toHaveBeenCalledWith('password123');
    
    // Verifica se o token foi assinado com as informações corretas, incluindo a role
    expect(mockReply.jwtSign).toHaveBeenCalledWith(
      {
        id: 1,
        role: 'USER',
        type: 'access',
      },
      { expiresIn: '15m' }
    );
    
    expect(mockReply.jwtSign).toHaveBeenCalledWith(
      {
        id: 1,
        role: 'USER',
        type: 'refresh',
      },
      { expiresIn: '7d' }
    );
  });

  it('deve fazer login com sucesso para um usuário ADMIN', async () => {
    const mockAdminUser = {
      id: 1,
      email: 'admin@example.com',
      password: 'hashed_password123',
      name: 'Admin User',
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockAdminRequest = {
      body: {
        email: 'admin@example.com',
        password: 'password123',
      },
      log: {
        error: vi.fn(),
      },
    } as unknown as ExtendedRequest;

    // Configurar o mock para retornar o usuário admin
    mockSelectResult.limit.mockReturnValue([mockAdminUser]);
    
    await login(mockFastify, mockAdminRequest, mockReply);

    // Verifica se o token foi assinado com as informações corretas, incluindo a role ADMIN
    expect(mockReply.jwtSign).toHaveBeenCalledWith(
      {
        id: 1,
        role: 'ADMIN',
        type: 'access',
      },
      { expiresIn: '15m' }
    );
  });

  it('deve retornar erro 401 se o usuário não existir', async () => {
    // Configurar o mock para retornar array vazio (usuário não encontrado)
    mockSelectResult.limit.mockReturnValue([]);

    await login(mockFastify, mockRequest, mockReply);

    expect(mockReply.code).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith({ error: 'Invalid email or password' });
  });

  it('deve retornar erro 401 se a senha estiver incorreta', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password: 'hashed_different_password',
      name: 'Test User',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Configurar o mock para retornar o usuário
    mockSelectResult.limit.mockReturnValue([mockUser]);
    
    await login(mockFastify, mockRequest, mockReply);

    expect(mockReply.code).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith({ error: 'Invalid email or password' });
  });

  it('deve retornar erro 500 se ocorrer um erro no banco de dados', async () => {
    // Configurar o mock para lançar um erro
    (db.select as any) = vi.fn().mockImplementation(() => {
      throw new Error('Database error');
    });

    await login(mockFastify, mockRequest, mockReply);

    expect(mockRequest.log.error).toHaveBeenCalled();
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  });
});
