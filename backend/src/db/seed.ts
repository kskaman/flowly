import "dotenv/config";
import { createDb, schema } from "./index.js";

const standardCategories = [
  "General",
  "Dining Out",
  "Groceries",
  "Entertainment",
  "Transportation",
  "Lifestyle",
  "Personal Care",
  "Education",
  "Bills",
  "Shopping",
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  const db = createDb(url);
  try {
    await db
      .insert(schema.categoryDefinitions)
      .values(standardCategories.map((name) => ({ name, type: "standard" as const })))
      .onConflictDoNothing({ target: schema.categoryDefinitions.name });
  } finally {
    await db.$client.end();
  }
}

main().catch((e) => {
  console.error("Seed error:", e);
  process.exit(1);
});
