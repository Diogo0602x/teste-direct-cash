# ChurchNet — Backend

API REST para gestão de igrejas e redes sociais religiosas, construída com **NestJS**, **Prisma** e **PostgreSQL**.

## Tecnologias

| Item | Tecnologia |
|------|-----------|
| Framework | NestJS 11 |
| Linguagem | TypeScript 5.9 |
| ORM | Prisma 7 |
| Banco de Dados | PostgreSQL 16 |
| Autenticação | JWT (passport-jwt) |
| Validação | class-validator + class-transformer |
| Testes | Jest 30 + @nestjs/testing |

## Pré-requisitos

- Node.js 20+
- PostgreSQL 16 (ou Docker)

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL=postgresql://churchuser:churchpass@localhost:5432/churchdb?schema=public
JWT_SECRET=change-this-secret-in-production
JWT_EXPIRES_IN=7d
PORT=4000
```

## Como Rodar

### Com Docker (recomendado)

Sobe o banco e a API em containers:

```bash
docker compose up
```

A API ficará disponível em `http://localhost:4000/api/v1`.

### Localmente

```bash
# Instalar dependências
npm install

# Gerar o Prisma Client
npm run prisma:generate

# Rodar as migrations
npm run prisma:migrate:dev

# Iniciar em modo desenvolvimento (hot reload)
npm run start:dev
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run start:dev` | Inicia com hot reload |
| `npm run build` | Compila para produção |
| `npm run start:prod` | Inicia o build de produção |
| `npm run test` | Roda os testes unitários |
| `npm run test:cov` | Testes com relatório de cobertura |
| `npm run lint` | Lint + auto-fix |
| `npm run prisma:migrate:dev` | Cria e aplica migrations |
| `npm run prisma:studio` | Abre o Prisma Studio (GUI) |

## Endpoints Principais

**Base URL:** `http://localhost:4000/api/v1`

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/health` | Health check | — |
| POST | `/auth/register` | Registro de usuário | — |
| POST | `/auth/login` | Login | — |
| GET | `/users/me` | Perfil do usuário logado | ✓ |
| PATCH | `/users/me` | Atualizar perfil | ✓ |
| DELETE | `/users/me` | Deletar conta | ✓ |
| GET | `/churches` | Listar igrejas | — |
| POST | `/churches` | Criar igreja | ✓ |
| GET | `/churches/:id` | Detalhes de uma igreja | — |
| PATCH | `/churches/:id` | Atualizar igreja | ✓ Admin |
| DELETE | `/churches/:id` | Deletar igreja | ✓ Admin |
| POST | `/churches/:id/join` | Solicitar entrada | ✓ |
| GET | `/churches/:id/members` | Listar membros | ✓ |
| GET | `/posts` | Listar posts aprovados | — |
| POST | `/posts` | Criar post | ✓ |
| PATCH | `/posts/:id/approve` | Aprovar post | ✓ Admin |
| POST | `/posts/:id/like` | Curtir post | ✓ |
| POST | `/posts/:id/comments` | Comentar | ✓ |

## Decisões Técnicas

**NestJS** — framework escolhido pela injeção de dependência nativa, decorators para rotas/guards/pipes e estrutura modular que escala bem. Alternativa seria Express puro, mas exigiria mais boilerplate.

**Prisma** — ORM com type-safety gerado a partir do schema, migrations versionadas e excelente DX. Alternativa seria TypeORM (mais verboso) ou Drizzle (mais novo, menos maduro).

**passport-jwt** — estratégia JWT com guard flexível; o `OptionalJwtAuthGuard` permite rotas semi-públicas sem duplicar lógica.

**class-validator** — validação declarativa via decorators nos DTOs, integrado nativamente com o `ValidationPipe` do NestJS.

**bcryptjs** — versão JS pura do bcrypt, sem dependência nativa (compilação mais simples no Docker Alpine).

**@prisma/adapter-pg** — adapter que usa o driver `pg` nativo em vez do driver padrão do Prisma, com melhor performance em conexões persistentes.

## Arquitetura

```
src/
├── app.module.ts          # Módulo raiz
├── main.ts                # Bootstrap da aplicação
├── auth/                  # Autenticação JWT
│   ├── strategies/        # JwtStrategy (passport)
│   ├── guards/            # JwtAuthGuard, OptionalJwtAuthGuard
│   └── dto/               # LoginDto, RegisterDto
├── users/                 # CRUD de usuários
├── churches/              # CRUD de igrejas + membros
├── posts/                 # Posts, likes, comentários
├── prisma/                # PrismaService (wrapper do PrismaClient)
└── types/                 # Tipos compartilhados (JwtPayload, etc.)
```

## Cobertura de Testes

100% de cobertura em statements, branches, functions e lines em todos os módulos.

```
npm run test:cov
```

## Dependências — Justificativas

### Produção

| Pacote | Motivo |
|--------|--------|
| `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express` | Núcleo do NestJS |
| `@nestjs/jwt` | Geração e validação de tokens JWT |
| `@nestjs/passport` | Integração do NestJS com estratégias Passport |
| `@nestjs/mapped-types` | Utilitários como `PartialType` para DTOs |
| `@prisma/client` | Client gerado do Prisma ORM |
| `@prisma/adapter-pg` | Adapter de conexão com PostgreSQL via driver `pg` |
| `pg` | Driver nativo do PostgreSQL para Node.js |
| `bcryptjs` | Hash de senhas sem dependência nativa |
| `class-validator` | Validação declarativa de DTOs |
| `class-transformer` | Serialização/deserialização de objetos nos DTOs |
| `passport` e `passport-jwt` | Estratégia de autenticação JWT |
| `reflect-metadata` | Polyfill para decorators (obrigatório no NestJS) |
| `rxjs` | Observables (usado internamente pelo NestJS) |

### Desenvolvimento

| Pacote | Motivo |
|--------|--------|
| `prisma` | CLI para migrations e geração do client |
| `@nestjs/cli`, `@nestjs/schematics` | Tooling de desenvolvimento do NestJS |
| `@nestjs/testing` | Utilities para testes de módulos NestJS |
| `jest` e `ts-jest` | Test runner com suporte a TypeScript |
| `@types/jest` | Tipos TypeScript para Jest |
| `eslint` + `eslint-plugin-prettier` | Linting e formatação integrados |
| `prettier` | Formatação de código |
| `typescript` | Compilador TypeScript |
