# Implementacao de login e autenticacao (JWT)

Este documento organiza o plano de implementacao em formato de lista de tarefas (to do list), com foco em commits pequenos e incrementais.

## Objetivo

- [ ] Implementar cadastro + login com JWT (access + refresh).
- [ ] Proteger toda a aplicacao web e operacoes da API para usuarios autenticados.
- [ ] Incluir confirmacao de email e recuperacao de senha na Fase 1.

## Decisoes definidas

- [ ] Fluxo de acesso: cadastro aberto (self-signup) + login.
- [ ] Credenciais: email + senha.
- [ ] Estrategia de token: access token + refresh token em cookie HttpOnly.
- [ ] Sessao: multiplos dispositivos + logout global.
- [ ] Autorizacao: sem RBAC neste momento (apenas autenticado).
- [ ] Escopo protegido: toda a aplicacao web.
- [ ] Hash de senha: Argon2id.
- [ ] Politica de senha: minimo 8 caracteres com complexidade.
- [ ] Email transacional: Resend.
- [ ] URL base para links: via variavel de ambiente (`APP_BASE_URL`).

## Branch e fluxo de trabalho

- [ ] Atualizar branch local `desenvolvimento`.
- [ ] Criar branch `feature/auth-jwt` a partir de `desenvolvimento`.
- [ ] Trabalhar em commits pequenos e objetivos.
- [ ] Abrir PR de `feature/auth-jwt` para `desenvolvimento`.

## Backlog tecnico (to do list)

### 1) Fundacao de autenticacao (banco e configuracao)

- [ ] Adicionar variaveis de ambiente de autenticacao no `.env.example`.
- [ ] Definir segredos e expiracoes configuraveis para JWT via env.
- [ ] Criar modelo `User` no Prisma com `email` unico e campos de seguranca.
- [ ] Criar modelo `RefreshTokenSession` para sessao por dispositivo.
- [ ] Criar modelo `EmailVerificationToken` com expiracao e uso unico.
- [ ] Criar modelo `PasswordResetToken` com expiracao e uso unico.
- [ ] Criar indices e constraints necessarias para consulta e revogacao.
- [ ] Gerar e aplicar migracao Prisma.

### 2) Contratos compartilhados (oRPC + Zod)

- [ ] Criar modulo `auth` em `packages/contracts`.
- [ ] Definir schema de `signup` com validacao de senha complexa.
- [ ] Definir schema de `login`.
- [ ] Definir schema de `me`.
- [ ] Definir schema de `refresh`.
- [ ] Definir schema de `logout`.
- [ ] Definir schema de `logoutAll`.
- [ ] Definir schema de `requestEmailVerification`.
- [ ] Definir schema de `verifyEmail`.
- [ ] Definir schema de `requestPasswordReset`.
- [ ] Definir schema de `resetPassword`.
- [ ] Exportar contratos no `index` do pacote.

### 3) API de autenticacao (Fastify + oRPC)

- [ ] Adicionar dependencias de seguranca (`@fastify/jwt`, cookie parser e Argon2).
- [ ] Configurar plugin JWT na API com claims (`iss`, `aud`, `exp`).
- [ ] Configurar cookies de autenticacao (`httpOnly`, `sameSite`, `secure` por ambiente).
- [ ] Implementar utilitario de hash e verificacao de senha (Argon2id).
- [ ] Implementar emissao de access token.
- [ ] Implementar emissao de refresh token.
- [ ] Implementar persistencia de sessao de refresh por dispositivo.
- [ ] Implementar rotacao de refresh token.
- [ ] Implementar deteccao e tratamento de refresh token reutilizado.
- [ ] Implementar handler `signup`.
- [ ] Implementar handler `login`.
- [ ] Implementar handler `me`.
- [ ] Implementar handler `refresh`.
- [ ] Implementar handler `logout` (sessao atual).
- [ ] Implementar handler `logoutAll` (todas as sessoes do usuario).
- [ ] Proteger rotas RPC de lead exigindo autenticacao.
- [ ] Ajustar CORS para credenciais entre web e API.
- [ ] Aplicar rate limit em endpoints sensiveis de auth.

