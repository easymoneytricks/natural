import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

function requireProductionUrl(env, key) {
  const value = String(env[key] || "").trim();
  if (
    !value ||
    !value.startsWith("https://") ||
    /localhost|127\.0\.0\.1|your-domain\.example/i.test(value)
  ) {
    throw new Error(
      `${key} must be a real HTTPS URL before creating a production Admin build.`,
    );
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  if (mode === "production") {
    requireProductionUrl(env, "VITE_API_BASE_URL");
    requireProductionUrl(env, "VITE_STOREFRONT_URL");
  }
  return { plugins: [react()] };
});
