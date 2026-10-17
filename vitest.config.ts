import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: [
      "packages/**/*.test.ts",
      "apps/server/src/**/*.test.ts",
      "apps/web/src/game/**/*.test.ts",
    ],
    environment: "node",
  },
});
