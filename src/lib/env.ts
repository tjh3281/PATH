import "server-only";

import { z } from "zod";

const serverEnvSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is missing. Copy .env.example to .env.local."),
  GEMINI_MODEL: z.string().min(1).default("gemini-2.5-flash"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | undefined;

// Validated lazily so `next build` succeeds without secrets; errors surface on first use.
export function getServerEnv(): ServerEnv {
  cached ??= serverEnvSchema.parse({
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL || undefined,
  });
  return cached;
}
