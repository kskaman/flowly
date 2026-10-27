import { z } from "zod";
import { positiveMoney, requiredString } from "./common.js";

export const createPotBody = z.object({
  name: requiredString("Pot name", 30),
  target: positiveMoney,
  theme: requiredString("Theme"),
});
export type CreatePotBody = z.infer<typeof createPotBody>;

export const updatePotBody = createPotBody.partial();
export type UpdatePotBody = z.infer<typeof updatePotBody>;

export const potTransactionBody = z.object({
  type: z.enum(["add", "withdraw"]),
  amount: positiveMoney,
});
export type PotTransactionBody = z.infer<typeof potTransactionBody>;

export const potSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  target: z.number(),
  total: z.number(),
  theme: z.string(),
});
export type PotDto = z.infer<typeof potSchema>;
