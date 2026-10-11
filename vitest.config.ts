import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const fromRoot = (path: string) =>
  fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": fromRoot("./src"),
      // `server-only` throws outside the react-server condition. Unit tests run server-side.
      "server-only": fromRoot("./node_modules/server-only/empty.js"),
    },
  },
  test: {
    include: ["tests/unit/**/*.test.ts"],
  },
});
