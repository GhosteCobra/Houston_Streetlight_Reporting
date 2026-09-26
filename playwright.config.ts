import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/e2e",
  testMatch: "**/*.spec.ts",
  timeout: 60000,
  fullyParallel: false,
  // Camera tests stop their streams when a page loses visibility.
  workers: 1,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    viewport: { width: 390, height: 844 },
    trace: "retain-on-failure",
    launchOptions: { chromiumSandbox: true },
  },
  reporter: [["list"], ["html", { open: "never" }]],
});
