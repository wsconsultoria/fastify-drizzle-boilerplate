# Fastify + Drizzle Boilerplate

Um boilerplate moderno para desenvolvimento de APIs RESTful com autenticação JWT, refresh tokens e uma arquitetura escalável.

## 🚀 Tecnologias Utilizadas

- **[Fastify](https://www.fastify.io/)**: Framework web de alta performance para Node.js
- **[TypeScript](https://www.typescriptlang.org/)**: Superset tipado de JavaScript
- **[Drizzle ORM](https://orm.drizzle.team/)**: ORM TypeScript-first para bancos de dados SQL
- **[PostgreSQL](https://www.postgresql.org/)**: Sistema de gerenciamento de banco de dados relacional
- **[JWT](https://jwt.io/)**: JSON Web Tokens para autenticação
- **[Zod](https://zod.dev/)**: Biblioteca de validação de esquemas TypeScript-first
- **[Docker](https://www.docker.com/)**: Containerização para desenvolvimento e implantação
- **[ESLint](https://eslint.org/)**: Linting para manter a qualidade do código
- **[Swagger/OpenAPI](https://swagger.io/)**: Documentação automática de API

## 🏗️ Estrutura do Projeto

```
src/
├── drizzle/           # Configurações do Drizzle ORM
│   ├── db.ts          # Conexão com o banco de dados
│   ├── schema.ts      # Definição do schema do banco de dados
│   └── migrations/    # Migrações do banco de dados
├── functions/         # Funções de negócio
│   ├── auth/          # Funções de autenticação
│   └── ...            # Outras funções de domínio
├── plugins/           # Plugins do Fastify
│   └── authenticate.ts # Plugin de autenticação
├── routes/            # Rotas da API
│   ├── auth.routes.ts # Rotas de autenticação
│   ├── user.routes.ts # Rotas de usuário
│   └── index.ts       # Registro de todas as rotas
├── validators/        # Schemas de validação com Zod
│   ├── users.ts       # Validadores de usuário
│   └── ...            # Outros validadores
└── app.ts             # Configuração principal do Fastify
```

## 🚦 Começando

### Pré-requisitos

- Node.js (v18+)
- Docker e Docker Compose
- pnpm, npm ou yarn

### Instalação

1. Clone o repositório:
   ```bash
   git clone <url-do-repositorio>
   cd fastify-drizzle-boilerplate
   ```

2. Instale as dependências:
   ```bash
   pnpm install
   ```

3. Inicie o banco de dados PostgreSQL com Docker:
   ```bash
   docker-compose up -d
   ```

4. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```

5. Execute as migrações do banco de dados:
   ```bash
   pnpm drizzle:migrate
   ```

6. Inicie o servidor de desenvolvimento:
   ```bash
   pnpm dev
   ```

7. Acesse a documentação da API em:
   ```
   http://localhost:3000/documentation
   ```

## 🧩 Procedimento para Novas Features/Módulos

Para adicionar uma nova feature ou módulo ao projeto, siga estas etapas:

### 1. Defina o Schema no Banco de Dados

Adicione a definição da tabela em `src/drizzle/schema.ts`:

```typescript
export const novaEntidade = pgTable('nova_entidade', {
  id: serial('id').primaryKey(),
  nome: text('nome').notNull(),
  descricao: text('descricao'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### 2. Crie os Validadores

Adicione os schemas de validação em `src/validators/`:

```typescript
// src/validators/nova-entidade.ts
import { z } from 'zod';

export const novaEntidadeSchema = z.object({
  id: z.number(),
  nome: z.string().min(3),
  descricao: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createNovaEntidadeSchema = novaEntidadeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateNovaEntidadeSchema = createNovaEntidadeSchema.partial();

export type NovaEntidade = z.infer<typeof novaEntidadeSchema>;
export type CreateNovaEntidade = z.infer<typeof createNovaEntidadeSchema>;
export type UpdateNovaEntidade = z.infer<typeof updateNovaEntidadeSchema>;
```

### 3. Implemente as Funções de Negócio

Crie as funções em `src/functions/`:

```typescript
// src/functions/nova-entidade/index.ts
export { create } from './create';
export { getAll } from './get-all';
export { getById } from './get-by-id';
export { update } from './update';
export { remove } from './remove';
```

```typescript
// src/functions/nova-entidade/create.ts
import { FastifyReply, FastifyRequest } from 'fastify';

import { db } from '@/drizzle/db';
import { novaEntidade } from '@/drizzle/schema';
import { CreateNovaEntidade, NovaEntidade } from '@/validators';

export async function create(
  request: FastifyRequest<{ Body: CreateNovaEntidade }>,
  reply: FastifyReply,
): Promise<NovaEntidade> {
  const { nome, descricao } = request.body;

  try {
    const [created] = await db
      .insert(novaEntidade)
      .values({
        nome,
        descricao,
      })
      .returning();

    return reply.code(201).send(created);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal Server Error' });
  }
}
```

### 4. Crie as Rotas

Adicione as rotas em `src/routes/`:

```typescript
// src/routes/nova-entidade.routes.ts
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

import { create, getAll, getById, update, remove } from '@/functions/nova-entidade';
import {
  novaEntidadeSchema,
  createNovaEntidadeSchema,
  updateNovaEntidadeSchema,
} from '@/validators';

import { z } from 'zod';

export async function novaEntidadeRoutes(fastify: FastifyInstance): Promise<void> {
  const app = fastify;

  // Todas as rotas requerem autenticação
  app.addHook('onRequest', app.authenticate);

  // Criar nova entidade
  app.withTypeProvider<ZodTypeProvider>().post<{
    Body: z.infer<typeof createNovaEntidadeSchema>;
    Reply: z.infer<typeof novaEntidadeSchema>;
  }>('/', {
    schema: {
      body: createNovaEntidadeSchema,
      response: {
        201: novaEntidadeSchema,
      },
    },
  }, create);

  // Obter todas as entidades
  app.withTypeProvider<ZodTypeProvider>().get<{
    Reply: z.infer<typeof novaEntidadeSchema>[];
  }>('/', {
    schema: {
      response: {
        200: z.array(novaEntidadeSchema),
      },
    },
  }, getAll);

  // Implementar outras rotas (getById, update, delete)...
}
```

### 5. Registre as Novas Rotas

Adicione as novas rotas em `src/routes/index.ts`:

```typescript
import { FastifyInstance } from 'fastify';

import { authRoutes } from './auth.routes';
import { userRoutes } from './user.routes';
import { novaEntidadeRoutes } from './nova-entidade.routes';

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  app.register(authRoutes, { prefix: '/api/auth' });
  app.register(userRoutes, { prefix: '/api/users' });
  app.register(novaEntidadeRoutes, { prefix: '/api/nova-entidade' });
}
```

### 6. Execute as Migrações

Gere e execute as migrações para atualizar o banco de dados:

```bash
pnpm drizzle:generate
pnpm drizzle:migrate
```

## 🛣️ Melhores Práticas para Prosseguir com o Projeto

### Arquitetura e Organização

1. **Mantenha a Separação de Responsabilidades**:
   - `validators`: Apenas validação e tipagem
   - `functions`: Lógica de negócio
   - `routes`: Definição de endpoints e conexão com as funções
   - `drizzle`: Interação com o banco de dados

2. **Utilize Feature Folders**:
   - Agrupe código relacionado por domínio/feature
   - Facilita encontrar e manter código relacionado

### Desenvolvimento

1. **Testes**:
   - Implemente testes unitários para funções de negócio
   - Adicione testes de integração para endpoints
   - Use ferramentas como Jest, Vitest ou Node Test Runner

2. **Documentação**:
   - Mantenha os schemas Zod atualizados para documentação automática
   - Adicione JSDoc para funções importantes
   - Atualize este README conforme o projeto evolui

3. **Controle de Versão**:
   - Use Conventional Commits para mensagens de commit padronizadas
   - Implemente versionamento semântico para a API

### Segurança

1. **Proteção de Rotas**:
   - Todas as rotas sensíveis devem usar o middleware de autenticação
   - Implemente autorização baseada em papéis (RBAC) para controle de acesso

2. **Segredos e Configurações**:
   - Nunca comite segredos no repositório
   - Use variáveis de ambiente para configurações sensíveis
   - Considere usar um gerenciador de segredos em produção

### Escalabilidade

1. **Monitoramento e Logging**:
   - Implemente logging estruturado
   - Adicione métricas para monitorar performance

2. **Cache**:
   - Implemente estratégias de cache para endpoints frequentemente acessados
   - Considere Redis para cache distribuído

3. **Otimização de Banco de Dados**:
   - Use índices apropriados
   - Otimize consultas complexas
   - Considere estratégias de paginação para grandes conjuntos de dados

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---

Desenvolvido com ❤️ usando Fastify e Drizzle ORM.
