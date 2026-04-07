# Fé Viva — Frontend

Interface web da plataforma **Fé Viva**, construída com **Next.js 15**, **React 18** e **Tailwind CSS**.

## Tecnologias

| Item | Tecnologia |
|------|-----------|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript 5.9 |
| Estilização | Tailwind CSS 3 |
| HTTP Client | Axios |
| Formulários | React Hook Form + Zod |
| Testes | Jest 30 + Testing Library |

## Pré-requisitos

- Node.js 20+
- Backend da aplicação rodando (ver a pasta [`backend`](../backend))

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000/api/v1
```

## Como Rodar

### Com Docker

```bash
docker compose up
```

A aplicação ficará disponível em `http://localhost:3000`.

> O backend deve estar rodando e acessível na URL configurada em `NEXT_PUBLIC_BACKEND_URL`.

### Localmente

```bash
# Instalar dependências
npm install

# Iniciar em modo desenvolvimento
npm run dev
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia com hot reload |
| `npm run build` | Compila para produção |
| `npm run start` | Inicia o build de produção |
| `npm run lint` | Lint via ESLint |
| `npm run type-check` | Verificação de tipos TypeScript |
| `npm run test` | Roda os testes unitários |
| `npm run test:cov` | Testes com relatório de cobertura |

## Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Layout raiz
│   ├── (auth)/             # Grupo de rotas públicas
│   │   ├── login/          # Página de login
│   │   └── register/       # Página de registro
│   └── (dashboard)/        # Grupo de rotas autenticadas
│       ├── feed/           # Feed de posts
│       ├── churches/       # Listagem e detalhes de igrejas
│       └── profile/        # Perfil do usuário
├── components/             # Componentes atômicos reutilizáveis
│   ├── Box/                # Wrapper polimórfico (div, section, etc.)
│   ├── Button/             # Botão com variants, sizes e loading
│   ├── Container/          # Wrapper com max-width configurável
│   ├── Input/              # Campo de input com label, erro e helper
│   └── Typography/         # Componente tipográfico (h1-h6, p, span)
├── containers/             # Componentes de página (lógica + layout)
│   ├── AuthForms/          # Formulários de login e registro
│   ├── Churches/           # UI de igrejas
│   ├── Feed/               # UI do feed
│   └── UserDashboard/      # UI do dashboard
├── context/
│   └── AuthContext.tsx     # Contexto de autenticação global
├── hooks/                  # Custom hooks
│   ├── useAuth.ts          # Ações de auth (login, register, logout)
│   ├── useChurch.ts        # CRUD de igrejas
│   ├── usePosts.ts         # Posts, likes, comentários
│   └── useMembers.ts       # Gestão de membros
├── utils/
│   ├── api.ts              # Instância axios + interceptors JWT
│   ├── validators.ts       # Schemas Zod (login, register, church)
│   └── formatters.ts       # Formatação de datas, CEP, texto
└── types/                  # Tipos TypeScript compartilhados
```

## Decisões Técnicas

**Next.js App Router** — roteamento baseado em pastas com suporte a Server Components, layouts aninhados e grupos de rotas `(auth)` e `(dashboard)` para separar áreas pública e autenticada sem refletir no URL.

**Tailwind CSS** — utilitários inline eliminam a necessidade de CSS separado e facilitam manutenção. Alternativas como Styled Components ou CSS Modules foram descartadas pela verbosidade adicional.

**Axios com interceptors** — os interceptors de request e response centralizam o attach do token JWT e o redirect automático em caso de 401, evitando repetição em cada chamada.

**React Hook Form + Zod** — formulários com validação declarativa e tipada. O Zod valida tanto no frontend quanto pode ser reaproveitado no backend. Alternativa seria Formik, mais verboso.

**Componentes atômicos próprios** (Box, Button, Container, Typography, Input) — em vez de uma biblioteca de UI como MUI ou shadcn/ui, optou-se por componentes simples e totalmente controlados, sem dependências de design system de terceiros. Facilita customização e manutenção.

## Cobertura de Testes

100% de cobertura em statements, branches, functions e lines em todos os módulos cobertos.

```
npm run test:cov
```

Cobertura inclui: `utils/`, `hooks/`, `context/AuthContext.tsx`, `components/`.

## Dependências — Justificativas

### Produção

| Pacote | Motivo |
|--------|--------|
| `next` | Framework React com App Router, SSR e otimizações de produção |
| `react` e `react-dom` | Biblioteca de UI |
| `axios` | HTTP client com suporte a interceptors para attach de token JWT e redirect em 401 |
| `react-hook-form` | Gerenciamento de formulários performático (sem re-renders desnecessários) |
| `@hookform/resolvers` | Integração do React Hook Form com schemas de validação (Zod) |
| `zod` | Validação de schemas com inferência de tipos TypeScript |
| `clsx` | Concatenação condicional de classes CSS (Tailwind) |

### Desenvolvimento

| Pacote | Motivo |
|--------|--------|
| `typescript` | Linguagem principal |
| `tailwindcss`, `postcss`, `autoprefixer` | Processamento do Tailwind CSS |
| `eslint` e `eslint-config-next` | Linting com regras específicas do Next.js |
| `jest` e `jest-environment-jsdom` | Test runner com ambiente de browser simulado |
| `ts-jest` | Suporte a TypeScript no Jest |
| `@testing-library/react` | Utilitários para testar componentes React |
| `@testing-library/jest-dom` | Matchers customizados (toBeInTheDocument, etc.) |
| `@testing-library/user-event` | Simulação de eventos de usuário nos testes |
| `identity-obj-proxy` | Mock de imports CSS no Jest |
| `@types/*` | Tipos TypeScript para dependências sem tipos nativos |
