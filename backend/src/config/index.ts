import "dotenv/config";
import { ConfigError, loadConfig, type Config } from "./loadConfig.js";

function load(): Config {
  try {
    return loadConfig(process.env);
  } catch (err) {
    if (err instanceof ConfigError) {
      console.error(
        `${err.message}\nEnvironment Configuration Error: values are missing or invalid.`,
      );
      process.exit(1);
    }
    throw err;
  }
}

export const config = load();
