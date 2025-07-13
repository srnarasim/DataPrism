import { defineConfig } from 'vite';
import { resolve } from 'path';
import { createHash } from 'crypto';
import { wasmPlugin } from './wasm-plugin.js';

export default defineConfig(({ mode, command }) => {
  const isProduction = mode === 'production';
  const isCDN = mode === 'cdn';
  
  return {
    plugins: [
      wasmPlugin({
        inline: isCDN, // Inline WASM for CDN builds
        generateIntegrity: true,
        outDir: 'assets'
      })
    ],
    build: {
      target: 'es2020',
      lib: {
        entry: {
          core: resolve(__dirname, '../../packages/core/src/index.ts'),
          'plugin-framework': resolve(__dirname, '../../packages/plugins/src/index.ts'),
          orchestration: resolve(__dirname, '../../packages/orchestration/src/index.ts')
        },
        formats: isCDN ? ['umd'] : ['es', 'cjs'],
        name: 'DataPrism',
        fileName: (format, entryName) => {
          if (isCDN) {
            return `${entryName}.min.js`;
          }
          return `${entryName}.${format === 'es' ? 'js' : 'cjs'}`;
        }
      },
      rollupOptions: {
        external: isCDN ? [] : [
          '@dataprism/core',
          '@dataprism/plugin-framework',
          '@dataprism/orchestration',
          'duckdb-wasm'
        ],
        output: {
          globals: isCDN ? {
            '@dataprism/core': 'DataPrismCore',
            '@dataprism/plugin-framework': 'DataPrismPluginFramework',
            '@dataprism/orchestration': 'DataPrismOrchestration'
          } : undefined,
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            if (/wasm/i.test(ext)) {
              return `assets/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          }
        }
      },
      outDir: isCDN ? 'cdn/dist' : 'dist',
      emptyOutDir: true,
      sourcemap: true,
      minify: isProduction ? 'esbuild' : false,
      chunkSizeWarningLimit: 2000, // 2MB limit
      reportCompressedSize: true
    },
    define: {
      __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
      __DEVELOPMENT__: JSON.stringify(!isProduction)
    },
    esbuild: {
      drop: isProduction ? ['console', 'debugger'] : []
    },
    resolve: {
      alias: {
        '@core': resolve(__dirname, '../../packages/core/src'),
        '@orchestration': resolve(__dirname, '../../packages/orchestration/src'),
        '@plugins': resolve(__dirname, '../../packages/plugins/src'),
        '@shared': resolve(__dirname, '../../shared'),
        '@utils': resolve(__dirname, '../../utils')
      }
    }
  };
});