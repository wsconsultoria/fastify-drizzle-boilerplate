import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { eq } from 'drizzle-orm';

import { register } from '../register';
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

describe('register', () => {
  // Tipo para o corpo da requisição
  type RegisterBody = {
    email: string;
    password: string;
    name: string;
    role: 'USER' | 'ADMIN' | undefined;
  };

  const mockRequest = {
    body: {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'USER' as const,
    },
    log: {
      error: vi.fn(),
    },
  } as unknown as FastifyRequest<{ Body: RegisterBody }>;

  const mockReply = {
    code: vi.fn().mockReturnThis(),
    send: vi.fn(),
  } as unknown as FastifyReply;

  // Mocks para os métodos encadeados do Drizzle
  const mockSelectResult = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnValue([]),
  };

  const mockInsertResult = {
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnValue([]),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Configuração dos mocks do db
    (db.select as any) = vi.fn().mockReturnValue(mockSelectResult);
    (db.insert as any) = vi.fn().mockReturnValue(mockInsertResult);
  });

  it('deve registrar um novo usuário com sucesso', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER',
    };

    const mockNewUser = {
      id: 1,
      email: 'test@example.com',
      password: 'hashed_password123',
      name: 'Test User',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Configurar o mock para verificar se o usuário já existe
    mockSelectResult.limit.mockReturnValue([]);
    
    // Configurar o mock para inserir o usuário
    mockInsertResult.returning.mockReturnValue([mockNewUser]);

    await register(mockRequest, mockReply);

    expect(hashPassword).toHaveBeenCalledWith('password123');
    expect(mockReply.code).toHaveBeenCalledWith(201);
    expect(mockReply.send).toHaveBeenCalledWith(mockUser);
  });

  it('deve registrar um novo usuário com role ADMIN', async () => {
    const mockRequestWithAdmin = {
      body: {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'ADMIN' as const,
      },
      log: {
        error: vi.fn(),
      },
    } as unknown as FastifyRequest<{ Body: RegisterBody }>;

    const mockNewAdminUser = {
      id: 1,
      email: 'test@example.com',
      password: 'hashed_password123',
      name: 'Test User',
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Configurar o mock para verificar se o usuário já existe
    mockSelectResult.limit.mockReturnValue([]);
    
    // Configurar o mock para inserir o usuário
    mockInsertResult.returning.mockReturnValue([mockNewAdminUser]);

    await register(mockRequestWithAdmin, mockReply);

    expect(mockReply.send).toHaveBeenCalledWith({
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      role: 'ADMIN',
    });
  });

  it('deve retornar erro 409 se o usuário já existir', async () => {
    const existingUser = {
      id: 1,
      email: 'test@example.com',
      password: 'hashed_password',
      name: 'Existing User',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Configurar o mock para verificar se o usuário já existe
    mockSelectResult.limit.mockReturnValue([existingUser]);

    await register(mockRequest, mockReply);

    expect(mockReply.code).toHaveBeenCalledWith(409);
    expect(mockReply.send).toHaveBeenCalledWith({ error: 'User with this email already exists' });
  });

  it('deve retornar erro 500 se ocorrer um erro no banco de dados', async () => {
    // Configurar o mock para lançar um erro
    (db.select as any) = vi.fn().mockImplementation(() => {
      throw new Error('Database error');
    });

    await register(mockRequest, mockReply);

    expect(mockRequest.log.error).toHaveBeenCalled();
    expect(mockReply.code).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  });
});
