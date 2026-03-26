# Plano de Implementacao (To Do)

Este plano descreve as implementacoes pendentes para a v1 do LeadsRoute.

## Escopo fechado da v1

- Busca por `termo + cidade`.
- `limite` opcional com default `20` (validado com Zod).
- Salvar leads mesmo sem telefone.
- Campos de lead: nome da empresa, telefone, endereco completo e componentes basicos.

## To Do geral

- [x] Modelar `Lead` no Prisma para o escopo simplificado.
- [x] Criar contratos oRPC/Zod para importacao e listagem de leads.
- [x] Integrar Google Places (New) no backend com Field Mask.
- [x] Persistir com `upsert` por `placeId`.
- [x] Adicionar resiliencia da importacao (rate limit, timeout, retry).
- [ ] Construir UI de importacao e listagem no frontend.
- [ ] Atualizar documentacao de setup e uso.
- [ ] Validar fluxo completo com `lint`, `typecheck` e `build`.

## Checklist de commits planejados

- [x] C1 `feat(database): ajusta modelo Lead para v1 de captura simples`
- [x] C2 `feat(contracts): adiciona contratos lead.importBySearch, lead.list e lead.getById`
- [x] C3 `feat(api): implementa serviço Google Places com mapeamento de endereço`
- [x] C4 `feat(api): implementa importação com upsert por placeId`
- [x] C5 `feat(api): adiciona rate limit, timeout e retry na importação`
- [ ] C6 `feat(web): cria formulário de busca e integração com importBySearch`
- [ ] C7 `feat(web): cria listagem de leads com filtro hasPhone`
- [ ] C8 `docs(readme): documenta variáveis Google e fluxo de uso`

## Detalhamento tecnico por etapa

### C1 - Banco de dados

- Criar modelo `Lead` com os campos:
  - `id` (cuid)
  - `placeId` (`@unique`)
  - `nomeEmpresa`
  - `telefone?`
  - `enderecoCompleto`
  - `numero?`
  - `rua?`
  - `bairro?`
  - `cidade`
  - `estado?`
  - `createdAt` e `updatedAt`
- Criar migracao inicial da v1 para o modelo.

### C2 - Contratos

- `lead.importBySearch`
  - input:
    - `termo: string`
    - `cidade: string`
    - `limite?: number` com default `20`
  - output:
    - `importedWithPhone`
    - `importedWithoutPhone`
    - `updated`
    - `skipped`
    - `totalProcessed`
- `lead.list`
  - input: `page`, `pageSize`, `search?`, `cidade?`, `hasPhone?`
  - output: `items`, `total`, `page`, `pageSize`
- `lead.getById`
  - input: `id`
  - output: lead completo

### C3 - Integracao Places

- Implementar cliente para Places API (New) com `fetch` server-side.
- Usar headers obrigatorios:
  - `X-Goog-Api-Key`
  - `X-Goog-FieldMask`
- Mapear campos de resposta para entidade `Lead`.

### C4 - Persistencia

- Implementar importacao real no handler `lead.importBySearch`.
- Persistir via `prisma.lead.upsert` usando `placeId`.
- Separar contadores de importacao (com e sem telefone).

### C5 - Resiliencia

- Adicionar `@fastify/rate-limit` para proteger importacao.
- Configurar timeout para chamadas externas.
- Implementar retry com backoff para erros transitivos.

### C6 - Frontend importacao

- Criar formulario com `termo`, `cidade` e `limite` opcional.
- Consumir `lead.importBySearch` e mostrar resumo da execucao.

### C7 - Frontend listagem

- Criar listagem de leads com colunas principais.
- Adicionar filtro `hasPhone`.
- Exibir estado "Sem telefone" quando aplicavel.

### C8 - Documentacao

- Atualizar `README.md` com variaveis Google e fluxo de teste.
- Garantir consistencia com `docs/fluxo-desenvolvimento.md`.

## Criterios de pronto

- [ ] Importacao por `termo + cidade` funcional.
- [ ] Duplicidade evitada por `placeId`.
- [ ] Leads sem telefone persistidos corretamente.
- [ ] Tela web com importacao e listagem operacionais.
- [ ] Documentacao atualizada com onboarding e testes.
