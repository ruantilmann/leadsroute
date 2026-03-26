# LeadsRoute

O **LeadsRoute** e um projeto para **geracao de leads e organizacao de rotas** com base na **Google Places API**.

> Status: projeto em desenvolvimento ativo.  
> Novas funcionalidades e melhorias serao adicionadas em versoes futuras.

## Visao geral

A proposta do projeto e centralizar a coleta de informacoes de empresas e disponibilizar esses dados em uma aplicacao web, com uma arquitetura moderna e escalavel em monorepo.

## Tecnologias utilizadas

- **Monorepo**: pnpm workspaces + Turborepo
- **Frontend**: Next.js, React, React DOM, shadcn/ui
- **Backend**: Fastify
- **Contratos e validacao**: oRPC + Zod
- **Banco de dados**: PostgreSQL (Docker) + Prisma ORM
- **Autenticacao**: JWT (access + refresh em cookie HttpOnly)
- **Ambiente**: Node.js + pnpm

## Estrutura do repositorio

- `apps/web`: aplicacao frontend
- `apps/api`: aplicacao backend
- `packages/contracts`: contratos compartilhados (oRPC + Zod)
- `packages/database`: camada de banco de dados (Prisma)
- `docs/`: documentacao de fluxo e planejamento

## Onboarding (setup do projeto)

### 1) Pre-requisitos

- Node.js 22+
- pnpm 10+
- Docker Desktop em execucao

### 2) Clonar o repositorio

```bash
git clone <URL_DO_REPOSITORIO>
cd leadsroute
```

### 3) Instalar dependencias

```bash
pnpm install
```

### 4) Configurar variaveis de ambiente

Este projeto usa um unico arquivo de ambiente na raiz.

```bash
cp .env.example .env
```

Preencha os valores necessarios no `.env`, principalmente:

- `DATABASE_URL`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `NEXT_PUBLIC_API_URL`
- `APP_BASE_URL`
- `AUTH_ACCESS_TOKEN_SECRET`
- `AUTH_REFRESH_TOKEN_SECRET`
- `AUTH_ACCESS_TOKEN_EXPIRES_IN`
- `AUTH_REFRESH_TOKEN_EXPIRES_IN`
- `AUTH_JWT_ISSUER`
- `AUTH_JWT_AUDIENCE`
- `AUTH_EMAIL_ENABLED`
- `AUTH_EMAIL_FROM`
- `RESEND_API_KEY`
- `GOOGLE_MAPS_API_KEY`

Variaveis opcionais de ajuste (timeout/retry/rate limit) tambem estao descritas no `.env.example`.

### 5) Subir banco e preparar Prisma

```bash
pnpm db:up
pnpm db:migrate -- --name init
pnpm db:generate
```

### 6) Executar aplicacao em desenvolvimento

```bash
pnpm dev
```

Endpoints padrao:

- Web: `http://localhost:3000`
- API: `http://localhost:3333`
- RPC: `http://localhost:3333/rpc`

## Fluxo de autenticacao

- Cadastro: `http://localhost:3000/cadastro`
- Login: `http://localhost:3000/login`
- Esqueci senha: `http://localhost:3000/esqueci-senha`
- Redefinir senha: `http://localhost:3000/redefinir-senha`
- Confirmacao de email: `http://localhost:3000/verificar-email`

Regras principais:

- Sessao baseada em JWT com `access token` e `refresh token`.
- Tokens armazenados em cookies HttpOnly.
- Logout da sessao atual e logout global (todos os dispositivos).
- Rotas de leads exigem usuario autenticado.

## Scripts uteis

```bash
pnpm dev
pnpm dev:web
pnpm dev:api
pnpm db:up
pnpm db:down
pnpm db:migrate -- --name init
pnpm db:generate
pnpm db:studio
pnpm lint
pnpm typecheck
pnpm build
```

## Fluxo de desenvolvimento

Siga as regras descritas em:

- `docs/fluxo-desenvolvimento.md`
- `AGENTS.md`
