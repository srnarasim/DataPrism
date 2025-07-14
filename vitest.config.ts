import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',
    
    // Include patterns for test files
    include: [
      'tests/**/*.{test,spec}.{js,ts}',
      'packages/**/src/**/*.{test,spec}.{js,ts}'
    ],
    
    // Exclude patterns
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/pkg/**',
      '**/target/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*'
    ],
    
    // Global test timeout
    testTimeout: 30000,
    
    // Globals available in tests
    globals: true,
    
    // Setup files
    setupFiles: [],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'coverage/**',
        'dist/**',
        'packages/*/dist/**',
        'apps/*/dist/**',
        'tools/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/node_modules/**'
      ]
    },
    
    // Reporter configuration
    reporter: ['verbose'],
    
    // Retry configuration for flaky tests
    retry: {
      count: 2
    },
    
    // Pool options
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    }
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@tests': resolve(__dirname, './tests'),
      '@packages': resolve(__dirname, './packages'),
      '@tools': resolve(__dirname, './tools')
    }
  },
  
  // Define for test environment
  define: {
    'process.env.NODE_ENV': '"test"'
  }
});