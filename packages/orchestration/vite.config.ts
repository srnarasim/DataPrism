import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'DataPrismOrchestration',
      fileName: 'index',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['@duckdb/duckdb-wasm', 'apache-arrow'],
      output: {
        globals: {
          '@duckdb/duckdb-wasm': 'DuckDB',
          'apache-arrow': 'Arrow'
        }
      }
    }
  }
});