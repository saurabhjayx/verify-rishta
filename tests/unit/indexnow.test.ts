import { readdir } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { indexNowPayload } from "@/lib/seo/indexnow";

describe("indexNowPayload", () => {
  it("points keyLocation at the public key file", () => {
    expect(
      indexNowPayload(
        ["https://verifyrishta.com/a"],
        "abc12345",
        "https://verifyrishta.com",
      ),
    ).toEqual({
      host: "verifyrishta.com",
      key: "abc12345",
      keyLocation: "https://verifyrishta.com/abc12345.txt",
      urlList: ["https://verifyrishta.com/a"],
    });
  });

  it("has a committed key file in public/", async () => {
    expect(
      (await readdir("public")).some((f) => /^[a-f0-9]{32}\.txt$/.test(f)),
    ).toBe(true);
  });
});
