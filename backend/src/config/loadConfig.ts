import { z } from "zod";

type Source = Record<string, string | undefined>;

export class ConfigError extends Error {
  constructor(readonly issues: string[]) {
    super(`Invalid configuration:\n${issues.map((i) => `  - ${i}`).join("\n")}`);
    this.name = "ConfigError";
  }
}

const text = z.string().min(1);
const port = z.coerce
  .number({ error: "must be a port number (1-65535)" })
  .int("must be a port number (1-65535)")
  .min(1, "must be a port number (1-65535)")
  .max(65535, "must be a port number (1-65535)");
const nodeEnv = z.enum(["development", "test", "production"]);
const boolean = z.enum(["true", "false"]).transform((v) => v === "true");
const postgresUrl = z.url({ protocol: /^postgres(ql)?$/ });
const redisUrl = z.url({ protocol: /^rediss?$/ });

function parse<S extends z.ZodType>(key: string, raw: string, schema: S): z.output<S> {
  const result = schema.safeParse(raw);
  if (!result.success) throw new ConfigError([`${key}: ${result.error.issues[0]?.message ?? "invalid value"}`]);
  return result.data;
}

const isMissing = (raw: string | undefined): raw is undefined | "" => raw === undefined || raw === "";

export function getOrThrow(source: Source, key: string): string;
export function getOrThrow<S extends z.ZodType>(source: Source, key: string, schema: S): z.output<S>;
export function getOrThrow(source: Source, key: string, schema: z.ZodType = text): unknown {
  const raw = source[key];
  if (isMissing(raw)) throw new ConfigError([`${key}: is required but not set`]);
  return parse(key, raw, schema);
}

export function getOptional<S extends z.ZodType>(source: Source, key: string, schema: S): z.output<S> | undefined {
  const raw = source[key];
  return isMissing(raw) ? undefined : parse(key, raw, schema);
}

export interface Config {
  nodeEnv: z.infer<typeof nodeEnv>;
  port: number;
  frontendUrl: string;
  backendUrl: string;
  databaseUrl: string;
  redisUrl: string;
  email: {
    host: string;
    port: number;
    requireTls: boolean;
    from: string | undefined;
    user: string | undefined;
    pass: string | undefined;
  };
}

// Reads every field and reports all problems at once instead of stopping at the first.
export function loadConfig(source: Source): Config {
  const issues: string[] = [];
  const read = <T>(fn: () => T): T => {
    try {
      return fn();
    } catch (err) {
      if (!(err instanceof ConfigError)) throw err;
      issues.push(...err.issues);
      return undefined as T;
    }
  };

  const config: Config = {
    nodeEnv: read(() => getOptional(source, "NODE_ENV", nodeEnv) ?? "development"),
    port: read(() => getOptional(source, "PORT", port) ?? 3000),
    frontendUrl: read(() => getOrThrow(source, "FRONTEND_URL", z.url())),
    backendUrl: read(() => getOrThrow(source, "BACKEND_URL", z.url())),
    databaseUrl: read(() => getOrThrow(source, "DATABASE_URL", postgresUrl)),
    redisUrl: read(() => getOrThrow(source, "REDIS_URL", redisUrl)),
    email: {
      host: read(() => getOrThrow(source, "EMAIL_HOST")),
      port: read(() => getOrThrow(source, "EMAIL_PORT", port)),
      requireTls: read(() => getOptional(source, "EMAIL_REQUIRE_TLS", boolean) ?? true),
      from: read(() => getOptional(source, "EMAIL_FROM", text)),
      user: read(() => getOptional(source, "EMAIL_USER", text)),
      pass: read(() => getOptional(source, "EMAIL_PASS", text)),
    },
  };

  if (!config.email.from && !config.email.user) issues.push("EMAIL_FROM: set EMAIL_FROM or EMAIL_USER");
  if (config.email.user && !config.email.pass) issues.push("EMAIL_PASS: required when EMAIL_USER is set");

  if (issues.length > 0) throw new ConfigError(issues);
  return config;
}
