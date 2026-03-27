import type { CookieSerializeOptions } from "@fastify/cookie";

const defaultAccessExpiresIn = "15m";
const defaultRefreshExpiresIn = "30d";

export const authConfig = {
  accessCookieName: process.env.AUTH_ACCESS_COOKIE_NAME ?? "lr_access_token",
  refreshCookieName: process.env.AUTH_REFRESH_COOKIE_NAME ?? "lr_refresh_token",
  accessTokenExpiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRES_IN ?? defaultAccessExpiresIn,
  refreshTokenExpiresIn:
    process.env.AUTH_REFRESH_TOKEN_EXPIRES_IN ?? defaultRefreshExpiresIn,
  accessSecret: process.env.AUTH_ACCESS_TOKEN_SECRET ?? "",
  refreshSecret: process.env.AUTH_REFRESH_TOKEN_SECRET ?? "",
  jwtIssuer: process.env.AUTH_JWT_ISSUER ?? "leadsroute-api",
  jwtAudience: process.env.AUTH_JWT_AUDIENCE ?? "leadsroute-web",
  appBaseUrl: process.env.APP_BASE_URL ?? "http://localhost:3000",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  resendWebhookSecret: process.env.RESEND_WEBHOOK_SECRET ?? "",
  emailFrom: process.env.AUTH_EMAIL_FROM ?? "LeadsRoute <onboarding@resend.dev>",
  emailEnabled: (process.env.AUTH_EMAIL_ENABLED ?? "true") === "true",
  emailVerificationTokenExpiresIn: process.env.AUTH_EMAIL_VERIFICATION_EXPIRES_IN ?? "24h",
  passwordResetTokenExpiresIn: process.env.AUTH_PASSWORD_RESET_EXPIRES_IN ?? "1h",
};

export function assertAuthConfig(): void {
  if (!authConfig.accessSecret) {
    throw new Error("AUTH_ACCESS_TOKEN_SECRET nao definido.");
  }

  if (!authConfig.refreshSecret) {
    throw new Error("AUTH_REFRESH_TOKEN_SECRET nao definido.");
  }

  if (authConfig.emailEnabled && !authConfig.resendApiKey) {
    throw new Error("RESEND_API_KEY nao definido com AUTH_EMAIL_ENABLED=true.");
  }
}

export function getCookieOptions(expiresAt: Date): CookieSerializeOptions {
  const isSecure = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecure,
    path: "/",
    expires: expiresAt,
  };
}
