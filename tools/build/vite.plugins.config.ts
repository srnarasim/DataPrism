import { defineConfig } from "vite";
import { resolve } from "path";
import { CDNBuildConfig, DEFAULT_CDN_CONFIG } from "./types.js";
import { manifestPlugin } from "./manifest-plugin.js";
import { jekyllPlugin } from "./jekyll-plugin.js";

export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";
  const isCDN = mode === "cdn";
  
  // Parse CDN configuration from environment or use defaults
  const cdnTarget = (process.env.CDN_TARGET as CDNBuildConfig['target']) || 'github-pages';
  const cdnConfig: CDNBuildConfig = {
    ...DEFAULT_CDN_CONFIG,
    target: cdnTarget,
    optimization: {
      ...DEFAULT_CDN_CONFIG.optimization,
      compression: (process.env.CDN_COMPRESSION as any) || 'both',
      wasmOptimization: process.env.CDN_WASM_OPTIMIZATION !== 'false',
    },
    assets: {
      ...DEFAULT_CDN_CONFIG.assets,
      versioning: (process.env.CDN_VERSIONING as any) || 'hash',
      baseUrl: process.env.CDN_BASE_URL,
    },
  };

  return {
    plugins: [
      ...(isCDN ? [
        manifestPlugin({ 
          config: cdnConfig,
          bundleName: "dataprism-plugins"
        }),
        jekyllPlugin({
          enabled: cdnConfig.target === 'github-pages',
          outDir: `cdn/dist/${cdnConfig.target === 'github-pages' ? '' : cdnConfig.target + '/'}`,
        })
      ] : []),
    ],
    build: {
      target: "es2020",
      lib: {
        entry: resolve(__dirname, "../../packages/plugins/out-of-box/src/index.ts"),
        formats: ["es", "umd"],
        name: "DataPrismPlugins",
        fileName: (format) => {
          return format === "es" ? "dataprism-plugins.min.js" : "dataprism-plugins.umd.js";
        },
      },
      outDir: isCDN ? `cdn/dist/${cdnConfig.target === 'github-pages' ? '' : cdnConfig.target + '/'}` : "dist",
      emptyOutDir: false, // Don't empty the directory since we're adding to existing CDN build
      sourcemap: isProduction || isCDN,
      minify: (isProduction || isCDN) && cdnConfig.optimization.minification ? "esbuild" : false,
      rollupOptions: {
        external: isCDN
          ? [
              // External dependencies that should be loaded separately
              "apache-arrow",
              "@dataprism/core",
              "@dataprism/orchestration",
              "@dataprism/plugins"
            ]
          : [
              "@dataprism/core",
              "@dataprism/orchestration", 
              "@dataprism/plugins",
              "apache-arrow",
              "papaparse",
              "d3",
              "plotly.js-dist",
              "ml-kmeans",
              "ml-dbscan",
              "density-clustering",
              "ml-distance",
              "ml-matrix"
            ],
        output: {
          exports: "named",
          globals: isCDN
            ? {
                "apache-arrow": "Arrow",
                "@dataprism/core": "DataPrismCore",
                "@dataprism/orchestration": "DataPrism",
                "@dataprism/plugins": "DataPrismPlugins",
                "papaparse": "Papa",
                "d3": "d3",
                "plotly.js-dist": "Plotly",
                "ml-kmeans": "MLKMeans",
                "ml-dbscan": "MLDBSCAN",
                "density-clustering": "DensityClustering",
                "ml-distance": "MLDistance",
                "ml-matrix": "MLMatrix"
              }
            : undefined,
        },
      },
    },
    define: {
      __VERSION__: JSON.stringify(process.env.npm_package_version || "1.0.0"),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
      __DEVELOPMENT__: JSON.stringify(!isProduction),
    },
    esbuild: {
      drop: isProduction ? ["console", "debugger"] : [],
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "../../packages/plugins/out-of-box/src"),
        "@shared": resolve(__dirname, "../../packages/plugins/out-of-box/src/shared"),
        "@plugins": resolve(__dirname, "../../packages/plugins/out-of-box/src/plugins"),
        "@core": resolve(__dirname, "../../packages/core/src"),
        "@orchestration": resolve(__dirname, "../../packages/orchestration/src"),
        "@plugin-framework": resolve(__dirname, "../../packages/plugins/src"),
      },
    },
  };
});