import { readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";

// <content>/redirects.json, applied by next.config `redirects()` at the routing
// layer. Add an entry whenever a published URL changes (slug or category).
const redirectsSchema = z.array(
  z
    .object({
      from: z
        .string()
        .regex(/^\/[a-z0-9/-]*$/, "must be a lowercase site path"),
      to: z.string().regex(/^\/[a-z0-9/-]*$/, "must be a lowercase site path"),
      /** true = 308 (default, Google treats it like 301), false = 307. */
      permanent: z.boolean().default(true),
    })
    .strict(),
);

export function readRedirects(contentDir: string) {
  const file = path.resolve(contentDir, "redirects.json");
  const entries = redirectsSchema.parse(JSON.parse(readFileSync(file, "utf8")));
  return entries.map((r) => ({
    source: r.from,
    destination: r.to,
    permanent: r.permanent,
  }));
}
