# Arquitetura de autenticacao JWT

Este documento descreve a implementacao de autenticacao com JWT no LeadsRoute.

## Estrategia adotada

- Access token de curta duracao (cookie HttpOnly).
- Refresh token de longa duracao (cookie HttpOnly).
- Rotacao de refresh token a cada renovacao de sessao.
- Revogacao de sessao atual e logout global.

## Modelos de dados

- `User`: conta do usuario (`email` unico, `passwordHash`, `emailVerifiedAt`).
- `RefreshTokenSession`: sessao por dispositivo para controle de refresh token.
- `EmailVerificationToken`: token de confirmacao de email de uso unico.
- `PasswordResetToken`: token de redefinicao de senha de uso unico.

## Fluxos suportados

1. Cadastro com email e senha.
2. Login com email e senha.
3. Renovacao de sessao por refresh token.
4. Logout da sessao atual.
5. Logout global (revoga todas as sessoes).
6. Solicitar confirmacao de email e confirmar por token.
7. Solicitar redefinicao de senha e redefinir por token.

## Cookies

- `AUTH_ACCESS_COOKIE_NAME` (padrao `lr_access_token`)
- `AUTH_REFRESH_COOKIE_NAME` (padrao `lr_refresh_token`)

Opcoes de seguranca:

- `httpOnly: true`
- `sameSite: lax`
- `secure: true` apenas em producao
- `path: /`

## Variaveis de ambiente principais

- `AUTH_ACCESS_TOKEN_SECRET`
- `AUTH_REFRESH_TOKEN_SECRET`
- `AUTH_ACCESS_TOKEN_EXPIRES_IN`
- `AUTH_REFRESH_TOKEN_EXPIRES_IN`
- `AUTH_JWT_ISSUER`
- `AUTH_JWT_AUDIENCE`
- `APP_BASE_URL`
- `AUTH_EMAIL_ENABLED`
- `AUTH_EMAIL_FROM`
- `RESEND_API_KEY`

## Observacoes de seguranca

- Hash de senha com Argon2id.
- Tokens de email e reset armazenados somente em hash (SHA-256) no banco.
- Mensagens de recuperacao de senha evitam enumeracao de email.
- Reuso/stale de refresh token revoga todas as sessoes do usuario.
