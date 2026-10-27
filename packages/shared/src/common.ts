import { z } from "zod";

// Matches numeric(12,2): up to 10 integer digits and 2 decimals.
const MONEY_PATTERN = /^-?\d{1,10}(\.\d{1,2})?$/;

function normalizeMoney(value: string): string {
  const [whole = "0", fraction = ""] = value.split(".");
  const normalized = `${whole}.${fraction.padEnd(2, "0")}`;
  return normalized === "-0.00" ? "0.00" : normalized;
}

// Accepts a number or numeric string; yields an exact "123.45" string (never a float).
export const money = z
  .union([z.string(), z.number()])
  .transform((v) => String(v).trim())
  .pipe(z.string().regex(MONEY_PATTERN, "Enter a valid amount (up to 2 decimals)"))
  .transform(normalizeMoney);

export const positiveMoney = money.refine((v) => Number(v) > 0, "Amount must be positive");

export const requiredString = (label: string, max = 100) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be at most ${max} characters`);

export const idSchema = z.uuid("Invalid id");

export const idParams = z.object({ id: idSchema });

// Day of the month a bill is due; the client sends it as a string.
export const dueDay = z.coerce
  .number({ error: "Due date must be a number" })
  .int("Due date must be a whole number")
  .min(1, "Due date must be between 1 and 31")
  .max(31, "Due date must be between 1 and 31");

export const emailSchema = z
  .string({ error: "Email is required" })
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email"));

// A new password: 8-20 chars with lower, upper, digit and one of # @ _
export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#@_])[A-Za-z\d#@_]{8,20}$/;

export const newPasswordSchema = z
  .string({ error: "Password is required" })
  .regex(
    PASSWORD_PATTERN,
    "Password must be 8-20 characters long, include at least one uppercase letter, one lowercase letter, one digit, and one of the special characters: #, @, or _",
  );
