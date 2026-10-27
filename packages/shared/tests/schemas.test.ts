import { describe, expect, it } from "vitest";
import {
  createBillBody,
  createBudgetBody,
  createPotBody,
  createTransactionBody,
  listTransactionsQuery,
  loginBody,
  money,
  potTransactionBody,
  resetPasswordBody,
  signupBody,
  updateSettingsBody,
} from "../src/index.js";

describe("money", () => {
  it("normalizes numbers and strings to exact 2-decimal strings", () => {
    expect(money.parse(5)).toBe("5.00");
    expect(money.parse("12.5")).toBe("12.50");
    expect(money.parse("-3.05")).toBe("-3.05");
    expect(money.parse("-0")).toBe("0.00");
  });

  it("rejects float noise, extra decimals and junk", () => {
    expect(money.safeParse(0.1 + 0.2).success).toBe(false);
    expect(money.safeParse("1.234").success).toBe(false);
    expect(money.safeParse("abc").success).toBe(false);
    expect(money.safeParse("12345678901").success).toBe(false);
  });
});

describe("auth", () => {
  it("lowercases email and enforces the password rules", () => {
    expect(signupBody.parse({ email: " A@B.com ", password: "Passw0rd#" }).email).toBe("a@b.com");
    expect(signupBody.safeParse({ email: "a@b.com", password: "weak" }).success).toBe(false);
  });

  it("login only requires a non-empty password", () => {
    expect(loginBody.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
    expect(loginBody.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });

  it("reset requires sid and a valid new password", () => {
    expect(resetPasswordBody.safeParse({ sid: "abc", newPassword: "Passw0rd#" }).success).toBe(true);
    expect(resetPasswordBody.safeParse({ newPassword: "Passw0rd#" }).success).toBe(false);
  });
});

describe("settings", () => {
  it("accepts exactly one setting", () => {
    expect(updateSettingsBody.safeParse({ font: "noto_serif" }).success).toBe(true);
    expect(updateSettingsBody.safeParse({}).success).toBe(false);
    expect(updateSettingsBody.safeParse({ pots: true, bills: false }).success).toBe(false);
  });

  it("only allows USD and CAD", () => {
    expect(updateSettingsBody.safeParse({ currency: "cad_dollar" }).success).toBe(true);
    expect(updateSettingsBody.safeParse({ currency: "euro" }).success).toBe(false);
  });
});

describe("budgets, pots and bills", () => {
  it("budget maximum must be positive", () => {
    expect(createBudgetBody.parse({ category: "Bills", maximum: "100", theme: "#fff" }).maximum).toBe("100.00");
    expect(createBudgetBody.safeParse({ category: "Bills", maximum: 0, theme: "#fff" }).success).toBe(false);
  });

  it("pot transactions need a type and positive amount", () => {
    expect(potTransactionBody.safeParse({ type: "add", amount: "5" }).success).toBe(true);
    expect(potTransactionBody.safeParse({ type: "steal", amount: "5" }).success).toBe(false);
    expect(createPotBody.safeParse({ name: "x".repeat(31), target: 5, theme: "t" }).success).toBe(false);
  });

  it("bill due date is a day of the month, accepted as a string", () => {
    const base = { name: "Rent", category: "Bills", amount: -1200, theme: "t" };
    expect(createBillBody.parse({ ...base, dueDate: "15" }).dueDate).toBe(15);
    expect(createBillBody.safeParse({ ...base, dueDate: "32" }).success).toBe(false);
  });
});

describe("transactions", () => {
  const base = { name: "Coffee", category: "Dining Out", date: "2026-01-05T00:00:00.000Z", amount: -4.5, theme: "t" };

  it("defaults recurring to false and parses the date", () => {
    const out = createTransactionBody.parse(base);
    expect(out.recurring).toBe(false);
    expect(out.date).toBeInstanceOf(Date);
    expect(out.amount).toBe("-4.50");
  });

  it("requires a due date only when creating a new recurring bill", () => {
    expect(createTransactionBody.safeParse({ ...base, recurring: true, recurringId: "new" }).success).toBe(false);
    expect(createTransactionBody.safeParse({ ...base, recurring: true, recurringId: "new", dueDate: "3" }).success).toBe(true);
    const existing = "3f2b7a52-6c0e-4c3e-9a57-1f5d4f6e8a10";
    expect(createTransactionBody.safeParse({ ...base, recurring: true, recurringId: existing }).success).toBe(true);
  });

  it("list query applies defaults and falls back on bad paging/sorting", () => {
    expect(listTransactionsQuery.parse({})).toEqual({
      page: 1,
      month: "All",
      searchName: "",
      category: "All Transactions",
      sortBy: "latest",
    });
    expect(listTransactionsQuery.parse({ page: "abc", sortBy: "nope" })).toMatchObject({ page: 1, sortBy: "latest" });
    expect(listTransactionsQuery.safeParse({ month: "DROP TABLE" }).success).toBe(false);
  });
});
