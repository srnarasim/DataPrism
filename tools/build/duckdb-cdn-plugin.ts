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
      // Add DuckDB assets to the bundle
      const duckdbAssets = [
        'duckdb-mvp.wasm',
        'duckdb-eh.wasm', 
        'duckdb-coi.wasm',
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

          console.log(`✓ Added DuckDB asset: ${asset} (${(content.length / 1024).toFixed(1)}KB)`);
        } catch (error) {
          console.warn(`⚠ Could not find DuckDB asset: ${asset}`);
        }
      }
    },
    writeBundle(outputOptions, bundle) {
      // Create DuckDB configuration for CDN usage
      const duckdbConfig = {
        baseUrl: options.baseUrl || '',
        assets: {
          'duckdb-mvp.wasm': 'assets/duckdb-mvp.wasm',
          'duckdb-eh.wasm': 'assets/duckdb-eh.wasm',
          'duckdb-coi.wasm': 'assets/duckdb-coi.wasm',
          'duckdb-browser-mvp.worker.js': 'assets/duckdb-browser-mvp.worker.js',
          'duckdb-browser-eh.worker.js': 'assets/duckdb-browser-eh.worker.js',
          'duckdb-browser-coi.worker.js': 'assets/duckdb-browser-coi.worker.js',
          'duckdb-browser-coi.pthread.worker.js': 'assets/duckdb-browser-coi.pthread.worker.js'
        },
        bundles: {
          mvp: {
            mainModule: 'assets/duckdb-mvp.wasm',
            mainWorker: 'assets/duckdb-browser-mvp.worker.js'
          },
          eh: {
            mainModule: 'assets/duckdb-eh.wasm', 
            mainWorker: 'assets/duckdb-browser-eh.worker.js'
          },
          coi: {
            mainModule: 'assets/duckdb-coi.wasm',
            mainWorker: 'assets/duckdb-browser-coi.worker.js',
            pthreadWorker: 'assets/duckdb-browser-coi.pthread.worker.js'
          }
        }
      };

      // Write DuckDB configuration
      const configPath = resolve(outputOptions.dir!, 'duckdb-config.json');
      writeFileSync(configPath, JSON.stringify(duckdbConfig, null, 2));
      console.log('✓ Generated DuckDB CDN configuration');
    }
  };
}