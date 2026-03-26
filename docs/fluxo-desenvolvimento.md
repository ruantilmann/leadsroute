# Fluxo de Desenvolvimento

Este documento define o fluxo oficial de desenvolvimento do projeto LeadsRoute.

## Objetivo

- Manter `main` estável e pronta para produção.
- Integrar mudanças gradualmente em `desenvolvimento`.
- Isolar implementações por funcionalidade em branches curtas.

## Estratégia de branches

- `main`: branch estável de produção.
- `desenvolvimento`: branch de integração e homologação.
- `feature/*`: branch para nova funcionalidade.
- `hotfix/*`: branch para correção urgente em produção.

## Fluxo de feature

1. Atualizar base local de integração:

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

6. Após merge, limpar branch local e remota:

```bash
git checkout desenvolvimento
git pull origin desenvolvimento
git branch -d feature/nome-curto-da-feature
git push origin --delete feature/nome-curto-da-feature
```

## Fluxo de release

1. Garantir `desenvolvimento` estável (lint, typecheck e build).
2. Abrir PR de `desenvolvimento` para `main`.
3. Fazer merge apenas após validações e revisões.
4. Opcional: criar tag de versão em `main`.

## Fluxo de hotfix

1. Criar branch de correção a partir de `main`:

```bash
git checkout main
git pull origin main
git checkout -b hotfix/corrige-x
```

2. Corrigir, commitar e abrir PR para `main`.

3. Após merge em `main`, aplicar a mesma correção em `desenvolvimento`:

- via PR de `hotfix/*` para `desenvolvimento`, ou
- via merge de `main` em `desenvolvimento`.

## Convenção de commits

Mensagens devem ser em pt-BR, objetivas e no formato:

```text
tipo(escopo): descrição
```

Tipos recomendados:

- `feat`: nova funcionalidade.
- `fix`: correção de bug.
- `chore`: manutenção, tooling, infra.
- `docs`: documentação.

Exemplos:

- `feat(api): adiciona endpoint de busca de leads`
- `fix(web): corrige exibição da tabela de resultados`
- `chore(infra): ajusta configuração do docker compose`
- `docs(readme): atualiza instruções de setup`

## Checklist obrigatório antes de PR

Executar na raiz do monorepo:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

Também é obrigatório:

- validar manualmente o fluxo alterado;
- descrever no PR o que foi alterado e como testar;
- manter PR pequeno e focado em um objetivo.

## Regras de merge

- Não fazer push direto em `main`.
- Evitar commit direto em `desenvolvimento` para features (usar `feature/*`).
- Toda mudança relevante deve passar por PR.

## Observações para automação e agentes

- Agentes devem seguir este fluxo ao propor mudanças.
- Quando aplicável, agentes devem sugerir branch de feature e PR para `desenvolvimento`.
- Alterações para produção devem entrar em `main` apenas via PR.
