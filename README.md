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
- `GOOGLE_MAPS_API_KEY`: chave da Places API (obrigatória para importação de leads).
- `GOOGLE_PLACES_BASE_URL`: endpoint base da Places API (new).
- `GOOGLE_PLACES_TIMEOUT_MS`: timeout por chamada externa.
- `GOOGLE_PLACES_MAX_RETRIES`: tentativas extras para erros transitórios.
- `GOOGLE_PLACES_LANGUAGE` e `GOOGLE_PLACES_REGION`: idioma/região da busca.
- `API_*RATE_LIMIT*` e `API_HANDLER_TIMEOUT_MS`: proteção e timeout do backend.

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

## Fluxo da v1 (importação de leads)

1. Abra a Web em `http://localhost:3000`.
2. Informe `termo` e `cidade` (e opcionalmente `limite`).
3. Clique em **Importar leads**.
4. Confira o resumo da importação:
   - importados com telefone
   - importados sem telefone
   - atualizados
   - ignorados
5. Veja a tabela de leads e use o filtro de telefone.

## Como testar

### 1) Preparar ambiente

```bash
pnpm install
cp .env.example .env
```

Preencha `GOOGLE_MAPS_API_KEY` no `.env`.

### 2) Subir banco e aplicar schema

```bash
pnpm db:up
pnpm db:migrate -- --name init
pnpm db:generate
```

### 3) Subir aplicação

```bash
pnpm dev
```

### 4) Validações de qualidade

```bash
pnpm lint
pnpm typecheck
pnpm build
```

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
