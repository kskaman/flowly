import { createClient } from "redis";
import { config } from "./config/index.js";

const MAX_RETRIES = 7;

const client = createClient({
  url: config.redisUrl,
  socket: {
    connectTimeout: 10000,
    // Exit instead of retrying forever so Docker/ECS can restart the container.
    reconnectStrategy: (retries) => {
      if (retries >= MAX_RETRIES) {
        console.error(`Redis unreachable after ${MAX_RETRIES} attempts, exiting`);
        process.exit(1);
      }
      const delay = Math.min(2 ** retries * 200, 3000);
      console.warn(`Redis retry ${retries + 1}/${MAX_RETRIES} in ${delay} ms`);
      return delay;
    },
  },
});

client.on("error", (err: NodeJS.ErrnoException) =>
  console.error("Redis error:", err.code ?? err.message)
);
client.on("ready", () => console.log("Redis connected"));

void client.connect().catch(() => {
  // Failures are handled by the reconnect strategy above.
});

export default client;
