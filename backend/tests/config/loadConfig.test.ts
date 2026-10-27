import { describe, expect, it } from "vitest";
import { ConfigError, getOrThrow, loadConfig } from "../../src/config/loadConfig.js";

const valid = {
  FRONTEND_URL: "http://localhost:5173",
  BACKEND_URL: "http://localhost:3000",
  DATABASE_URL: "postgresql://u:p@db:5432/flowly?schema=public",
  REDIS_URL: "redis://cache:6379",
  EMAIL_HOST: "mailpit",
  EMAIL_PORT: "1025",
  EMAIL_FROM: "no-reply@flowly.local",
  EMAIL_USER: "",
  EMAIL_PASS: "",
};

function issuesOf(fn: () => unknown): string {
  try {
    fn();
  } catch (e) {
    expect(e).toBeInstanceOf(ConfigError);
    return (e as ConfigError).issues.join("\n");
  }
  throw new Error("expected a ConfigError");
}

describe("getOrThrow", () => {
  it("returns the value, optionally parsed", () => {
    expect(getOrThrow({ A: "x" }, "A")).toBe("x");
  });

  it("throws when the variable is missing or empty", () => {
    expect(issuesOf(() => getOrThrow({}, "A"))).toContain("A: is required");
    expect(issuesOf(() => getOrThrow({ A: "" }, "A"))).toContain("A: is required");
  });
});

describe("loadConfig", () => {
  it("builds the config with defaults and coerced types", () => {
    const config = loadConfig({ ...valid, EMAIL_REQUIRE_TLS: "false" });
    expect(config.port).toBe(3000);
    expect(config.nodeEnv).toBe("development");
    expect(config.email.port).toBe(1025);
    expect(config.email.requireTls).toBe(false);
    expect(config.email.user).toBeUndefined();
  });

  it("reports every missing or invalid variable at once", () => {
    const issues = issuesOf(() => loadConfig({ ...valid, DATABASE_URL: "mysql://x", REDIS_URL: undefined }));
    expect(issues).toContain("DATABASE_URL");
    expect(issues).toContain("REDIS_URL");
  });

  it("requires a sender address", () => {
    expect(issuesOf(() => loadConfig({ ...valid, EMAIL_FROM: undefined }))).toContain("EMAIL_FROM");
  });

  it("requires a password when EMAIL_USER is set", () => {
    expect(issuesOf(() => loadConfig({ ...valid, EMAIL_USER: "me@example.com" }))).toContain("EMAIL_PASS");
  });
});
