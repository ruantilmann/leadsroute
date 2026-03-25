import Fastify from "fastify";
import cors from "@fastify/cors";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fastify";
import { router } from "./orpc/router.js";

export function buildServer() {
  const app = Fastify({ logger: true });
  const rpcHandler = new RPCHandler(router, {
    interceptors: [
      onError((error) => {
        app.log.error(error);
      }),
    ],
  });

  app.register(cors, {
    origin: true,
  });

  app.addContentTypeParser("*", (_request, _payload, done) => {
    done(null, undefined);
  });

  app.all("/rpc/*", async (request, reply) => {
    const { matched } = await rpcHandler.handle(request, reply, {
      prefix: "/rpc",
      context: {},
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
