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
      "@dataprism/core": resolve(__dirname, "../../packages/core/pkg"),
      "@dataprism/orchestration": resolve(__dirname, "../../packages/orchestration/src"),
      "@dataprism/plugins": resolve(__dirname, "../../packages/plugins/src"),
      "@dataprism/plugins-out-of-box": resolve(__dirname, "../../packages/plugins/out-of-box/src"),
      // @ruvector/wasm: in build/dev, use the shim that lazy-loads from public/ruvector/
      "@ruvector/wasm": resolve(__dirname, "./src/shims/ruvector-wasm.js"),
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
      "@dataprism/core",
      "@dataprism/orchestration",
      "@dataprism/plugin-framework",
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
      external: [
        "@dataprism/core",
        "@dataprism/orchestration",
        "@dataprism/plugin-framework",
        "@dataprism/plugins-out-of-box",
        "@shared/performance-tracker.js",
        "@shared/worker-manager.js",
        "@shared/data-utils.js",
      ],
      output: {
        globals: {
          "@dataprism/core": "DataPrismCore",
          "@dataprism/orchestration": "DataPrismOrchestration",
          "@dataprism/plugin-framework": "DataPrismPluginFramework",
        },
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
