import { z } from "zod";
import { emailSchema, newPasswordSchema } from "./common.js";

export const signupBody = z.object({ email: emailSchema, password: newPasswordSchema });
export type SignupBody = z.infer<typeof signupBody>;

export const loginBody = z.object({
  email: emailSchema,
  password: z.string({ error: "Password is required" }).min(1, "Password is required"),
});
export type LoginBody = z.infer<typeof loginBody>;

export const emailBody = z.object({ email: emailSchema });
export type EmailBody = z.infer<typeof emailBody>;

export const tokenQuery = z.object({
  t: z.string({ error: "Token is required" }).min(1, "Token is required"),
});
export type TokenQuery = z.infer<typeof tokenQuery>;

export const resetPasswordBody = z.object({
  sid: z.string({ error: "Missing reset session." }).min(1, "Missing reset session."),
  newPassword: newPasswordSchema,
});
export type ResetPasswordBody = z.infer<typeof resetPasswordBody>;
