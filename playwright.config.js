import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  use: {
    baseURL: process.env.STOREFRONT_URL || "http://localhost:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.E2E_START_SERVER
    ? {
        command: "npm run dev:storefront",
        url: "http://localhost:5173",
        reuseExistingServer: true,
      }
    : undefined,
});
