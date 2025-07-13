import "dotenv/config.js";
import Fastify from "fastify";
import cors from "@fastify/cors";
import logger from "./logger.js";
import registerRoutes from "./routes.js";
import { authMiddleware } from "./middleware.js";

const fastify = Fastify({ logger: true });

fastify.register(cors, {
  origin: process.env.ALLOWED_ORIGIN || false,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Origin", "Content-Type", "Authorization"],
  maxAge: 12 * 60 * 60,
});

fastify.decorate("auth", authMiddleware);
fastify.register(registerRoutes);

fastify.listen(
  {
    port: Number(process.env.PORT),
  },
  (err, address) => {
    if (err) {
      logger.error("Failed to start server:", err);
      process.exit(1);
    }
    logger.info(`🚀 Server starting on ${address}`);
  }
);
