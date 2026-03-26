<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Regras de fluxo do projeto

- Siga obrigatoriamente o fluxo definido em `docs/fluxo-desenvolvimento.md`.
- Para novas funcionalidades, trabalhe em `feature/*` com PR para `desenvolvimento`.
- Não proponha merge direto para `main` sem passar pelo fluxo de release.
- Mantenha mensagens de commit em português do Brasil (pt-BR).

## Regras de documentação (obrigatórias)

- Toda alteração de código deve avaliar impacto em documentação.
- Após qualquer adição, remoção ou mudança de comportamento, atualize a documentação correspondente no mesmo ciclo de trabalho.
- Nunca finalize uma entrega sem verificar se `README.md`, `docs/fluxo-desenvolvimento.md` e demais arquivos em `docs/` continuam corretos.
- Se não houver impacto de documentação, registre explicitamente na resposta final: "Sem impacto de documentação".

## Checklist de documentação para agentes

Antes de concluir qualquer tarefa, o agente deve verificar:

1. A mudança alterou setup, comandos, ambiente ou scripts?
   - Atualizar `README.md`.
2. A mudança alterou fluxo de branches, PR, release ou hotfix?
   - Atualizar `docs/fluxo-desenvolvimento.md`.
3. A mudança alterou arquitetura, contratos, integrações ou convenções?
   - Atualizar o arquivo correspondente em `docs/`.
4. A resposta final ao usuário deve listar quais arquivos de documentação foram atualizados.

## Regra de consistência

- Código e documentação devem evoluir juntos no mesmo conjunto de alterações.
- Evite documentar depois: documente durante a implementação.
