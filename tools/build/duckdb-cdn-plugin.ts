import type { Plugin } from 'vite';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';
import { createHash } from 'crypto';

export interface DuckDBCDNPluginOptions {
  outDir: string;
  generateIntegrity?: boolean;
  baseUrl?: string;
}

export function duckdbCDNPlugin(options: DuckDBCDNPluginOptions): Plugin {
  return {
    name: 'duckdb-cdn-plugin',
    apply: 'build',
    generateBundle(outputOptions, bundle) {
      // For CDN builds, we'll only include worker scripts, not the large WASM files
      // This keeps the CDN bundle size manageable while still providing DuckDB functionality
      const duckdbAssets = [
        'duckdb-browser-mvp.worker.js',
        'duckdb-browser-eh.worker.js',
        'duckdb-browser-coi.worker.js',
        'duckdb-browser-coi.pthread.worker.js'
      ];

      // Try to find DuckDB assets from node_modules
      const duckdbPath = resolve(process.cwd(), 'node_modules/@duckdb/duckdb-wasm/dist');
      
      for (const asset of duckdbAssets) {
        try {
          const assetPath = join(duckdbPath, asset);
          const content = readFileSync(assetPath);
          
          // Generate integrity hash if requested
          let integrity: string | undefined;
          if (options.generateIntegrity) {
            const hash = createHash('sha384');
            hash.update(content);
            integrity = `sha384-${hash.digest('base64')}`;
          }

          // Add to Vite bundle
          this.emitFile({
            type: 'asset',
            fileName: `assets/${asset}`,
            source: content
          });

          console.log(`✓ Added DuckDB worker: ${asset} (${(content.length / 1024).toFixed(1)}KB)`);
        } catch (error) {
          console.warn(`⚠ Could not find DuckDB worker: ${asset}`);
        }
      }
    },
    writeBundle(outputOptions, bundle) {
      // Create DuckDB configuration for hybrid CDN usage
      // Workers are served from CDN, WASM files from JSDelivr
      const duckdbConfig = {
        baseUrl: options.baseUrl || '',
        hybrid: true, // Indicates this is a hybrid deployment
        workers: {
          'duckdb-browser-mvp.worker.js': 'assets/duckdb-browser-mvp.worker.js',
          'duckdb-browser-eh.worker.js': 'assets/duckdb-browser-eh.worker.js',
          'duckdb-browser-coi.worker.js': 'assets/duckdb-browser-coi.worker.js',
          'duckdb-browser-coi.pthread.worker.js': 'assets/duckdb-browser-coi.pthread.worker.js'
        },
        fallback: {
          strategy: 'jsdelivr',
          note: 'WASM files are loaded from JSDelivr for optimal CDN size'
        }
      };

      // Write DuckDB configuration
      const configPath = resolve(outputOptions.dir!, 'duckdb-config.json');
      writeFileSync(configPath, JSON.stringify(duckdbConfig, null, 2));
      console.log('✓ Generated DuckDB CDN configuration');
    }
  };
}