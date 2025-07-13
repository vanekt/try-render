import "fastify";
import { FastifyRequest, FastifyReply } from "fastify";
import { JwtPayload } from "@supabase/supabase-js";

export type AuthMiddleware = (
  request: FastifyRequest,
  reply: FastifyReply,
  done: () => void
) => void;

declare module "fastify" {
  interface FastifyInstance {
    auth: AuthMiddleware;
  }
  interface FastifyRequest {
    user?: JwtPayload;
    token?: string;
  }
}
