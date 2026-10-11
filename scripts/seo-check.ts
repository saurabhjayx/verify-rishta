// Usage: pnpm seo:check <url ...>
// Fetches live or preview URLs and asserts metadata, canonical, one h1 and valid JSON-LD.
import { auditHtml } from "@/lib/seo/audit";

const urls = process.argv.slice(2);
if (urls.length === 0) {
  console.error("Usage: pnpm seo:check <url ...>");
  process.exit(1);
}

let failed = 0;
for (const url of urls) {
  const res = await fetch(url, { redirect: "manual" });
  const problems =
    res.status === 200
      ? auditHtml(await res.text(), new URL(url).pathname)
      : [`HTTP ${res.status}`];
  if (problems.length > 0) failed++;
  console.log(`${problems.length === 0 ? "PASS" : "FAIL"}  ${url}`);
  for (const problem of problems) console.log(`      ${problem}`);
}
process.exit(failed > 0 ? 1 : 0);
