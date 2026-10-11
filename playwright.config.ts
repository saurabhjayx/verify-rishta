import { existsSync } from "node:fs";
import { defineConfig } from "@playwright/test";

// Local runs read optional settings from .env.local; CI passes env vars.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
// e2e runs against the test fixtures, never real articles. Build first with
// `pnpm build:fixtures` (CI sets CONTENT_DIR for the whole job).
process.env.CONTENT_DIR ??= "tests/fixtures/content";

const PORT = 3000;

// Tests use the `request` fixture: raw server HTML, no JavaScript, no browser download.
export default defineConfig({
  testDir: "tests/e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: `http://localhost:${PORT}` },
  webServer: {
    command: "pnpm start",
    port: PORT,
    reuseExistingServer: !process.env.CI,
    env: { CONTENT_DIR: process.env.CONTENT_DIR },
  },
});
