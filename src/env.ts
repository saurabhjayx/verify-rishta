import { z } from "zod";

const envSchema = z.object({
  SITE_URL: z
    .url()
    .default("https://verifyrishta.com")
    .transform((url) => url.replace(/\/+$/, "")),
  // Folder holding articles/*.mdx and redirects.json. Tests point it at
  // tests/fixtures/content. Articles are never stored in MongoDB.
  CONTENT_DIR: z.string().min(1).default("content"),
  // Optional: IndexNow is skipped when unset. Key file lives at public/<key>.txt.
  INDEXNOW_KEY: z
    .string()
    .regex(/^[a-zA-Z0-9-]{8,128}$/)
    .optional(),
  // GA4 Measurement ID (public, not a secret). Inlined at build time. The
  // script only runs on the SITE_URL host, so dev, previews and CI send no hits.
  NEXT_PUBLIC_GA_ID: z
    .string()
    .regex(/^G-[A-Z0-9]+$/)
    .default("G-BYTPHDP9PF"),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    throw new Error(
      `Invalid environment variables:\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}

export const env = parseEnv(process.env);
