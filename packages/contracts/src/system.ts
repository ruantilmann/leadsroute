import { oc } from "@orpc/contract";
import { z } from "zod";
import { leadContract } from "./lead.js";

export const helloContract = oc
  .input(z.object({}).optional())
  .output(
    z.object({
      message: z.string(),
    })
  );

export const contract = {
  system: {
    hello: helloContract,
  },
  lead: leadContract,
};
