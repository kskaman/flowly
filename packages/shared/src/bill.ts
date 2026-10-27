import { z } from "zod";
import { dueDay, money, requiredString } from "./common.js";

export const createBillBody = z.object({
  name: requiredString("Bill name"),
  category: requiredString("Category"),
  amount: money,
  dueDate: dueDay,
  theme: requiredString("Theme"),
});
export type CreateBillBody = z.infer<typeof createBillBody>;

export const updateBillBody = z.object({
  name: requiredString("Bill name").optional(),
  category: requiredString("Category").optional(),
  amount: money.optional(),
  dueDate: dueDay.optional(),
});
export type UpdateBillBody = z.infer<typeof updateBillBody>;

export const billSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  category: z.string(),
  amount: z.number(),
  dueDate: z.number().int(),
  lastPaid: z.string().nullable(),
  theme: z.string(),
});
export type BillDto = z.infer<typeof billSchema>;
