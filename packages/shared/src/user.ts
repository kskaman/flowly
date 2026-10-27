import { z } from "zod";
import { newPasswordSchema, requiredString } from "./common.js";
import { currencySchema, fontSchema } from "./settings.js";

export const updateNameBody = z.object({ name: requiredString("Name") });
export type UpdateNameBody = z.infer<typeof updateNameBody>;

export const changePasswordBody = z.object({ newPassword: newPasswordSchema });
export type ChangePasswordBody = z.infer<typeof changePasswordBody>;

export const userSchema = z.object({
  id: z.uuid(),
  name: z.string().nullable(),
  email: z.string(),
  isVerified: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  settings: z
    .object({
      font: fontSchema,
      currency: currencySchema,
      pots: z.boolean(),
      bills: z.boolean(),
      budgets: z.boolean(),
    })
    .nullable(),
});
export type UserDto = z.infer<typeof userSchema>;
