import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

const isCI = process.env.CI === "true";

export default defineConfig({
  plugins: [react()],
  base: isCI ? "/DataPrism/demo/" : "/",

  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
    alias: {
      "@ruvector/wasm": new URL("./src/__mocks__/@ruvector/wasm.ts", import.meta.url).pathname,
      "@xenova/transformers": new URL("./src/__mocks__/@xenova/transformers.ts", import.meta.url).pathname,
      "@dataprism/plugins-out-of-box": new URL("./src/__mocks__/@dataprism/plugins-out-of-box.ts", import.meta.url).pathname,
    },
  },

  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@components": resolve(__dirname, "./src/components"),
      "@pages": resolve(__dirname, "./src/pages"),
      "@contexts": resolve(__dirname, "./src/contexts"),
      "@utils": resolve(__dirname, "./src/utils"),
      "@hooks": resolve(__dirname, "./src/hooks"),
      // Local development aliases for DataPrism packages
      "@dataprism/orchestration": resolve(__dirname, "../../packages/orchestration/src"),
      "@dataprism/plugins": resolve(__dirname, "../../packages/plugins/src"),
      // Shim: only re-exports SemanticClusteringPlugin, avoiding csv-importer (needs papaparse/plotly)
      "@dataprism/plugins-out-of-box": resolve(__dirname, "./src/shims/plugins-out-of-box.ts"),
      // @shared/* modules live inside plugins/out-of-box
      "@shared/worker-manager.js": resolve(__dirname, "../../packages/plugins/out-of-box/src/shared/worker-manager.ts"),
      "@shared/performance-tracker.js": resolve(__dirname, "../../packages/plugins/out-of-box/src/shared/performance-tracker.ts"),
      "@shared/data-utils.js": resolve(__dirname, "../../packages/plugins/out-of-box/src/shared/data-utils.ts"),
      // @ruvector/wasm: in build/dev, use the shim that lazy-loads from public/ruvector/
      "@ruvector/wasm": resolve(__dirname, "./src/shims/ruvector-wasm.js"),
      // Pin third-party deps used by workspace-aliased source to THIS app's node_modules.
      // Rollup resolves bare imports relative to the source file's location, so when we
      // alias e.g. @dataprism/plugins-out-of-box to packages/plugins/out-of-box/src/,
      // imports like "d3" inside that code are resolved from there — not from here.
      // CI only installs node_modules here, so without these aliases the build fails.
      "d3": resolve(__dirname, "node_modules/d3"),
      "ml-kmeans": resolve(__dirname, "node_modules/ml-kmeans"),
      "density-clustering": resolve(__dirname, "node_modules/density-clustering"),
      "ml-distance": resolve(__dirname, "node_modules/ml-distance"),
      "ml-matrix": resolve(__dirname, "node_modules/ml-matrix"),
      // duckdb-wasm and apache-arrow are statically imported by orchestration — must bundle.
      // Force the browser ESM build to avoid the Node.js CJS entry.
      "@duckdb/duckdb-wasm": resolve(__dirname, "node_modules/@duckdb/duckdb-wasm/dist/duckdb-browser.mjs"),
      "apache-arrow": resolve(__dirname, "node_modules/apache-arrow/Arrow.dom.mjs"),
    },
  },

  // Required for WebAssembly
  server: {
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
    fs: {
      allow: [
        "..", // Allow access to workspace packages
        "../../packages", // Explicit access to packages directory
        "../../packages/core/pkg", // Explicit access to WASM files
      ],
    },
  },

  // Optimize for DataPrism packages
  optimizeDeps: {
    exclude: [
      "@dataprism/orchestration",
    ],
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
      "@tanstack/react-table",
    ],
  },

  // WebAssembly support
  assetsInclude: ['**/*.wasm'],

  build: {
    target: "es2020",
    sourcemap: true,
    rollupOptions: {
      treeshake: false,
      output: {
        manualChunks: undefined,
      },
    },
  },

  // Environment variables for the demo
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || "1.0.0"),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
});
