# Fluxo de Desenvolvimento

Este documento define o fluxo oficial de desenvolvimento do projeto LeadsRoute.

## Objetivo

- Manter `main` estavel e pronta para producao.
- Integrar mudancas gradualmente em `desenvolvimento`.
- Isolar implementacoes por funcionalidade em branches curtas.

## Estrategia de branches

- `main`: branch estavel de producao.
- `desenvolvimento`: branch de integracao e homologacao.
- `feature/*`: branch para nova funcionalidade.
- `hotfix/*`: branch para correcao urgente em producao.

## Fluxo de feature

1. Atualizar base local de integracao:

```bash
git checkout desenvolvimento
git pull origin desenvolvimento
```

2. Criar branch da feature:

```bash
git checkout -b feature/nome-curto-da-feature
```

3. Desenvolver com commits pequenos e objetivos.

4. Subir branch para remoto:

```bash
git push -u origin feature/nome-curto-da-feature
```

5. Abrir PR de `feature/*` para `desenvolvimento`.

6. Apos merge, limpar branch local e remota:

```bash
git checkout desenvolvimento
git pull origin desenvolvimento
git branch -d feature/nome-curto-da-feature
git push origin --delete feature/nome-curto-da-feature
```

## Fluxo de release

1. Garantir `desenvolvimento` estavel (lint, typecheck e build).
2. Abrir PR de `desenvolvimento` para `main`.
3. Fazer merge apenas apos validacoes e revisoes.
4. Opcional: criar tag de versao em `main`.

## Fluxo de hotfix

1. Criar branch de correcao a partir de `main`:

```bash
git checkout main
git pull origin main
git checkout -b hotfix/corrige-x
```

2. Corrigir, commitar e abrir PR para `main`.

3. Apos merge em `main`, aplicar a mesma correcao em `desenvolvimento`:

- via PR de `hotfix/*` para `desenvolvimento`, ou
- via merge de `main` em `desenvolvimento`.

## Convencao de commits

Mensagens devem ser em pt-BR, objetivas e no formato:

```text
tipo(escopo): descricao
```

Tipos recomendados:

- `feat`: nova funcionalidade.
- `fix`: correcao de bug.
- `chore`: manutencao, tooling, infra.
- `docs`: documentacao.

Exemplos:

- `feat(api): adiciona endpoint de busca de leads`
- `fix(web): corrige exibicao da tabela de resultados`
- `chore(infra): ajusta configuracao do docker compose`
- `docs(readme): atualiza instrucoes de setup`

## Checklist obrigatorio antes de PR

Executar na raiz do monorepo:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

Tambem e obrigatorio:

- validar manualmente o fluxo alterado;
- descrever no PR o que foi alterado e como testar;
- manter PR pequeno e focado em um objetivo.

## Regras de merge

- Nao fazer push direto em `main`.
- Evitar commit direto em `desenvolvimento` para features (usar `feature/*`).
- Toda mudanca relevante deve passar por PR.

## Observacoes para automacao e agentes

- Agentes devem seguir este fluxo ao propor mudancas.
- Quando aplicavel, agentes devem sugerir branch de feature e PR para `desenvolvimento`.
- Alteracoes para producao devem entrar em `main` apenas via PR.
