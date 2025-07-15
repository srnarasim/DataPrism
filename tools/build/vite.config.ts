import { defineConfig } from "vite";
import { resolve } from "path";
import { createHash } from "crypto";
import { wasmPlugin } from "./wasm-plugin.js";
import { CDNBuildConfig, DEFAULT_CDN_CONFIG, SIZE_LIMITS } from "./types.js";
import { manifestPlugin } from "./manifest-plugin.js";
import { duckdbCDNPlugin } from "./duckdb-cdn-plugin.js";
import { jekyllPlugin } from "./jekyll-plugin.js";

export default defineConfig(({ mode, command }) => {
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
      wasmPlugin({
        inline: isCDN && cdnConfig.optimization.wasmOptimization,
        generateIntegrity: cdnConfig.assets.integrity,
        outDir: "assets",
        compression: cdnConfig.optimization.compression,
      }),
      ...(isCDN ? [
        manifestPlugin({ config: cdnConfig }),
        duckdbCDNPlugin({
          outDir: "assets",
          generateIntegrity: cdnConfig.assets.integrity,
          baseUrl: cdnConfig.assets.baseUrl,
        }),
        jekyllPlugin({
          enabled: cdnConfig.target === 'github-pages',
          outDir: `cdn/dist/${cdnConfig.target === 'github-pages' ? '' : cdnConfig.target + '/'}`,
        })
      ] : []),
    ],
    build: {
      target: "es2020",
      lib: isCDN
        ? {
            entry: resolve(__dirname, "../../packages/orchestration/src/index.ts"),
            formats: ["umd", "es"],
            name: "DataPrism",
            fileName: (format) => {
              const ext = format === "es" ? "min.js" : "umd.js";
              return `dataprism.${ext}`;
            },
          }
        : {
            entry: {
              core: resolve(__dirname, "../../packages/core/src/index.ts"),
              "plugin-framework": resolve(
                __dirname,
                "../../packages/plugins/src/index.ts",
              ),
              orchestration: resolve(
                __dirname,
                "../../packages/orchestration/src/index.ts",
              ),
            },
            formats: ["es", "cjs"],
            name: "DataPrism",
            fileName: (format, entryName) => {
              return `${entryName}.${format === "es" ? "js" : "cjs"}`;
            },
          },
      outDir: isCDN ? `cdn/dist/${cdnConfig.target === 'github-pages' ? '' : cdnConfig.target + '/'}` : "dist",
      emptyOutDir: true,
      sourcemap: isProduction || isCDN,
      minify: (isProduction || isCDN) && cdnConfig.optimization.minification ? "esbuild" : false,
      chunkSizeWarningLimit: SIZE_LIMITS['core.min.js'] / 1024, // Convert to KB
      reportCompressedSize: true,
      rollupOptions: {
        external: isCDN
          ? ["apache-arrow"]
          : [
              "@dataprism/core",
              "@dataprism/plugin-framework",
              "@dataprism/orchestration",
              "@duckdb/duckdb-wasm",
              "apache-arrow",
            ],
        output: {
          exports: isCDN ? "named" : "auto",
          globals: isCDN
            ? {
                "@dataprism/core": "DataPrismCore",
                "@dataprism/plugin-framework": "DataPrismPluginFramework",
                "@dataprism/orchestration": "DataPrismOrchestration",
                "apache-arrow": "Arrow",
              }
            : undefined,
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name || "unknown";
            const info = name.split(".");
            const ext = info[info.length - 1];
            if (/wasm/i.test(ext)) {
              return `assets/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
        },
        ...((isCDN && cdnConfig.optimization.treeshaking) && {
          treeshake: {
            moduleSideEffects: false,
            propertyReadSideEffects: false,
            unknownGlobalSideEffects: false,
          },
        }),
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
        "@core": resolve(__dirname, "../../packages/core/src"),
        "@orchestration": resolve(
          __dirname,
          "../../packages/orchestration/src",
        ),
        "@plugins": resolve(__dirname, "../../packages/plugins/src"),
        "@shared": resolve(__dirname, "../../shared"),
        "@utils": resolve(__dirname, "../../utils"),
      },
    },
  };
});
