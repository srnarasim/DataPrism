import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@components": resolve(__dirname, "./src/components"),
      "@pages": resolve(__dirname, "./src/pages"),
      "@contexts": resolve(__dirname, "./src/contexts"),
      "@utils": resolve(__dirname, "./src/utils"),
      "@hooks": resolve(__dirname, "./src/hooks"),
    },
  },

  // Required for WebAssembly
  server: {
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
    fs: {
      allow: [".."], // Allow access to workspace packages
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

  build: {
    target: "es2020",
    sourcemap: true,
    rollupOptions: {
      external: [
        "@dataprism/core",
        "@dataprism/orchestration",
        "@dataprism/plugin-framework",
      ],
      output: {
        globals: {
          "@dataprism/core": "DataPrismCore",
          "@dataprism/orchestration": "DataPrismOrchestration",
          "@dataprism/plugin-framework": "DataPrismPluginFramework",
        },
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          charts: ["d3", "chart.js", "react-chartjs-2", "recharts"],
          ui: [
            "@tanstack/react-query",
            "@tanstack/react-table",
            "lucide-react",
          ],
        },
      },
    },
  },

  // Environment variables for the demo
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || "1.0.0"),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
});
