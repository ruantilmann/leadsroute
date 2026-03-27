# Estrategia de listas de leads por usuario

## Objetivo

Separar buscas em listas. Cada usuario pode ter multiplas listas, e cada lista contem seus leads.

## Decisoes

- Um usuario possui varias listas (`LeadList`).
- Um lead pode aparecer em varias listas do mesmo usuario.
- Leads devem ser isolados por usuario.
- Remover lead da lista deve apenas desvincular da lista.

## Modelagem sugerida

- `User` 1:N `LeadList`
- `User` 1:N `Lead`
- `LeadList` N:N `Lead` via `LeadListItem`

### Tabelas

- `LeadList`
  - `id`, `userId`, `nome`, `descricao?`
  - `termoBusca?`, `cidadeBusca?`, `limiteBusca?`
  - `createdAt`, `updatedAt`
- `Lead`
  - manter dados da empresa normalizados
  - adicionar `userId`
  - `@@unique([userId, placeId])`
- `LeadListItem`
  - `id`, `listId`, `leadId`, `createdAt`
  - `@@unique([listId, leadId])`

## Regras de negocio

- Importacao de busca sempre vinculada a uma lista.
- `upsert` de lead por `userId + placeId`.
- Ao importar, criar vinculo em `LeadListItem` sem duplicar.
- APIs retornam apenas dados do usuario autenticado.
- Acesso a lista de outro usuario deve retornar `NOT_FOUND`.

## APIs previstas

- `leadList.create`
- `leadList.list`
- `leadList.getById`
- `leadList.update`
- `leadList.delete`
- `leadList.importBySearch`
- `leadList.listLeads`
- `leadList.removeLead`

## Migracao proposta

1. Criar `LeadList` e `LeadListItem`.
2. Adicionar `Lead.userId` com backfill para dados existentes.
3. Ajustar indices e unicidade para `userId + placeId`.
4. Tornar `Lead.userId` obrigatorio.
5. Migrar frontend para visao por listas.
