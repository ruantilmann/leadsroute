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
