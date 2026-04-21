import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    setupFiles: [path.resolve(__dirname, "./tests/setup.ts")],
    environment: "node",
    // We can now run in parallel!
    // If MariaDB struggles with too many connections,
    // you can limit this to pool: 'threads' with a maxInstances.
    pool: "threads",
  },
});
