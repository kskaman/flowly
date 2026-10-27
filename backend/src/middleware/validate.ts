import type { RequestHandler } from "express";
import type { z } from "zod";

type Part = "params" | "query" | "body";
type Schemas = Partial<Record<Part, z.ZodType>>;

const PARTS: Part[] = ["params", "query", "body"];

// Replaces req.params/query/body with the parsed values; use at route level so params are populated.
export function validate(schemas: Schemas): RequestHandler {
  return (req, res, next) => {
    const errors: { location: Part; path: string; message: string }[] = [];
    const parsed: Partial<Record<Part, unknown>> = {};

    for (const part of PARTS) {
      const schema = schemas[part];
      if (!schema) continue;
      const result = schema.safeParse(req[part]);
      if (result.success) {
        parsed[part] = result.data;
      } else {
        for (const issue of result.error.issues) {
          errors.push({ location: part, path: issue.path.join("."), message: issue.message });
        }
      }
    }

    const first = errors[0];
    if (first) {
      // `message` is what the frontend already reads from error responses.
      res.status(400).json({ message: first.message, errors });
      return;
    }

    for (const part of PARTS) {
      if (!(part in parsed)) continue;
      // req.query is a getter-only property in Express 5.
      Object.defineProperty(req, part, {
        value: parsed[part],
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }
    next();
  };
}
