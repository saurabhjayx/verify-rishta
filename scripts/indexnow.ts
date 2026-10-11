// Usage: pnpm indexnow <url ...>   Manually submit URLs to IndexNow (Bing, Yandex).
// Run after a deploy that publishes or changes articles.
import { env } from "@/env";
import { pingIndexNow } from "@/lib/seo/indexnow";

const urls = process.argv.slice(2);
if (!env.INDEXNOW_KEY || urls.length === 0) {
  console.error(
    "Usage: pnpm indexnow <url ...>  (needs INDEXNOW_KEY and public/<key>.txt)",
  );
  process.exit(1);
}
await pingIndexNow(urls, env.INDEXNOW_KEY, env.SITE_URL);
console.log(`IndexNow: submitted ${urls.length} URL(s).`);
