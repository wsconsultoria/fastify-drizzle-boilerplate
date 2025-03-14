import { describe, it, expect } from 'vitest';
import { registerBodySchema } from '../auth/register.schema';

describe('registerBodySchema', () => {
  it('deve validar um objeto de registro válido com role', () => {
    const validRegister = {
      email: 'usuario@exemplo.com',
      password: 'senha123',
      name: 'Nome do Usuário',
      role: 'ADMIN',
    };

    const result = registerBodySchema.parse(validRegister);
    expect(result).toEqual(validRegister);
  });

  it('deve validar um objeto de registro válido sem role (usando o default)', () => {
    const validRegister = {
      email: 'usuario@exemplo.com',
      password: 'senha123',
      name: 'Nome do Usuário',
    };

    const result = registerBodySchema.parse(validRegister);
    expect(result).toEqual({
      ...validRegister,
      role: 'USER',
    });
  });

  it('deve rejeitar um objeto de registro com email inválido', () => {
    const invalidRegister = {
      email: 'email-invalido',
      password: 'senha123',
      name: 'Nome do Usuário',
    };

    expect(() => registerBodySchema.parse(invalidRegister)).toThrow();
  });

  it('deve rejeitar um objeto de registro com senha muito curta', () => {
    const invalidRegister = {
      email: 'usuario@exemplo.com',
      password: '123',
      name: 'Nome do Usuário',
    };

    expect(() => registerBodySchema.parse(invalidRegister)).toThrow();
  });

  it('deve rejeitar um objeto de registro com nome muito curto', () => {
    const invalidRegister = {
      email: 'usuario@exemplo.com',
      password: 'senha123',
      name: 'N',
    };

    expect(() => registerBodySchema.parse(invalidRegister)).toThrow();
  });

  it('deve rejeitar um objeto de registro com role inválida', () => {
    const invalidRegister = {
      email: 'usuario@exemplo.com',
      password: 'senha123',
      name: 'Nome do Usuário',
      role: 'GUEST',
    };

    expect(() => registerBodySchema.parse(invalidRegister)).toThrow();
  });

  it('deve rejeitar um objeto de registro com propriedades extras', () => {
    const invalidRegister = {
      email: 'usuario@exemplo.com',
      password: 'senha123',
      name: 'Nome do Usuário',
      extraProp: 'valor extra',
    };

    expect(() => registerBodySchema.parse(invalidRegister)).toThrow();
  });
});
