import { z } from "zod";
import { positiveMoney, requiredString } from "./common.js";

export const createBudgetBody = z.object({
  category: requiredString("Category"),
  maximum: positiveMoney,
  theme: requiredString("Theme"),
});
export type CreateBudgetBody = z.infer<typeof createBudgetBody>;

export const updateBudgetBody = z.object({
  maximum: positiveMoney,
  theme: requiredString("Theme"),
});
export type UpdateBudgetBody = z.infer<typeof updateBudgetBody>;

export const budgetSchema = z.object({
  id: z.uuid(),
  category: z.string(),
  maximum: z.number(),
  theme: z.string(),
});
export type BudgetDto = z.infer<typeof budgetSchema>;
