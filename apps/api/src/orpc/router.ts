import { contract } from "@leadsroute/contracts";
import { prisma } from "@leadsroute/database";
import { implement } from "@orpc/server";

const os = implement(contract);

const hello = os.system.hello.handler(async () => {
  const health = await prisma.appHealth.create({
    data: {
      message: "Hello World!",
    },
  });

  return { message: health.message };
});

export const router = os.router({
  system: {
    hello,
  },
});
