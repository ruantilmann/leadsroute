import { createHash } from "node:crypto";
import { Resend } from "resend";
import { authConfig } from "../auth/config.js";

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!authConfig.emailEnabled) {
    throw new Error("Envio de e-mail desabilitado.");
  }

  if (!authConfig.resendApiKey) {
    throw new Error("RESEND_API_KEY nao definido.");
  }

  if (!resendClient) {
    resendClient = new Resend(authConfig.resendApiKey);
  }

  return resendClient;
}

export async function sendEmailVerification(params: {
  to: string;
  token: string;
  userId: string;
}): Promise<void> {
  const client = getResendClient();
  const url = new URL("/verificar-email", authConfig.appBaseUrl);
  url.searchParams.set("token", params.token);

  const idempotencyKey = buildIdempotencyKey(
    "email-verification",
    params.userId,
    params.token
  );

  const { error } = await client.emails.send(
    {
      from: authConfig.emailFrom,
      to: [params.to],
      subject: "Confirme seu e-mail no LeadsRoute",
      html: `<p>Bem-vindo ao LeadsRoute.</p><p>Confirme seu e-mail clicando no link abaixo:</p><p><a href="${url.toString()}">Confirmar e-mail</a></p>`,
    },
    {
      idempotencyKey,
    }
  );

  if (error) {
    throw new Error(`Falha no envio do e-mail de verificacao: ${error.message}`);
  }
}

export async function sendPasswordReset(params: {
  to: string;
  token: string;
  userId: string;
}): Promise<void> {
  const client = getResendClient();
  const url = new URL("/redefinir-senha", authConfig.appBaseUrl);
  url.searchParams.set("token", params.token);

  const idempotencyKey = buildIdempotencyKey("password-reset", params.userId, params.token);

  const { error } = await client.emails.send(
    {
      from: authConfig.emailFrom,
      to: [params.to],
      subject: "Redefinicao de senha no LeadsRoute",
      html: `<p>Recebemos uma solicitacao para redefinir sua senha.</p><p>Use o link abaixo para criar uma nova senha:</p><p><a href="${url.toString()}">Redefinir senha</a></p>`,
    },
    {
      idempotencyKey,
    }
  );

  if (error) {
    throw new Error(`Falha no envio do e-mail de redefinicao: ${error.message}`);
  }
}

export function verifyResendWebhook(params: {
  payload: string;
  headers: {
    id: string;
    timestamp: string;
    signature: string;
  };
}): unknown {
  if (!authConfig.resendWebhookSecret) {
    throw new Error("RESEND_WEBHOOK_SECRET nao definido.");
  }

  const client = getResendClient();

  return client.webhooks.verify({
    payload: params.payload,
    headers: params.headers,
    webhookSecret: authConfig.resendWebhookSecret,
  });
}

function buildIdempotencyKey(prefix: string, userId: string, token: string): string {
  const fingerprint = createHash("sha256").update(`${prefix}:${userId}:${token}`).digest("hex");
  return `${prefix}/${userId}/${fingerprint.slice(0, 32)}`;
}
