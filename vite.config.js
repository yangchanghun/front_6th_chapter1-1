// import { defineConfig } from "vitest/config";

// export default defineConfig({
//   test: {
//     globals: true,
//     environment: "jsdom",
//     setupFiles: "./src/setupTests.js",
//     exclude: ["**/e2e/**", "**/*.e2e.spec.js", "**/node_modules/**"],
//     poolOptions: {
//       threads: {
//         singleThread: true,
//       },
//     },
//   },
// });

import { defineConfig } from "vitest/config";

const isProd = process.env.GITHUB_ACTIONS === "true";

export default defineConfig({
  base: isProd ? "/front_6th_chapter1-1/" : "/",

  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },

  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
    exclude: ["**/e2e/**", "**/*.e2e.spec.js", "**/node_modules/**"],
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
});
