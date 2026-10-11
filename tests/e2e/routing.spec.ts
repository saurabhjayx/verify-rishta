import http from "node:http";
import { expect, test } from "@playwright/test";

const REDIRECTS: [from: string, status: number, to: string][] = [
  ["/About", 301, "/about"],
  [
    "/Matrimonial-Fraud/draft-red-flags-in-a-biodata",
    301,
    "/matrimonial-fraud/draft-red-flags-in-a-biodata",
  ],
  ["/about/", 308, "/about"],
  ["/old-sample-url", 308, "/matrimonial-fraud/draft-red-flags-in-a-biodata"], // stored in `redirects`
  [
    "/for-parents/draft-red-flags-in-a-biodata",
    308,
    "/matrimonial-fraud/draft-red-flags-in-a-biodata",
  ], // wrong cluster
];

for (const [from, status, to] of REDIRECTS) {
  test(`${from} -> ${status} ${to}`, async ({ request }) => {
    const res = await request.get(from, { maxRedirects: 0 });
    expect(res.status()).toBe(status);
    // Next 16.4 repeats an identical Location header on the first uncached render
    // of a page redirect. Browsers accept identical duplicates; assert all match.
    const locations = res
      .headersArray()
      .filter((h) => h.name.toLowerCase() === "location");
    expect(locations.length).toBeGreaterThan(0);
    for (const { value } of locations)
      expect(new URL(value, "http://x").pathname).toBe(to);
  });
}

// Playwright and fetch cannot override Host, so use node:http.
test("www host redirects to the SITE_URL origin", async ({ baseURL }) => {
  const site = new URL(process.env.SITE_URL ?? "https://verifyrishta.com");
  const { status, location } = await new Promise<{
    status?: number;
    location?: string;
  }>((resolve, reject) => {
    http
      .get(
        `${baseURL}/About`,
        { headers: { host: `www.${site.host}` } },
        (res) => {
          res.resume();
          resolve({ status: res.statusCode, location: res.headers.location });
        },
      )
      .on("error", reject);
  });
  expect(status).toBe(301);
  expect(location).toBe(`${site.origin}/about`);
});

test("security headers are set", async ({ request }) => {
  const headers = (await request.get("/")).headers();
  expect(headers["content-security-policy"]).toContain("default-src 'self'");
  expect(headers["strict-transport-security"]).toContain("max-age=");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["permissions-policy"]).toContain("camera=()");
  expect(headers["x-powered-by"]).toBeUndefined();
});

// Misses must get the full static 404 page, not an empty shell drawn by JavaScript.
for (const path of [
  "/no-such-topic",
  "/matrimonial-fraud/no-such-article",
  "/authors/nobody",
  "/a/b/c",
]) {
  test(`${path} -> 404 with the page in raw HTML`, async ({ request }) => {
    const res = await request.get(path);
    expect(res.status()).toBe(404);
    expect(await res.text()).toContain("We could not find that page");
  });
}

test("llms files are kept out of search indexes", async ({ request }) => {
  for (const path of ["/llms.txt", "/llms-full.txt"])
    expect((await request.get(path)).headers()["x-robots-tag"]).toBe("noindex");
});
