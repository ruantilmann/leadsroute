import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import { buildServer } from "./server.js";

loadEnv({ path: resolve(process.cwd(), "../../.env") });

const port = Number(process.env.PORT ?? 3333);
const host = process.env.HOST ?? "0.0.0.0";

const app = buildServer();

const start = async () => {
  try {
    await app.listen({ port, host });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

void start();
