import "dotenv/config.js";
import { JwtPayload } from "@supabase/supabase-js";
import logger from "./logger.js";
import supabase from "./supabase.js";

type PingPayload = {
  data: string;
};

type ProtectedUserPayload = {
  user_id: string;
  data: JwtPayload;
};

function createPublicWorker() {
  const channel = supabase.realtime.channel("public");

  channel.on("broadcast", { event: "ping" }, (payload) => {
    processPingEvent(payload.payload as PingPayload);
  });

  return channel;
}

function createProtectedWorker() {
  const channel = supabase.realtime.channel("protected");

  channel.on("broadcast", { event: "user" }, (payload) => {
    processProtectedUserEvent(payload.payload as ProtectedUserPayload);
  });

  return channel;
}

function processPingEvent(payload: PingPayload) {
  logger.info(payload.data);
}

function processProtectedUserEvent(payload: ProtectedUserPayload) {
  logger.info(
    `Message from: ${payload.user_id}, data: ${JSON.stringify(payload.data)}`
  );
}

async function startWorker() {
  try {
    const publicWorker = createPublicWorker();
    const protectedWorker = createProtectedWorker();

    await Promise.all([
      publicWorker.subscribe((status) => {
        logger.info(`Public worker status: ${status}`);
      }),
      protectedWorker.subscribe((status) => {
        logger.info(`Protected worker status: ${status}`);
      }),
    ]);

    process.on("SIGINT", async () => {
      logger.info("SIGINT...");

      await Promise.all([
        supabase.realtime.removeChannel(publicWorker),
        supabase.realtime.removeChannel(protectedWorker),
      ]);

      logger.info("Worker stopped");
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      logger.info("SIGTERM...");

      await Promise.all([
        supabase.realtime.removeChannel(publicWorker),
        supabase.realtime.removeChannel(protectedWorker),
      ]);

      logger.info("Worker stopped");
      process.exit(0);
    });
  } catch (error) {
    logger.error({ error }, "Worker error");
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startWorker();
}

export { startWorker };
