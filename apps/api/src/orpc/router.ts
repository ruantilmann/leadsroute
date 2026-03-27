import type { FastifyReply, FastifyRequest } from "fastify";
import { contract } from "@leadsroute/contracts";
import { prisma } from "@leadsroute/database";
import { implement, ORPCError } from "@orpc/server";
import { authConfig, getCookieOptions } from "../auth/config.js";
import {
  expiresAtFromDuration,
  generateOpaqueToken,
  hashOpaqueToken,
  hashPassword,
  normalizeEmail,
  verifyPassword,
} from "../auth/security.js";
import { sendEmailVerification, sendPasswordReset } from "../services/email.js";
import { searchPlacesByText } from "../services/google-places.js";

type AccessPayload = {
  sub: string;
  email: string;
  emailVerified: boolean;
  typ: "access";
};

type RefreshPayload = {
  sub: string;
  sid: string;
  tid: string;
  typ: "refresh";
};

type AppContext = {
  request: FastifyRequest;
  reply: FastifyReply;
  auth?: {
    userId: string;
    email: string;
    emailVerified: boolean;
  };
};

const os = implement<typeof contract, AppContext>(contract);
const requestRateBuckets = new Map<string, { count: number; resetAt: number }>();

const requireAuth = os.middleware(async ({ context, next }) => {
  const payload = await verifyAccessFromRequest(context.request);

  return next({
    context: {
      auth: {
        userId: payload.sub,
        email: payload.email,
        emailVerified: payload.emailVerified,
      },
    },
  });
});

const hello = os.system.hello.handler(async () => {
  const health = await prisma.appHealth.create({
    data: {
      message: "Hello World!",
    },
  });

  return { message: health.message };
});

const signup = os.auth.signup.handler(async ({ input, context }) => {
  const email = normalizeEmail(input.email);
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw new ORPCError("CONFLICT", {
      message: "Email ja cadastrado.",
    });
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
    },
  });

  await issueSessionCookies({
    request: context.request,
    reply: context.reply,
    user,
  });

  await generateAndSendEmailVerification(user.id, user.email);

  return {
    user: toAuthUser(user),
    emailVerificationRequired: true,
  };
});

const login = os.auth.login.handler(async ({ input, context }) => {
  const email = normalizeEmail(input.email);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Credenciais invalidas.",
    });
  }

  const validPassword = await verifyPassword(user.passwordHash, input.password);

  if (!validPassword) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Credenciais invalidas.",
    });
  }

  await issueSessionCookies({
    request: context.request,
    reply: context.reply,
    user,
  });

  if (!user.emailVerifiedAt) {
    await generateAndSendEmailVerification(user.id, user.email);
  }

  return {
    user: toAuthUser(user),
  };
});

const me = os.auth.me.handler(async ({ context }) => {
  const payload = await verifyAccessFromRequest(context.request);
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
  });

  if (!user) {
    clearAuthCookies(context.reply);
    throw new ORPCError("UNAUTHORIZED", {
      message: "Sessao invalida.",
    });
  }

  return { user: toAuthUser(user) };
});

