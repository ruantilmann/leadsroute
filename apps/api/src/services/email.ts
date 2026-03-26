import { Resend } from "resend";
import { authConfig } from "../auth/config.js";

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!authConfig.emailEnabled || !authConfig.resendApiKey) {
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(authConfig.resendApiKey);
  }

  return resendClient;
}

export async function sendEmailVerification(params: {
  to: string;
  token: string;
}): Promise<void> {
  const client = getResendClient();

  if (!client) {
    return;
  }

  const url = new URL("/verificar-email", authConfig.appBaseUrl);
  url.searchParams.set("token", params.token);

  await client.emails.send({
    from: authConfig.emailFrom,
    to: [params.to],
    subject: "Confirme seu e-mail no LeadsRoute",
    html: `<p>Bem-vindo ao LeadsRoute.</p><p>Confirme seu e-mail clicando no link abaixo:</p><p><a href="${url.toString()}">Confirmar e-mail</a></p>`,
  });
}

export async function sendPasswordReset(params: {
  to: string;
  token: string;
}): Promise<void> {
  const client = getResendClient();

  if (!client) {
    return;
  }

  const url = new URL("/redefinir-senha", authConfig.appBaseUrl);
  url.searchParams.set("token", params.token);

  await client.emails.send({
    from: authConfig.emailFrom,
    to: [params.to],
    subject: "Redefinicao de senha no LeadsRoute",
    html: `<p>Recebemos uma solicitacao para redefinir sua senha.</p><p>Use o link abaixo para criar uma nova senha:</p><p><a href="${url.toString()}">Redefinir senha</a></p>`,
  });
}
