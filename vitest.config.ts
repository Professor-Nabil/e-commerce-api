import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    // Option A: Use path.resolve to be safe
    setupFiles: [path.resolve(__dirname, "./tests/setup.ts")],

    // Option B: Ensure environment is set to node
    environment: "node",

    // Disable threads to prevent MariaDB connection issues during parallel runs
    pool: "forks",
  },
});
