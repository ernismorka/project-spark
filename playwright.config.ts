import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: 1,
  expect: { timeout: 15000 },
  timeout: 60000,
  use: {
    baseURL: "http://127.0.0.1:4173",
    screenshot: "only-on-failure",
    trace: { mode: "retain-on-failure", screenshots: false, snapshots: false },
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: process.env.CI
          ? { args: ["--use-gl=angle", "--use-angle=swiftshader"] }
          : {},
      },
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        // GPU-less CI can reject WebGL2 during Firefox's first adapter probe.
        // Scope Mozilla's software-WebGL opt-in to this disposable CI profile.
        launchOptions: process.env.CI
          ? { firefoxUserPrefs: { "webgl.force-enabled": true } }
          : {},
      },
    },
  ],
  webServer: [
    {
      command: "pnpm dev:server",
      url: "http://127.0.0.1:2567/health",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "pnpm demo:start",
      url: "http://127.0.0.1:4173",
      reuseExistingServer: !process.env.CI,
    },
  ],
});
