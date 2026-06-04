import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.ts",
  timeout: 60000,
  retries: 0,
  use: {
    baseURL: "http://localhost:5173",
    headless: true,
  },
  webServer: [
    {
      command: "cd ../server && npm run dev",
      port: 4000,
      timeout: 30000,
      reuseExistingServer: true,
    },
    {
      command: "cd ../client && npm run dev",
      port: 5173,
      timeout: 30000,
      reuseExistingServer: true,
    },
  ],
});
