import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fastify";
import { router } from "./orpc/router.js";
import { assertAuthConfig, authConfig } from "./auth/config.js";

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
