# LeadsRoute Monorepo

Monorepo com frontend em Next.js, backend em Fastify, contratos com oRPC + Zod e persistência com Prisma + PostgreSQL.

## Estrutura

- `apps/web`: frontend Next.js + shadcn/ui.
- `apps/api`: backend Fastify + oRPC.
- `packages/contracts`: contratos compartilhados (oRPC + Zod).
- `packages/database`: Prisma ORM e acesso ao Postgres.

## Fluxo de desenvolvimento

- Consulte `docs/fluxo-desenvolvimento.md` para regras de branches, PRs e releases.

## Requisitos

- Node.js 22+
- pnpm 10+
- Docker Desktop em execução

## Instalação

```bash
pnpm install
```

## Configuração de ambiente

Este projeto usa um único arquivo de ambiente na raiz.

```bash
cp .env.example .env
```

Variáveis principais:

- `DATABASE_URL`: conexão do Prisma com o Postgres.
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`: credenciais do container.
- `NEXT_PUBLIC_API_URL`: URL pública da API para o frontend.

## Banco de dados (Docker + Prisma)

```bash
pnpm db:up
pnpm db:migrate -- --name init
pnpm db:generate
```

Se quiser abrir o Prisma Studio:

```bash
pnpm db:studio
```

Para derrubar o banco local:

```bash
pnpm db:down
```

## Executar em desenvolvimento

```bash
pnpm dev
```

Apps em execução:

- Web: `http://localhost:3000`
- API HTTP: `http://localhost:3333/hello`
- API RPC: `http://localhost:3333/rpc`

## Scripts úteis

```bash
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
