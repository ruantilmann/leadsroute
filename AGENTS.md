<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Regras de fluxo do projeto

- Siga obrigatoriamente o fluxo definido em `docs/fluxo-desenvolvimento.md`.
- Para novas funcionalidades, trabalhe em `feature/*` com PR para `desenvolvimento`.
- Nao proponha merge direto para `main` sem passar pelo fluxo de release.
- Mantenha mensagens de commit em portugues do Brasil (pt-BR).

## Regras de documentacao (obrigatorias)

- Toda alteracao de codigo deve avaliar impacto em documentacao.
- Apos qualquer adicao, remocao ou mudanca de comportamento, atualize a documentacao correspondente no mesmo ciclo de trabalho.
- Nunca finalize uma entrega sem verificar se `README.md`, `docs/fluxo-desenvolvimento.md` e demais arquivos em `docs/` continuam corretos.
- Se nao houver impacto de documentacao, registre explicitamente na resposta final: "Sem impacto de documentacao".

## Checklist de documentacao para agentes

Antes de concluir qualquer tarefa, o agente deve verificar:

1. A mudanca alterou setup, comandos, ambiente ou scripts?
   - Atualizar `README.md`.
2. A mudanca alterou fluxo de branches, PR, release ou hotfix?
   - Atualizar `docs/fluxo-desenvolvimento.md`.
3. A mudanca alterou arquitetura, contratos, integracoes ou convencoes?
   - Atualizar o arquivo correspondente em `docs/`.
4. A resposta final ao usuario deve listar quais arquivos de documentacao foram atualizados.

## Regra de consistencia

- Codigo e documentacao devem evoluir juntos no mesmo conjunto de alteracoes.
- Evite documentar depois: documente durante a implementacao.
