import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/tests/setup.ts"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
