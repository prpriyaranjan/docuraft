import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.tsx"],
    include: ["src/**/*.test.{ts,tsx}"],
    globals: true,
    deps: {
      inline: ["@vitejs/plugin-react"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});