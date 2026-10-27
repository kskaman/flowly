import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

// Column names are snake_case in the database (see `casing` in db/index.ts and drizzle.config.ts).

const id = () => uuid().primaryKey().defaultRandom();
const timestamptz = () => timestamp({ withTimezone: true });
// numeric(12,2) is returned as a string by the driver, which keeps money exact.
const money = () => numeric({ precision: 12, scale: 2 });

export const fontEnum = pgEnum("font", [
  "public_sans",
  "noto_serif",
  "source_code",
]);

// Matches the currencies Plaid supports for US/Canada.
export const currencyEnum = pgEnum("currency", ["us_dollar", "cad_dollar"]);

export const categoryTypeEnum = pgEnum("category_type", ["standard", "custom"]);

export const users = pgTable("users", {
  id: id(),
  name: text(),
  email: text().notNull().unique(),
  password: text().notNull(),
  isVerified: boolean().notNull().default(false),
  verificationToken: text(),
  verificationTokenExpiry: timestamptz(),
  resetToken: text(),
  resetTokenExpiry: timestamptz(),
  createdAt: timestamptz().notNull().defaultNow(),
  updatedAt: timestamptz()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const settings = pgTable("settings", {
  id: id(),
  userId: uuid()
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  font: fontEnum().notNull(),
  currency: currencyEnum().notNull(),
  pots: boolean().notNull(),
  bills: boolean().notNull(),
  budgets: boolean().notNull(),
});

export const balances = pgTable("balances", {
  id: id(),
  userId: uuid()
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  current: money().notNull(),
  income: money().notNull(),
  expenses: money().notNull(),
});

// Standard categories have a null creatorId; custom ones belong to the creating user.
export const categoryDefinitions = pgTable(
  "category_definitions",
  {
    id: id(),
    name: text().notNull().unique(),
    type: categoryTypeEnum().notNull(),
    creatorId: uuid().references(() => users.id, { onDelete: "set null" }),
  },
  (t) => [index("category_definitions_creator_id_idx").on(t.creatorId)],
);

export const recurringBills = pgTable(
  "recurring_bills",
  {
    id: id(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    categoryDefinitionId: uuid().references(() => categoryDefinitions.id),
    name: text().notNull(),
    amount: money().notNull(),
    lastPaid: timestamptz(),
    // Day of the month (1-31).
    dueDate: integer().notNull(),
    theme: text().notNull(),
  },
  (t) => [
    index("recurring_bills_user_id_idx").on(t.userId),
    check("recurring_bills_due_date_range", sql`${t.dueDate} between 1 and 31`),
  ],
);

export const transactions = pgTable(
  "transactions",
  {
    id: id(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    categoryDefinitionId: uuid()
      .notNull()
      .references(() => categoryDefinitions.id),
    recurringId: uuid().references(() => recurringBills.id, {
      onDelete: "set null",
    }),
    avatar: text(),
    name: text().notNull(),
    date: timestamptz().notNull(),
    theme: text().notNull(),
    amount: money().notNull(),
    recurring: boolean().notNull(),
  },
  (t) => [
    index("transactions_user_id_date_idx").on(t.userId, t.date),
    index("transactions_recurring_id_idx").on(t.recurringId),
  ],
);

export const budgets = pgTable(
  "budgets",
  {
    id: id(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    categoryDefinitionId: uuid()
      .notNull()
      .references(() => categoryDefinitions.id),
    maximum: money().notNull(),
    theme: text().notNull(),
  },
  (t) => [index("budgets_user_id_idx").on(t.userId)],
);

export const pots = pgTable(
  "pots",
  {
    id: id(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text().notNull(),
    target: money().notNull(),
    total: money().notNull(),
    theme: text().notNull(),
  },
  (t) => [unique("pots_user_id_name_unique").on(t.userId, t.name)],
);
