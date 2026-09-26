import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/e2e",
  testMatch: "**/*.spec.ts",
  timeout: 60000,
  fullyParallel: false,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    viewport: { width: 390, height: 844 },
    trace: "retain-on-failure",
  },
  reporter: [["list"], ["html", { open: "never" }]],
});
