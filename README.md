# ChurchNet

Plataforma full-stack para gestão de igrejas e comunidades religiosas. Permite cadastro de igrejas, publicação de posts, horários de missa/confissão/reuniões, eventos, controle de membros e feed comunitário com curtidas e comentários.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 15 (App Router) + React 18 + Tailwind CSS |
| Backend | NestJS 11 + TypeScript |
| ORM | Prisma 7 |
| Banco de Dados | PostgreSQL 16 |
| Autenticação | JWT (passport-jwt) |
| Containerização | Docker + Docker Compose |
| Testes | Jest 30 (211 backend + 225 frontend) |

---

## Estrutura do Monorepo

```
.
├── backend/     # API NestJS
└── frontend/    # App Next.js
```

---

## Pré-requisitos

- [Docker](https://www.docker.com/) e Docker Compose v2 **ou**
- Node.js 20+ e PostgreSQL 16

---

## Rodar com Docker (recomendado)

### 1. Clone o repositório

```bash
git clone <URL_DO_REPO>
cd teste-tecnico-2026
```

### 2. Configure as variáveis de ambiente

**Backend:**
```bash
cp backend/.env.example backend/.env
# Edite backend/.env se necessário
```

**Frontend:**
```bash
cp frontend/.env.example frontend/.env
# Edite frontend/.env se necessário
```

### 3. Suba os containers

```bash
# Backend (API + Banco)
cd backend
docker compose up --build

# Em outro terminal — Frontend
cd frontend
docker compose up --build
```

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:4000/api/v1 |
| Swagger | http://localhost:4000/api/docs |

### 4. Popule o banco com dados iniciais (seed)

```bash
# Configure as credenciais de seed
cp backend/.env.seed.example backend/.env.seed
# Edite backend/.env.seed (usuários e senha)

# Rode o seed
cd backend
npm run prisma:seed
```

Credenciais padrão do seed:

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Administrador | admin@igreja.com | Admin@1234 |
| Membro | joao@exemplo.com | Membro@1234 |

---

## Rodar Localmente (sem Docker)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configure DATABASE_URL no .env apontando para seu PostgreSQL local

npx prisma migrate deploy
npx prisma generate
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Configure NEXT_PUBLIC_BACKEND_URL=http://localhost:4000/api/v1

npm run dev
```

---

## Testes

```bash
# Backend (211 testes)
cd backend
npm test

# Com cobertura
npm run test:cov

# Frontend (225 testes)
cd frontend
npm test

# Com cobertura
npm run test:cov
```

---

## Deploy (Railway)

O Railway é sugerido pois oferece $5 de crédito gratuito ao criar conta — suficiente para rodar os três serviços (PostgreSQL, Backend, Frontend).

### 1. Crie um projeto no [Railway](https://railway.app)

### 2. PostgreSQL

- Clique em **New Service → Database → PostgreSQL**
- Copie a `DATABASE_URL` gerada

### 3. Backend

- **New Service → GitHub Repo** → selecione o repositório
- Configure **Root Directory:** `backend`
- Configure **Start Command:** `node dist/main`
- Configure **Build Command:** `npm ci && npx prisma generate && npm run build`
- Variáveis de ambiente necessárias:

```
DATABASE_URL=<URL_DO_POSTGRESQL_RAILWAY>
JWT_SECRET=<segredo_forte_aleatorio>
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=4000
FRONTEND_URL=<URL_DO_FRONTEND_RAILWAY>
BACKEND_URL=<URL_DO_BACKEND_RAILWAY>
```

- Após o deploy, rode as migrations:
  ```
  npx prisma migrate deploy
  ```
  (via Railway CLI ou pelo painel em Settings → Deploy → Run Command)

### 4. Frontend

- **New Service → GitHub Repo** → selecione o repositório
- Configure **Root Directory:** `frontend`
- Configure **Build Command:** `npm ci && npm run build`
- Configure **Start Command:** `npm start`
- Variáveis de ambiente:

```
NEXT_PUBLIC_BACKEND_URL=<URL_DO_BACKEND_RAILWAY>/api/v1
NEXT_PUBLIC_APP_NAME=ChurchNet
```

---

## Decisões Técnicas e Arquiteturais

### Backend

**NestJS** foi escolhido pela estrutura modular nativa (controllers, services, modules), injeção de dependência embutida e suporte a decorators — reduzindo boilerplate e facilitando testes unitários isolados via mocking.

**Prisma 7 com driver adapter `PrismaPg`** — necessário nesta versão pois o Prisma migrou para o modelo de driver adapters explícitos. Permite substituição futura de driver sem alterar a camada de ORM.

**JWT + Passport** — estratégia stateless amplamente adotada para APIs REST, sem necessidade de armazenamento de sessão no servidor.

**`class-validator` + `class-transformer`** — validação declarativa via decorators nos DTOs, integrada ao `ValidationPipe` global do NestJS. Rejeita payloads inválidos antes de chegarem aos services.

**`@nestjs/serve-static`** — serve arquivos de upload diretamente pela API sem necessidade de nginx separado em desenvolvimento.

**Cobertura 100% de testes** — `coverageThreshold` configurado no Jest para branches, functions, lines e statements. 211 testes unitários cobrindo controllers e services.

### Frontend

**Next.js 15 App Router** com grupos de rotas `(auth)` e `(dashboard)` — separação clara entre páginas públicas e autenticadas com layouts independentes.

**Context API** para autenticação e toast — evita prop drilling sem a complexidade de bibliotecas de estado externas para esses casos de uso simples.

**Axios com interceptor** — centraliza autenticação (Bearer token) e timeout de 15s. Ponto único de configuração para toda comunicação com a API.

**Zod + React Hook Form** — validação no frontend espelhando as regras do backend. O Zod garante tipagem estática dos schemas de formulário.

**Tailwind CSS** com `glass-card` e gradientes customizados — design system leve sem dependência de bibliotecas de componentes externas. Componentes atômicos próprios (`Button`, `Input`, `Box`, `Typography`, etc.).

**Componente `ImageUpload`** — input de URL com preview ao vivo. Optamos por URL em vez de upload de arquivo para simplicidade de deploy (sem necessidade de storage externo como S3).

### Banco de Dados

**PostgreSQL 16** com schema modelado para extensibilidade — `daysOfWeek Int[]` (array nativo) para horários recorrentes em múltiplos dias, evitando tabela de junção desnecessária.

**Migrations versionadas** com Prisma — histórico completo de alterações do schema, reproduzível em qualquer ambiente.

---

## Dependências — Backend

| Pacote | Justificativa |
|--------|--------------|
| `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express` | Núcleo do framework NestJS |
| `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt` | Autenticação JWT stateless |
| `@nestjs/serve-static` | Servir arquivos de upload sem nginx |
| `@nestjs/swagger` | Documentação automática da API em `/api/docs` |
| `@prisma/client`, `prisma` | ORM type-safe com migrations versionadas |
| `@prisma/adapter-pg`, `pg` | Driver adapter PostgreSQL (obrigatório no Prisma 7) |
| `bcryptjs` | Hash de senhas com salt rounds configurável |
| `class-validator`, `class-transformer` | Validação declarativa de DTOs via decorators |
| `reflect-metadata`, `rxjs` | Dependências de runtime do NestJS (injeção de dependência) |
| `dotenv` | Carregamento de variáveis de ambiente no seed |

---

## Dependências — Frontend

| Pacote | Justificativa |
|--------|--------------|
| `next` | Framework React com SSR, App Router e otimizações de build |
| `react`, `react-dom` | Biblioteca de UI base |
| `axios` | HTTP client com interceptors para auth e timeout |
| `react-hook-form` | Gerenciamento de formulários performático (sem re-renders desnecessários) |
| `@hookform/resolvers` | Integração react-hook-form + Zod |
| `zod` | Validação e tipagem de schemas no frontend |
| `lucide-react` | Biblioteca de ícones SVG consistentes e tree-shakeable |
| `clsx` | Composição condicional de classes CSS |
| `tailwindcss`, `postcss`, `autoprefixer` | Estilização utility-first com purge automático |
| `@testing-library/react`, `jest`, `ts-jest` | Testes unitários de componentes e hooks |
| `identity-obj-proxy` | Mock de imports CSS nos testes Jest |

---

## Funcionalidades Implementadas

- Autenticação completa (registro, login, JWT, refresh via localStorage)
- CRUD de igrejas com CNPJ, logo, descrição, localização
- Horários recorrentes (missa, confissão, reunião) — múltiplos dias da semana
- Eventos com datas de início/fim e imagem
- Sistema de posts com aprovação por administrador
- Curtidas e comentários em posts
- Controle de membros (solicitação, aprovação, rejeição, papéis)
- Feed geral e feed por igreja
- Upload de imagem via URL com preview
- Toast notifications (sucesso, erro, aviso, info)
- Avatar de usuário e logo de igreja
- Interface responsiva (mobile e desktop)
- Swagger em `/api/docs`
- Seed de dados com credenciais configuráveis
- 436 testes automatizados (100% de cobertura)


---

## O que NÃO queremos ver

- **Dependências em excesso sem justificativa** — instale apenas o que faz sentido para o MVP. Na entrevista, você precisará explicar por que cada pacote está no projeto
- **Código gerado por IA sem entendimento** — usar IA é permitido e incentivado, mas você será questionado sobre cada trecho do código na entrevista
- **Projeto sem README** ou sem instruções de como rodar

---

## Critérios de Avaliação

| Critério | Peso | O que avaliamos |
| --- | --- | --- |
| **Arquitetura e organização** | 20% | Estrutura de pastas, separação de responsabilidades, padrões de projeto |
| **Qualidade de código** | 20% | Linting limpo, tipagem TypeScript, clean code, tratamento de erros |
| **Git workflow** | 15% | Hooks configurados, padrão de commits, histórico coerente |
| **Design e UX** | 15% | Responsividade, usabilidade, estados da interface, consistência visual |
| **Funcionalidades** | 15% | Auth + CRUD funcionando corretamente de ponta a ponta |
| **README e documentação** | 10% | Clareza, completude, justificativa de dependências |
| **Diferenciais** | 5% | Containerização, testes, CI/CD, e demais bônus listados acima |

---

## Como Entregar

1. Crie um repositório **público** no GitHub
2. Faça o deploy da aplicação (sugestão: [Railway](https://railway.app))
3. Preencha o formulário de entrega: **[DirectAds - Envio de Teste Técnico](https://forms.gle/wpyga7rZMxbxZmbR8)**
   - Email
   - LinkedIn
   - Link do repositório GitHub
   - Link da aplicação em produção (deploy)
4. Certifique-se de que:
   - O README está completo e claro
   - O deploy está funcional e acessível
   - O Swagger do backend está acessível em `/api/docs`

> Você pode entregar antes das 48 horas. O prazo é um limite, não uma meta.

---

## Entrevista Técnica (pós-entrega)

Caso seja selecionado, você será convidado para uma **entrevista técnica de ~15–30 minutos** onde irá:

- **Demonstrar** o projeto funcionando (compartilhamento de tela)
- **Explicar** a arquitetura escolhida e a organização do projeto
- **Justificar** cada dependência instalada — por que escolheu, o que ela resolve, se considerou alternativas
- **Responder** perguntas técnicas sobre decisões tomadas no código
- **Explicar** como utilizou ferramentas de IA — quais usou, em quais partes, e onde precisou intervir manualmente

> Esta etapa é tão importante quanto o código. Queremos entender seu raciocínio, não apenas o resultado final.

---

## Dúvidas

Se algo não ficou claro neste documento, entre em contato com o recrutador. Preferimos responder dúvidas antes do que avaliar entregas baseadas em suposições.

Boa sorte!

---

# ChurchNet — Documentação do Projeto

Plataforma full stack para gestão de igrejas e redes sociais religiosas, construída com **NestJS**, **Next.js 14**, **Prisma** e **PostgreSQL**.

## Tecnologias

| Camada  | Stack                                               |
| ------- | --------------------------------------------------- |
| Backend | NestJS · TypeScript · Prisma ORM · PostgreSQL · JWT |
| Frontend| Next.js 14 (App Router) · TypeScript · Tailwind CSS |
| Infra   | Docker · Docker Compose                             |

## Estrutura de Pastas

```
root
├── backend/
│   ├── src/
│   │   ├── auth/            # Módulo de autenticação (JWT)
│   │   ├── churches/        # Módulo de igrejas
│   │   ├── users/           # Módulo de usuários
│   │   ├── prisma/          # PrismaService global
│   │   └── types/           # Tipos compartilhados do backend
│   ├── prisma/
│   │   └── schema.prisma    # Modelos: User, Church, ChurchMember, Post
│   └── migrations/
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router
│   │   │   ├── (auth)/      # /login e /register
│   │   │   └── (dashboard)/ # Área autenticada
│   │   ├── components/      # Componentes atômicos customizados
│   │   │   ├── Box/         # substitui <div>
│   │   │   ├── Container/   # substitui <section> com max-width
│   │   │   ├── Typography/  # substitui <h1-h6>, <p>, <span>
│   │   │   ├── Button/      # substitui <button> com variantes
│   │   │   └── Input/       # substitui <input> com validação
│   │   ├── containers/      # Componentes de feature/página
│   │   ├── context/         # AuthContext
│   │   ├── hooks/           # useAuth, useChurches, useChurch
│   │   ├── types/           # Tipos TS: auth, church, user, api
│   │   └── utils/           # api (axios), validators (zod), formatters
│   └── tailwind.config.ts
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Princípios de Arquitetura

- **Zero `any`** — tipagem explícita em todo o código TypeScript
- **Componentes customizados** — sem HTML nativo no JSX: `Box`, `Container`, `Typography`, `Button`, `Input`
- **Mobile First** — Tailwind CSS com breakpoints progressivos
- **Separação de responsabilidades** — hooks (lógica), containers (feature), components (UI)
- **Validação dupla** — `class-validator` no backend + `zod` / `react-hook-form` no frontend

## Como rodar com Docker

```bash
# 1. Copiar variáveis de ambiente
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. Subir os containers
docker compose up --build

# 3. Executar migrations (primeira vez)
docker compose exec backend npm run prisma:migrate:dev -- --name init
```

| Serviço  | URL                          |
| -------- | ---------------------------- |
| Frontend | http://localhost:3000        |
| Backend  | http://localhost:4000/api/v1 |

## API — Endpoints principais

| Método | Rota                    | Auth        | Descrição           |
| ------ | ----------------------- | ----------- | ------------------- |
| GET    | `/api/v1/health`        | —           | Health check        |
| POST   | `/api/v1/auth/register` | —           | Cadastro            |
| POST   | `/api/v1/auth/login`    | —           | Login (JWT)         |
| GET    | `/api/v1/users/me`      | JWT         | Perfil do usuário   |
| GET    | `/api/v1/churches`      | —           | Listar igrejas      |
| POST   | `/api/v1/churches`      | JWT         | Criar igreja        |
| GET    | `/api/v1/churches/:id`  | —           | Detalhe da igreja   |
| PATCH  | `/api/v1/churches/:id`  | JWT (admin) | Editar igreja       |
| DELETE | `/api/v1/churches/:id`  | JWT (admin) | Excluir igreja      |

## Segurança

- Senhas hasheadas com **bcrypt** (salt rounds: 12)
- Autenticação via **JWT Bearer Token**
- Variáveis sensíveis isoladas em `.env` (nunca commitadas)
- `ValidationPipe` global com `whitelist: true` e `forbidNonWhitelisted: true`
- CORS configurado para origem específica do frontend
