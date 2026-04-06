# ChurchNet

Plataforma full-stack para gestão de igrejas e comunidades religiosas — feed de posts, horários de cultos/missas/confissões, eventos, controle de membros e autenticação JWT.

## Stack

| Camada | Tecnologia |
| --- | --- |
| Frontend | Next.js 15 (App Router) + Tailwind CSS |
| Backend | NestJS 11 + TypeScript |
| ORM | Prisma 7 |
| Banco | PostgreSQL 16 |
| Auth | JWT (passport-jwt) |

## Estrutura

```
.
├── backend/    # API NestJS — README com detalhes técnicos
└── frontend/   # App Next.js — README com detalhes técnicos
```

## Como rodar

### Com Docker (recomendado)

```bash
# Backend (API + banco)
cd backend && docker compose up --build

# Frontend (em outro terminal)
cd frontend && docker compose up --build
```

| Serviço | URL |
| --- | --- |
| Frontend | http://localhost:3000 |
| API | http://localhost:4000/api/v1 |
| Swagger | http://localhost:4000/api/docs |

### Localmente

```bash
# Backend
cd backend
cp .env.example .env
npm install && npx prisma migrate deploy && npm run start:dev

# Frontend
cd frontend
cp .env.example .env
npm install && npm run dev
```

## Seed

Popula o banco com usuários e uma igreja de exemplo:

```bash
cd backend
cp .env.seed.example .env.seed   # configure as credenciais
npm run prisma:seed
```

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Admin | admin@igreja.com | Admin@1234 |
| Membro | joao@exemplo.com | Membro@1234 |

## Testes

```bash
cd backend  && npm test   # 211 testes
cd frontend && npm test   # 225 testes
```

Cobertura de 100% (statements, branches, functions, lines) em ambos os projetos.

## Documentação

- Decisões técnicas, dependências e arquitetura: [`backend/README.md`](backend/README.md) e [`frontend/README.md`](frontend/README.md)
- Swagger: `http://localhost:4000/api/docs`
