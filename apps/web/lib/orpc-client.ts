import { contract } from "@leadsroute/contracts";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { ContractRouterClient } from "@orpc/contract";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

const link = new RPCLink({
  url: `${apiUrl}/rpc`,
});

export const orpc: ContractRouterClient<typeof contract> = createORPCClient(link);
