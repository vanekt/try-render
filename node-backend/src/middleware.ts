import { FastifyRequest, FastifyReply } from "fastify";
import { JwtPayload } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import logger from "./logger.js";

export function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
  done: () => void
) {
  const authHeader = request.headers["authorization"];

  if (!authHeader) {
    logger.error("[authMiddleware] No Authorization header");
    reply.code(401).send();
    return;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    logger.error("[authMiddleware] Invalid Authorization header format");
    reply.code(401).send();
    return;
  }

  const accessToken = parts[1];
  const jwtSecret = process.env.SUPABASE_JWT_SECRET as string;
  try {
    request.user = jwt.verify(accessToken, jwtSecret) as JwtPayload;
    request.token = accessToken;
    done();
  } catch (err) {
    logger.error("[authMiddleware] Invalid or expired token");
    reply.code(401).send();
  }
}