const refresh = os.auth.refresh.handler(async ({ context }) => {
  const refreshPayload = await verifyRefreshFromRequest(context.request);
  const rawRefreshToken = context.request.cookies[authConfig.refreshCookieName];

  if (!rawRefreshToken) {
    clearAuthCookies(context.reply);
    throw new ORPCError("UNAUTHORIZED", {
      message: "Sessao invalida.",
    });
  }

  const session = await prisma.refreshTokenSession.findUnique({
    where: { id: refreshPayload.sid },
  });

  if (!session || session.userId !== refreshPayload.sub || session.revokedAt) {
    clearAuthCookies(context.reply);
    throw new ORPCError("UNAUTHORIZED", {
      message: "Sessao invalida.",
    });
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.refreshTokenSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    clearAuthCookies(context.reply);
    throw new ORPCError("UNAUTHORIZED", {
      message: "Sessao expirada.",
    });
  }

  const incomingHash = hashOpaqueToken(rawRefreshToken);
  const tokenMismatch = incomingHash !== session.tokenHash;
  const staleTokenUsed = refreshPayload.tid !== session.replacedByTokenId;

  if (tokenMismatch || staleTokenUsed) {
    await revokeAllUserSessions(session.userId);
    clearAuthCookies(context.reply);

    throw new ORPCError("UNAUTHORIZED", {
      message: "Sessao comprometida. Faca login novamente.",
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) {
    clearAuthCookies(context.reply);
    throw new ORPCError("UNAUTHORIZED", {
      message: "Sessao invalida.",
    });
  }

  await issueSessionCookies({
    request: context.request,
    reply: context.reply,
    user,
    sessionId: session.id,
  });

  return { ok: true };
});

const logout = os.auth.logout.handler(async ({ context }) => {
  try {
    const payload = await verifyRefreshFromRequest(context.request);

    await prisma.refreshTokenSession.updateMany({
      where: {
        id: payload.sid,
        userId: payload.sub,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  } catch {
    // logout deve ser idempotente
  }

  clearAuthCookies(context.reply);

  return { ok: true };
});

const logoutAll = os.auth.logoutAll.handler(async ({ context }) => {
  const payload = await verifyAccessFromRequest(context.request);
  await revokeAllUserSessions(payload.sub);
  clearAuthCookies(context.reply);

  return { ok: true };
});

const requestEmailVerification = os.auth.requestEmailVerification.handler(async ({ input, context }) => {
  return withMinimumDuration(async () => {
    const email = normalizeEmail(input.email);
    assertRateLimit(`email-verify:ip:${context.request.ip}`, 5, 60 * 1000);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user && !user.emailVerifiedAt) {
      assertRateLimit(`email-verify:user:${user.id}`, 3, 10 * 60 * 1000);

      const recentToken = await prisma.emailVerificationToken.findFirst({
        where: {
          userId: user.id,
          createdAt: {
            gte: new Date(Date.now() - 60 * 1000),
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (recentToken) {
        throw new ORPCError("TOO_MANY_REQUESTS", {
          message: "Aguarde um minuto para solicitar um novo e-mail de verificacao.",
        });
      }

      await generateAndSendEmailVerification(user.id, user.email);
    }

    return { ok: true };
  });
});

const verifyEmail = os.auth.verifyEmail.handler(async ({ input, context }) => {
  assertRateLimit(`verify-email:ip:${context.request.ip}`, 20, 60 * 1000);

  const tokenHash = hashOpaqueToken(input.token);

  const token = await prisma.emailVerificationToken.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: true,
    },
  });

  if (!token || token.usedAt || token.expiresAt.getTime() <= Date.now()) {
    throw new ORPCError("BAD_REQUEST", {
      message: "Token invalido ou expirado.",
    });
  }

  await prisma.$transaction([
    prisma.emailVerificationToken.update({
      where: { id: token.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: token.userId },
      data: { emailVerifiedAt: new Date() },
    }),
  ]);

  return { ok: true };
});

const requestPasswordReset = os.auth.requestPasswordReset.handler(async ({ input, context }) => {
  return withMinimumDuration(async () => {
    const email = normalizeEmail(input.email);
    assertRateLimit(`reset:ip:${context.request.ip}`, 5, 60 * 1000);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      assertRateLimit(`reset:user:${user.id}`, 3, 10 * 60 * 1000);

      const recentToken = await prisma.passwordResetToken.findFirst({
        where: {
          userId: user.id,
          createdAt: {
            gte: new Date(Date.now() - 60 * 1000),
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (recentToken) {
        throw new ORPCError("TOO_MANY_REQUESTS", {
          message: "Aguarde um minuto para solicitar um novo reset de senha.",
        });
      }

      const resetToken = generateOpaqueToken();

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashOpaqueToken(resetToken),
          expiresAt: expiresAtFromDuration(authConfig.passwordResetTokenExpiresIn),
        },
      });

      await sendPasswordReset({
        to: user.email,
        token: resetToken,
        userId: user.id,
      });
    }

    return { ok: true };
  });
});

const resetPassword = os.auth.resetPassword.handler(async ({ input, context }) => {
  assertRateLimit(`reset-password:ip:${context.request.ip}`, 20, 60 * 1000);

  const tokenHash = hashOpaqueToken(input.token);

  const token = await prisma.passwordResetToken.findUnique({
    where: {
      tokenHash,
    },
  });

  if (!token || token.usedAt || token.expiresAt.getTime() <= Date.now()) {
    throw new ORPCError("BAD_REQUEST", {
      message: "Token invalido ou expirado.",
    });
  }

  const passwordHash = await hashPassword(input.password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: token.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: token.id },
      data: { usedAt: new Date() },
    }),
    prisma.refreshTokenSession.updateMany({
      where: { userId: token.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  clearAuthCookies(context.reply);

  return { ok: true };
});

const importBySearch = os.lead.importBySearch.use(requireAuth).handler(async ({ input }) => {
  const searchResult = await searchPlacesByText({
    termo: input.termo,
    cidade: input.cidade,
    limite: input.limite,
  });

  let importedWithPhone = 0;
  let importedWithoutPhone = 0;
  let updated = 0;
  let skipped = 0;

  for (const lead of searchResult.leads) {
    if (!lead.nomeEmpresa || !lead.enderecoCompleto || !lead.cidade) {
      skipped += 1;
      continue;
    }

    const exists = await prisma.lead.findUnique({
      where: { placeId: lead.placeId },
      select: { id: true },
    });

    await prisma.lead.upsert({
      where: { placeId: lead.placeId },
      update: {
        nomeEmpresa: lead.nomeEmpresa,
        telefone: lead.telefone,
        enderecoCompleto: lead.enderecoCompleto,
        numero: lead.numero,
        rua: lead.rua,
        bairro: lead.bairro,
        cidade: lead.cidade,
        estado: lead.estado,
      },
      create: {
        placeId: lead.placeId,
        nomeEmpresa: lead.nomeEmpresa,
        telefone: lead.telefone,
        enderecoCompleto: lead.enderecoCompleto,
        numero: lead.numero,
        rua: lead.rua,
        bairro: lead.bairro,
        cidade: lead.cidade,
        estado: lead.estado,
      },
    });

    if (exists) {
      updated += 1;
    } else if (lead.telefone) {
      importedWithPhone += 1;
    } else {
      importedWithoutPhone += 1;
    }
  }

  return {
    importedWithPhone,
    importedWithoutPhone,
    updated,
    skipped,
    totalProcessed: searchResult.leads.length,
  };
});

const listLeads = os.lead.list.use(requireAuth).handler(async ({ input }) => {
  const page = input.page;
  const pageSize = input.pageSize;

  const where = {
    ...(input.cidade
      ? {
          cidade: {
            equals: input.cidade,
            mode: "insensitive" as const,
          },
        }
      : {}),
    ...(input.search
      ? {
          OR: [
            {
              nomeEmpresa: {
                contains: input.search,
                mode: "insensitive" as const,
              },
            },
            {
              enderecoCompleto: {
                contains: input.search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
    ...(input.hasPhone === true
      ? {
          telefone: {
            not: null,
          },
        }
      : {}),
    ...(input.hasPhone === false
      ? {
          telefone: null,
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.lead.count({ where }),
  ]);

  return {
    items: items.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    })),
    total,
    page,
    pageSize,
  };
});

const getLeadById = os.lead.getById.use(requireAuth).handler(async ({ input }) => {
  const lead = await prisma.lead.findUnique({
    where: { id: input.id },
  });

  if (!lead) {
    throw new ORPCError("NOT_FOUND", {
      message: "Lead nao encontrado.",
    });
  }

  return {
    ...lead,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  };
});

export const router = os.router({
  system: {
    hello,
  },
  auth: {
    signup,
    login,
    me,
    refresh,
    logout,
    logoutAll,
    requestEmailVerification,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
  },
  lead: {
    importBySearch,
    list: listLeads,
    getById: getLeadById,
  },
});

async function issueSessionCookies(params: {
  request: FastifyRequest;
  reply: FastifyReply;
  user: {
    id: string;
    email: string;
    emailVerifiedAt: Date | null;
  };
  sessionId?: string;
}): Promise<void> {
  const accessExpiresAt = expiresAtFromDuration(authConfig.accessTokenExpiresIn);
  const refreshExpiresAt = expiresAtFromDuration(authConfig.refreshTokenExpiresIn);

  const tokenId = generateOpaqueToken();
  const sessionId = params.sessionId ?? generateOpaqueToken();

  const accessToken = await params.reply.accessJwtSign(
    {
      sub: params.user.id,
      email: params.user.email,
      emailVerified: Boolean(params.user.emailVerifiedAt),
      typ: "access",
    },
    {
      expiresIn: authConfig.accessTokenExpiresIn,
    }
  );

  const refreshToken = await params.reply.refreshJwtSign(
    {
      sub: params.user.id,
      sid: sessionId,
      tid: tokenId,
      typ: "refresh",
    },
    {
      expiresIn: authConfig.refreshTokenExpiresIn,
    }
  );

  await prisma.refreshTokenSession.upsert({
    where: { id: sessionId },
    create: {
      id: sessionId,
      userId: params.user.id,
      tokenHash: hashOpaqueToken(refreshToken),
      userAgent: params.request.headers["user-agent"],
      ipAddress: params.request.ip,
      expiresAt: refreshExpiresAt,
      replacedByTokenId: tokenId,
      lastUsedAt: new Date(),
    },
    update: {
      tokenHash: hashOpaqueToken(refreshToken),
      userAgent: params.request.headers["user-agent"],
      ipAddress: params.request.ip,
      expiresAt: refreshExpiresAt,
      replacedByTokenId: tokenId,
      lastUsedAt: new Date(),
      revokedAt: null,
    },
  });

  params.reply.setCookie(authConfig.accessCookieName, accessToken, getCookieOptions(accessExpiresAt));
  params.reply.setCookie(
    authConfig.refreshCookieName,
    refreshToken,
    getCookieOptions(refreshExpiresAt)
  );
}

function clearAuthCookies(reply: FastifyReply): void {
  const cookieOptions = {
    ...getCookieOptions(new Date(0)),
    expires: new Date(0),
    maxAge: 0,
  };

  reply.setCookie(authConfig.accessCookieName, "", cookieOptions);
  reply.setCookie(authConfig.refreshCookieName, "", cookieOptions);
}

async function verifyAccessFromRequest(request: FastifyRequest): Promise<AccessPayload> {
  try {
    await request.accessJwtVerify({ onlyCookie: true });
  } catch {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Nao autenticado.",
    });
  }

  const payload = request.user;

  if (!isAccessPayload(payload)) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Token de acesso invalido.",
    });
  }

  return payload;
}

async function verifyRefreshFromRequest(request: FastifyRequest): Promise<RefreshPayload> {
  try {
    await request.refreshJwtVerify({ onlyCookie: true });
  } catch {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Refresh token invalido.",
    });
  }

  const payload = request.user;

  if (!isRefreshPayload(payload)) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Refresh token invalido.",
    });
  }

  return payload;
}

