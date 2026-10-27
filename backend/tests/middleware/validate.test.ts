import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { validate } from "../../src/middleware/validate.js";

const app = express();
app.use(express.json());

app.post(
  "/items/:id",
  validate({
    params: z.object({ id: z.uuid() }),
    query: z.object({ page: z.coerce.number().int().min(1).default(1) }),
    body: z.object({ name: z.string().trim().min(1, "Name is required") }),
  }),
  (req, res) => {
    res.json({ params: req.params, query: req.query, body: req.body });
  },
);

const id = "3f2b7a52-6c0e-4c3e-9a57-1f5d4f6e8a10";

describe("validate", () => {
  it("passes parsed values to the handler", async () => {
    const res = await request(app).post(`/items/${id}?page=2`).send({ name: "  Rent " });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ params: { id }, query: { page: 2 }, body: { name: "Rent" } });
  });

  it("returns 400 with a message and all errors", async () => {
    const res = await request(app).post("/items/nope?page=0").send({ name: "" });
    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveLength(3);
    expect(res.body.message).toBe(res.body.errors[0].message);
  });

  it("rejects a missing body", async () => {
    const res = await request(app).post(`/items/${id}`);
    expect(res.status).toBe(400);
  });
});
