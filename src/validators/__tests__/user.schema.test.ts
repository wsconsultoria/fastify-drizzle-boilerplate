import { describe, it, expect } from 'vitest';
import { UserRoleEnum, userSchema } from '../users/user.schema';

describe('UserRoleEnum', () => {
  it('deve aceitar valores válidos', () => {
    expect(UserRoleEnum.parse('ADMIN')).toBe('ADMIN');
    expect(UserRoleEnum.parse('USER')).toBe('USER');
  });

  it('deve rejeitar valores inválidos', () => {
    expect(() => UserRoleEnum.parse('GUEST')).toThrow();
    expect(() => UserRoleEnum.parse('')).toThrow();
    expect(() => UserRoleEnum.parse(123)).toThrow();
  });
});

describe('userSchema', () => {
  it('deve validar um objeto de usuário válido com role', () => {
    const validUser = {
      id: 1,
      email: 'usuario@exemplo.com',
      name: 'Nome do Usuário',
      role: 'ADMIN',
    };

    const result = userSchema.parse(validUser);
    expect(result).toEqual(validUser);
  });

  it('deve rejeitar um objeto de usuário sem role', () => {
    const invalidUser = {
      id: 1,
      email: 'usuario@exemplo.com',
      name: 'Nome do Usuário',
    };

    expect(() => userSchema.parse(invalidUser)).toThrow();
  });

  it('deve rejeitar um objeto de usuário com role inválida', () => {
    const invalidUser = {
      id: 1,
      email: 'usuario@exemplo.com',
      name: 'Nome do Usuário',
      role: 'GUEST',
    };

    expect(() => userSchema.parse(invalidUser)).toThrow();
  });

  it('deve rejeitar um objeto de usuário com email inválido', () => {
    const invalidUser = {
      id: 1,
      email: 'email-invalido',
      name: 'Nome do Usuário',
      role: 'USER',
    };

    expect(() => userSchema.parse(invalidUser)).toThrow();
  });

  it('deve rejeitar um objeto de usuário com propriedades extras', () => {
    const invalidUser = {
      id: 1,
      email: 'usuario@exemplo.com',
      name: 'Nome do Usuário',
      role: 'USER',
      extraProp: 'valor extra',
    };

    expect(() => userSchema.parse(invalidUser)).toThrow();
  });
});
