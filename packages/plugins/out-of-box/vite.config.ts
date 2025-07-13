import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
  const baseConfig = {
    build: {
      target: "es2020",
      lib: {
        entry: resolve(__dirname, "src/index.ts"),
        name: "DataPrismOutOfBoxPlugins",
        formats: ["es", "cjs"] as const,
        fileName: (format: string) => `index.${format === "es" ? "js" : "cjs"}`,
      },
      rollupOptions: {
        external: [
          "@dataprism/plugins",
          "papaparse",
          "d3",
          "plotly.js-dist",
          "ml-kmeans",
          "ml-dbscan",
        ],
        output: {
          globals: {
            "@dataprism/plugins": "DataPrismPlugins",
            papaparse: "Papa",
            d3: "d3",
            "plotly.js-dist": "Plotly",
            "ml-kmeans": "MLKMeans",
            "ml-dbscan": "MLDBSCAN",
          },
        },
      },
      sourcemap: true,
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: false,
          drop_debugger: true,
        },
      },
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
        "@shared": resolve(__dirname, "src/shared"),
        "@plugins": resolve(__dirname, "src/plugins"),
      },
    },
    define: {
      __DEV__: mode === "development",
    },
  };

  // Mode-specific configurations
  if (mode === "browser") {
    return {
      ...baseConfig,
      build: {
        target: "es2020",
        lib: {
          entry: resolve(__dirname, "src/index.ts"),
          name: "DataPrismOutOfBoxPlugins",
          formats: ["es"],
          fileName: () => "browser.js",
        },
        rollupOptions: {
          // Bundle all dependencies for browser use
          external: [],
          output: {
            inlineDynamicImports: true,
          },
        },
        sourcemap: true,
        minify: false, // Keep readable for demo
      },
    };
  }

  if (mode === "visualization") {
    return {
      ...baseConfig,
      build: {
        ...baseConfig.build,
        lib: {
          entry: resolve(__dirname, "src/plugins/visualization/index.ts"),
          name: "DataPrismVisualizationPlugins",
          formats: ["es"],
          fileName: () => "visualization.js",
        },
      },
    };
  }

  if (mode === "integration") {
    return {
      ...baseConfig,
      build: {
        ...baseConfig.build,
        lib: {
          entry: resolve(__dirname, "src/plugins/integration/index.ts"),
          name: "DataPrismIntegrationPlugins",
          formats: ["es"],
          fileName: () => "integration.js",
        },
      },
    };
  }

  if (mode === "processing") {
    return {
      ...baseConfig,
      build: {
        ...baseConfig.build,
        lib: {
          entry: resolve(__dirname, "src/plugins/processing/index.ts"),
          name: "DataPrismProcessingPlugins",
          formats: ["es"],
          fileName: () => "processing.js",
        },
      },
    };
  }

  if (mode === "utility") {
    return {
      ...baseConfig,
      build: {
        ...baseConfig.build,
        lib: {
          entry: resolve(__dirname, "src/plugins/utility/index.ts"),
          name: "DataPrismUtilityPlugins",
          formats: ["es"],
          fileName: () => "utility.js",
        },
      },
    };
  }

  return baseConfig;
});
