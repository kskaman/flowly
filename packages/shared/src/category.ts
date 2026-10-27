import { z } from "zod";
import { idSchema, requiredString } from "./common.js";

export const categoryBody = z.object({ name: requiredString("Name", 50) });
export type CategoryBody = z.infer<typeof categoryBody>;

export const categorySchema = z.object({
  id: idSchema,
  name: z.string(),
  type: z.enum(["standard", "custom"]),
});
export type CategoryDto = z.infer<typeof categorySchema>;
