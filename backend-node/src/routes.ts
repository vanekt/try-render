import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest,
  FastifyReply,
} from "fastify";
import supabase from "./supabase.js";
import logger from "./logger.js";

const bucketName = process.env.SUPABASE_BUCKET_NAME as string;
const expiresIn = 60 * 60;

type File = {
  name: string;
  url: string;
  path: string;
};

type UploadRequest = {
  message: string;
  files: File[];
};

async function registerRoutes(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
) {
  fastify.get("/ping", async (request: FastifyRequest, reply: FastifyReply) => {
    reply.send({ result: "pong" });
  });

  fastify.post(
    "/upload",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { message, files } = request.body as UploadRequest;
        if (!Array.isArray(files)) {
          return reply.code(400).send({ error: "invalid request" });
        }
        const resultFiles = await Promise.all(
          files.map(async (file) => {
            const { data, error } = await supabase.storage
              .from(bucketName)
              .createSignedUrl(file.path, expiresIn);
            return {
              name: file.name,
              path: file.path,
              url: data?.signedUrl || "",
            };
          })
        );
        reply.send({ success: true, files: resultFiles });
      } catch (err) {
        logger.error({ err }, "panic in supabase lib");
        reply.code(500).send({ error: "internal error" });
      }
    }
  );

  fastify.get(
    "/protected",
    { preHandler: fastify.auth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      reply.send({ user_data: request.user });
    }
  );
}

export default registerRoutes;
