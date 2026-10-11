import { readdirSync } from "node:fs";
import { expect, test } from "@playwright/test";

test("sitemap.xml is valid and lists only indexable URLs", async ({
  request,
}) => {
  const res = await request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  const xml = await res.text();
  expect(xml).toContain("<urlset");
  expect(xml).not.toContain("<priority>");
  expect(xml).not.toContain("draft-red-flags-in-a-biodata"); // fixtures are noindex
  // Header and footer pages are listed; external links never are.
  for (const path of [
    "/about",
    "/editorial-policy",
    "/disclosure",
    "/privacy",
    "/terms",
  ])
    expect(xml).toContain(`${path}</loc>`);
  expect(xml).not.toContain("indiacode.gov.in");
});

test("robots.txt allows AI crawlers, blocks /api/, references the sitemap", async ({
  request,
}) => {
  const text = await (await request.get("/robots.txt")).text();
  for (const agent of [
    "GPTBot",
    "ClaudeBot",
    "PerplexityBot",
    "Google-Extended",
    "CCBot",
  ]) {
    expect(text).toContain(`User-Agent: ${agent}`);
  }
  expect(text).toContain("Disallow: /api/");
  expect(text).toMatch(/Sitemap: https?:\/\/[^\s]+\/sitemap\.xml/);
  expect(text).not.toMatch(/Disallow: .*\?/);
});

test("feed.xml is RSS 2.0", async ({ request }) => {
  const res = await request.get("/feed.xml");
  expect(res.headers()["content-type"]).toContain("application/rss+xml");
  const xml = await res.text();
  expect(xml).toMatch(
    /^<\?xml version="1.0" encoding="UTF-8"\?>\s*<rss version="2.0"/,
  );
});

test("llms.txt and llms-full.txt are served as text", async ({ request }) => {
  const llms = await request.get("/llms.txt");
  expect(llms.headers()["content-type"]).toContain("text/plain");
  expect(await llms.text()).toMatch(/^# VerifyRishta\n/);
  expect((await request.get("/llms-full.txt")).status()).toBe(200);
});

test("OG images render as PNG", async ({ request }) => {
  for (const path of [
    "/opengraph-image",
    "/matrimonial-fraud/draft-red-flags-in-a-biodata/opengraph-image",
  ]) {
    const res = await request.get(path);
    expect(res.status(), path).toBe(200);
    expect(res.headers()["content-type"]).toBe("image/png");
  }
});

test("IndexNow key file is served", async ({ request }) => {
  const keyFile = readdirSync("public").find((f) =>
    /^[a-f0-9]{32}\.txt$/.test(f),
  );
  expect(keyFile).toBeDefined();
  const res = await request.get(`/${keyFile}`);
  expect(res.status()).toBe(200);
  expect(await res.text()).toBe(keyFile?.replace(".txt", ""));
});

test("web app manifest, favicons and icons are served", async ({ request }) => {
  const manifest = await (await request.get("/manifest.webmanifest")).json();
  expect(manifest).toMatchObject({
    short_name: "VerifyRishta",
    start_url: "/",
    display: "standalone",
    lang: "en-IN",
  });
  expect(
    manifest.icons.some((i: { purpose?: string }) => i.purpose === "maskable"),
  ).toBe(true);
  for (const path of [
    ...manifest.icons.map((i: { src: string }) => i.src),
    "/favicon.ico",
    "/icon.png",
    "/apple-icon.png",
  ]) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
  const html = await (await request.get("/")).text();
  expect(html).toContain('<link rel="manifest" href="/manifest.webmanifest"/>');
  expect(html).toMatch(/<img[^>]+brand-mark[^>]+\.webp/);
});
