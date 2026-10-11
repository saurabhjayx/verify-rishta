import { describe, expect, it } from "vitest";
import { parseEnv } from "@/env";

describe("parseEnv", () => {
  it("applies defaults and strips the trailing slash from SITE_URL", () => {
    const env = parseEnv({ SITE_URL: "https://a.com/" });
    expect(env.SITE_URL).toBe("https://a.com");
    expect(env.CONTENT_DIR).toBe("content");
  });

  it("rejects malformed optional values", () => {
    expect(() => parseEnv({ NEXT_PUBLIC_GA_ID: "UA-123" })).toThrow(
      /NEXT_PUBLIC_GA_ID/,
    );
    expect(() => parseEnv({ SITE_URL: "not a url" })).toThrow(/SITE_URL/);
  });
});
