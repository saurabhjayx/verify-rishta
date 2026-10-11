import { readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { STATIC_SEGMENTS, canonicalRedirect, isKnownMiss } from "@/proxy";

const SITE = "https://verifyrishta.com";
const redirect = (host: string, path: string, search = "") =>
  canonicalRedirect(host, path, search, SITE);

describe("canonicalRedirect", () => {
  it("leaves canonical requests alone", () => {
    expect(
      redirect("verifyrishta.com", "/matrimonial-fraud/red-flags"),
    ).toBeNull();
    expect(redirect("verifyrishta.com", "/")).toBeNull();
    expect(redirect("localhost:3000", "/about")).toBeNull();
  });

  it("sends www to the SITE_URL origin, whatever port the server listens on", () => {
    expect(redirect("www.verifyrishta.com", "/about", "?utm_source=x")).toBe(
      "https://verifyrishta.com/about?utm_source=x",
    );
  });

  it("lowercases the path but not the query", () => {
    expect(redirect("verifyrishta.com", "/Matrimonial-Fraud", "?Q=A")).toBe(
      "/matrimonial-fraud?Q=A",
    );
  });

  it("ignores other hosts, so a spoofed Host header is never echoed", () => {
    expect(redirect("www.evil.com", "/about")).toBeNull();
  });

  it("does both in one hop", () => {
    expect(redirect("www.verifyrishta.com", "/About")).toBe(
      "https://verifyrishta.com/about",
    );
  });
});

describe("isKnownMiss", () => {
  const articles = new Set(["hidden-red-flags-before-marriage"]);
  const miss = (path: string) => isKnownMiss(path, articles);

  it("passes every real page", () => {
    for (const path of [
      "/",
      "/blog",
      "/about",
      "/matrimonial-fraud",
      "/nri-marriages",
      "/matrimonial-fraud/hidden-red-flags-before-marriage",
      "/authors/verify-rishta-editorial-team",
      "/opengraph-image",
      "/matrimonial-fraud/hidden-red-flags-before-marriage/opengraph-image",
    ])
      expect(miss(path), path).toBe(false);
  });

  it("passes a real article under the wrong topic, so the page can redirect it", () => {
    expect(miss("/for-parents/hidden-red-flags-before-marriage")).toBe(false);
  });

  it("flags unknown topics, articles and authors", () => {
    expect(miss("/no-such-page")).toBe(true);
    expect(miss("/matrimonial-fraud/no-such-article")).toBe(true);
    expect(miss("/about/x")).toBe(true);
    expect(miss("/authors/nobody")).toBe(true);
  });

  it("knows every top-level static route in src/app", () => {
    // Plain folders (not [dynamic], not file routes like feed.xml) plus opengraph-image.
    const routes = readdirSync("src/app", { withFileTypes: true })
      .filter(
        (e) =>
          e.isDirectory() && !e.name.startsWith("[") && !e.name.includes("."),
      )
      .map((e) => e.name);
    expect([...STATIC_SEGMENTS].sort()).toEqual(
      [...routes, "opengraph-image"].sort(),
    );
  });
});