### 4) Fluxos de email (Resend)

- [ ] Adicionar dependencia do Resend.
- [ ] Criar servico de envio de email transacional.
- [ ] Criar template de confirmacao de email.
- [ ] Criar template de recuperacao de senha.
- [ ] Implementar `requestEmailVerification` com token de uso unico.
- [ ] Implementar `verifyEmail` consumindo token valido.
- [ ] Implementar `requestPasswordReset` com token de uso unico.
- [ ] Implementar `resetPassword` com invalidacao do token apos uso.

### 5) Web (Next.js App Router)

- [ ] Criar pagina de login (`/login`).
- [ ] Criar pagina de cadastro (`/cadastro`).
- [ ] Criar pagina de verificacao de email (`/verificar-email`).
- [ ] Criar pagina de esqueci senha (`/esqueci-senha`).
- [ ] Criar pagina de redefinir senha (`/redefinir-senha`).
- [ ] Ajustar cliente oRPC para envio de cookies de sessao.
- [ ] Implementar carregamento de usuario autenticado (`me`).
- [ ] Implementar protecao de rotas no App Router.
- [ ] Implementar redirecionamento de nao autenticado para `/login`.
- [ ] Implementar redirecionamento de autenticado para pagina principal.

### 6) Seguranca e robustez

- [ ] Garantir que tokens sensiveis sejam armazenados somente em hash no banco.
- [ ] Evitar enumeracao de usuario nas mensagens de erro de auth.
- [ ] Registrar eventos de seguranca essenciais (login, logout, reset).
- [ ] Revisar expiracoes e politicas por variavel de ambiente.

### 7) Validacao e qualidade

- [ ] Criar testes de integracao para signup/login/refresh/logout/logoutAll.
- [ ] Criar testes para confirmacao de email.
- [ ] Criar testes para request/reset de senha.
- [ ] Executar `pnpm lint`.
- [ ] Executar `pnpm typecheck`.
- [ ] Executar `pnpm build`.

### 8) Documentacao (obrigatoria no mesmo ciclo)

- [ ] Atualizar `README.md` com novas variaveis de ambiente de auth.
- [ ] Atualizar `README.md` com fluxo de setup e uso de login.
- [ ] Criar/atualizar documentacao tecnica de auth em `docs/`.
- [ ] Revisar `docs/fluxo-desenvolvimento.md` e manter coerencia.
- [ ] Garantir que codigo e documentacao evoluam juntos em cada etapa.

## Sequencia sugerida de commits pequenos

- [ ] `chore(auth): adiciona variaveis de ambiente de autenticacao`
- [ ] `feat(database): cria modelos de autenticacao no prisma`
- [ ] `feat(contracts): adiciona contratos de autenticacao no orpc`
- [ ] `feat(api): implementa hash de senha e utilitarios jwt`
- [ ] `feat(api): implementa cadastro e login`
- [ ] `feat(api): implementa refresh, logout e logout global`
- [ ] `feat(api): protege rotas de lead com autenticacao`
- [ ] `feat(api): integra envio de emails com resend`
- [ ] `feat(api): implementa confirmacao de email`
- [ ] `feat(api): implementa esqueci/redefinir senha`
- [ ] `feat(web): cria telas de autenticacao`
- [ ] `feat(web): protege rotas e integra sessao via cookies`
- [ ] `docs(readme): atualiza setup e variaveis de autenticacao`
- [ ] `docs(auth): documenta arquitetura jwt e seguranca`
- [ ] `chore(ci): valida lint, typecheck e build`

## Criterios de aceite do MVP

- [ ] Usuario consegue cadastrar conta, confirmar email e fazer login.
- [ ] Usuario autenticado acessa areas protegidas.
- [ ] Access token expira e sessao continua via refresh token valido.
- [ ] Logout da sessao atual funciona corretamente.
- [ ] Logout global revoga todas as sessoes em todos os dispositivos.
- [ ] Fluxo de esqueci/redefinir senha funciona ponta a ponta.
- [ ] Rotas de lead bloqueiam acesso nao autenticado.
