import Fastify from "fastify";
import { Readable } from "node:stream";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import { prisma } from "@leadsroute/database";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fastify";
import { router } from "./orpc/router.js";
import { assertAuthConfig, authConfig } from "./auth/config.js";
import { verifyResendWebhook } from "./services/email.js";

export function buildServer() {
  assertAuthConfig();

  const app = Fastify({
    logger: true,
    handlerTimeout: Number(process.env.API_HANDLER_TIMEOUT_MS ?? 30000),
  });
  const rpcHandler = new RPCHandler(router, {
    interceptors: [
      onError((error) => {
        app.log.error(error);
      }),
    ],
  });

  app.register(cors, {
    origin: authConfig.appBaseUrl,
    credentials: true,
  });

  app.register(cookie);

  app.register(jwt, {
    secret: authConfig.accessSecret,
    namespace: "access",
    jwtVerify: "accessJwtVerify",
    jwtSign: "accessJwtSign",
    cookie: {
      cookieName: authConfig.accessCookieName,
      signed: false,
    },
  });

  app.register(jwt, {
    secret: authConfig.refreshSecret,
    namespace: "refresh",
    jwtVerify: "refreshJwtVerify",
    jwtSign: "refreshJwtSign",
    cookie: {
      cookieName: authConfig.refreshCookieName,
      signed: false,
    },
  });

  app.register(rateLimit, {
    global: false,
    max: Number(process.env.API_RATE_LIMIT_MAX ?? 120),
    timeWindow: process.env.API_RATE_LIMIT_WINDOW ?? "1 minute",
    errorResponseBuilder: (
      _request: unknown,
      context: { after: string | number }
    ) => {
      return {
        statusCode: 429,
        error: "Too Many Requests",
        message: `Limite excedido. Tente novamente em ${context.after}.`,
      };
    },
  });

  app.post(
    "/webhooks/resend",
    {
      config: {
        rateLimit: {
          max: Number(process.env.API_WEBHOOK_RATE_LIMIT_MAX ?? 30),
          timeWindow: process.env.API_WEBHOOK_RATE_LIMIT_WINDOW ?? "1 minute",
        },
      },
    },
    async (request, reply) => {
      const id = request.headers["svix-id"];
      const timestamp = request.headers["svix-timestamp"];
      const signature = request.headers["svix-signature"];

      if (!id || !timestamp || !signature) {
        reply.status(400).send({ message: "Headers de assinatura ausentes." });
        return;
      }

      const payload = await streamToString(request.raw);

      let event: unknown;

      try {
        event = verifyResendWebhook({
          payload,
          headers: {
            id: String(id),
            timestamp: String(timestamp),
            signature: String(signature),
          },
        });
      } catch (error) {
        app.log.error({ error }, "Falha na verificacao do webhook Resend");
        reply.status(401).send({ message: "Assinatura invalida." });
        return;
      }

      const parsedEvent = normalizeResendEvent(event);

      await prisma.emailDeliveryEvent.create({
        data: {
          provider: "resend",
          messageId: parsedEvent.messageId,
          eventType: parsedEvent.type,
          recipient: parsedEvent.recipient,
          occurredAt: parsedEvent.occurredAt,
          payload: payload,
        },
      });

      reply.status(200).send({ ok: true });
    }
  );

  app.addContentTypeParser("*", (_request, _payload, done) => {
    done(null, undefined);
  });

  app.all("/rpc/*", {
    config: {
      rateLimit: {
        max: Number(process.env.API_RPC_RATE_LIMIT_MAX ?? 60),
        timeWindow: process.env.API_RPC_RATE_LIMIT_WINDOW ?? "1 minute",
      },
    },
  }, async (request, reply) => {
    const { matched } = await rpcHandler.handle(request, reply, {
      prefix: "/rpc",
      context: {
        request,
        reply,
      },
    });

    if (!matched) {
      reply.status(404).send({ message: "Rota RPC nao encontrada." });
    }
  });

  app.get("/hello", async () => {
    return { message: "Hello World!" };
  });

  return app;
}

async function streamToString(stream: Readable): Promise<string> {
  const chunks: Buffer[] = [];

  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
  }

  return Buffer.concat(chunks).toString("utf-8");
}

function normalizeResendEvent(event: unknown): {
  type: string;
  messageId: string | null;
  recipient: string | null;
  occurredAt: Date;
} {
  if (!event || typeof event !== "object") {
    return {
      type: "unknown",
      messageId: null,
      recipient: null,
      occurredAt: new Date(),
    };
  }

  const value = event as Record<string, unknown>;
  const data =
    value.data && typeof value.data === "object"
      ? (value.data as Record<string, unknown>)
      : undefined;

  const createdAt =
    typeof value.created_at === "string"
      ? new Date(value.created_at)
      : typeof value.createdAt === "string"
        ? new Date(value.createdAt)
        : new Date();

  return {
    type: typeof value.type === "string" ? value.type : "unknown",
    messageId: typeof data?.email_id === "string" ? data.email_id : null,
    recipient:
      typeof data?.to === "string"
        ? data.to
        : Array.isArray(data?.to) && typeof data.to[0] === "string"
          ? data.to[0]
          : null,
    occurredAt: Number.isNaN(createdAt.getTime()) ? new Date() : createdAt,
  };
}
