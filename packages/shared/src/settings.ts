import { z } from "zod";

export const FONTS = ["public_sans", "noto_serif", "source_code"] as const;
export const CURRENCIES = ["us_dollar", "cad_dollar"] as const;

export const fontSchema = z.enum(FONTS);
export const currencySchema = z.enum(CURRENCIES);

export type Font = z.infer<typeof fontSchema>;
export type Currency = z.infer<typeof currencySchema>;

// The client updates one setting per request.
export const updateSettingsBody = z
  .object({
    font: fontSchema,
    currency: currencySchema,
    pots: z.boolean(),
    bills: z.boolean(),
    budgets: z.boolean(),
  })
  .partial()
  .refine((v) => Object.values(v).filter((x) => x !== undefined).length === 1, {
    message: "Provide exactly one setting to update.",
  });
export type UpdateSettingsBody = z.infer<typeof updateSettingsBody>;
