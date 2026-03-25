import Fastify from "fastify";
import cors from "@fastify/cors";

export function buildServer() {
  const app = Fastify({ logger: true });

  app.register(cors, {
    origin: true,
  });

  app.get("/hello", async () => {
    return { message: "Hello World!!!" };
  });

  return app;
}
