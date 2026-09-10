import { createApp } from "./app.js";
import { checkDatabase, pool } from "./config/database.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

const app = createApp();

async function start() {
  try {
    await checkDatabase();
    const server = app.listen(env.port, "0.0.0.0", () => {
      logger.info(`Natural Beauty API running on port ${env.port}`);
      logger.info("Database connection active");
      logger.info(`Environment: ${env.nodeEnv}`);
    });
    const shutdown = async (signal) => {
      logger.info(`Received ${signal}; shutting down gracefully`);
      server.close(async () => {
        await pool.end();
        process.exit(0);
      });
    };
    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    logger.error(`Database connection failed: ${error.message}`);
    await pool.end();
    process.exitCode = 1;
  }
}

start();