async function revokeAllUserSessions(userId: string): Promise<void> {
  await prisma.refreshTokenSession.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

async function generateAndSendEmailVerification(userId: string, email: string): Promise<void> {
  await prisma.emailVerificationToken.updateMany({
    where: {
      userId,
      usedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    data: {
      usedAt: new Date(),
    },
  });

  const verificationToken = generateOpaqueToken();

  await prisma.emailVerificationToken.create({
    data: {
      userId,
      tokenHash: hashOpaqueToken(verificationToken),
      expiresAt: expiresAtFromDuration(authConfig.emailVerificationTokenExpiresIn),
    },
  });

  await sendEmailVerification({
    to: email,
    token: verificationToken,
    userId,
  });
}

function assertRateLimit(key: string, max: number, windowMs: number): void {
  const now = Date.now();
  const current = requestRateBuckets.get(key);

  if (!current || current.resetAt <= now) {
    requestRateBuckets.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return;
  }

  if (current.count >= max) {
    throw new ORPCError("TOO_MANY_REQUESTS", {
      message: "Muitas tentativas. Tente novamente em instantes.",
    });
  }

  current.count += 1;
}

async function withMinimumDuration<T>(fn: () => Promise<T>): Promise<T> {
  const minMs = 500;
  const startedAt = Date.now();

  try {
    return await fn();
  } finally {
    const elapsed = Date.now() - startedAt;
    if (elapsed < minMs) {
      await wait(minMs - elapsed);
    }
  }
}

async function wait(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function isAccessPayload(payload: unknown): payload is AccessPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const item = payload as Record<string, unknown>;
  return (
    item.typ === "access" &&
    typeof item.sub === "string" &&
    typeof item.email === "string" &&
    typeof item.emailVerified === "boolean"
  );
}

function isRefreshPayload(payload: unknown): payload is RefreshPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const item = payload as Record<string, unknown>;
  return (
    item.typ === "refresh" &&
    typeof item.sub === "string" &&
    typeof item.sid === "string" &&
    typeof item.tid === "string"
  );
}

function toAuthUser(user: {
  id: string;
  email: string;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    emailVerified: Boolean(user.emailVerifiedAt),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
