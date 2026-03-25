import { contract } from "@leadsroute/contracts";
import { implement } from "@orpc/server";

const os = implement(contract);

const hello = os.system.hello.handler(async () => {
  return { message: "Hello World!" };
});

export const router = os.router({
  system: {
    hello,
  },
});
