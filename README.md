# LeadsRoute Monorepo

Monorepo com frontend em Next.js e backend em Fastify.

## Estrutura

- `apps/web`: frontend Next.js + shadcn/ui.
- `apps/api`: backend Fastify com rota inicial `/hello`.
- `packages/*`: reservado para pacotes compartilhados.

## Requisitos

- Node.js 22+
- pnpm 10+

## Instalação

```bash
pnpm install
```

## Executar em desenvolvimento

```bash
pnpm dev
```

Apps em execução:

- Web: `http://localhost:3000`
- API: `http://localhost:3333/hello`

## Scripts úteis

```bash
pnpm dev:web
pnpm dev:api
pnpm lint
pnpm typecheck
pnpm build
```

## Variáveis de ambiente (web)

Copie `apps/web/.env.example` para `apps/web/.env.local` se quiser alterar a URL da API.
