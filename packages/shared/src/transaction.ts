import { z } from "zod";
import { dueDay, idSchema, money, requiredString } from "./common.js";

// "new" asks the server to create the recurring bill along with the transaction.
const recurringId = z.union([idSchema, z.literal("new")]).nullish();

const transactionFields = z.object({
  name: requiredString("Transaction name"),
  category: requiredString("Category"),
  date: z.coerce.date({ error: "Enter a valid date" }),
  amount: money,
  theme: requiredString("Theme"),
  recurring: z
    .boolean()
    .nullish()
    .transform((v) => v ?? false),
  recurringId,
  dueDate: dueDay.nullish(),
});

const needsDueDate = (v: { recurring: boolean; recurringId?: string | null; dueDate?: number | null }) =>
  !(v.recurring && (!v.recurringId || v.recurringId === "new") && v.dueDate == null);

const dueDateRequired = { message: "Due Date is required", path: ["dueDate"] };

export const createTransactionBody = transactionFields.refine(needsDueDate, dueDateRequired);
export type CreateTransactionBody = z.infer<typeof createTransactionBody>;

export const updateTransactionBody = transactionFields
  .extend({ theme: requiredString("Theme").optional() })
  .refine(needsDueDate, dueDateRequired);
export type UpdateTransactionBody = z.infer<typeof updateTransactionBody>;

export const SORT_OPTIONS = ["latest", "oldest", "highest", "lowest", "a to z", "z to a"] as const;

export const listTransactionsQuery = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  month: z
    .string()
    .regex(/^(all|[A-Za-z]+ \d{4})$/i, "Invalid month")
    .default("All"),
  searchName: z.string().trim().max(100).default(""),
  category: z.string().trim().min(1).default("All Transactions"),
  sortBy: z.enum(SORT_OPTIONS).catch("latest"),
});
export type ListTransactionsQuery = z.infer<typeof listTransactionsQuery>;

export const budgetCategoriesBody = z.object({
  categoryNames: z.array(z.string().min(1)),
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Invalid month"),
});
export type BudgetCategoriesBody = z.infer<typeof budgetCategoriesBody>;

export const transactionSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  category: z.string(),
  date: z.string(),
  amount: z.number(),
  theme: z.string(),
  avatar: z.string().nullable(),
  recurring: z.boolean(),
  recurringId: z.string().nullable(),
});
export type TransactionDto = z.infer<typeof transactionSchema>;

export const transactionPageSchema = z.object({
  transactions: z.array(transactionSchema),
  total: z.number().int(),
  page: z.number().int(),
});
export type TransactionPageDto = z.infer<typeof transactionPageSchema>;
