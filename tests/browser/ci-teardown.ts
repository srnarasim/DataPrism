/**
 * Global teardown for CI browser tests
 * Cleanup resources and generate reports
 */

import { type FullConfig } from '@playwright/test';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting CI browser test teardown...');
  
  // Generate test summary report
  const testResultsPath = join(process.cwd(), 'test-results');
  const summaryPath = join(testResultsPath, 'ci-summary.json');
  
  const summary = {
    timestamp: new Date().toISOString(),
    environment: 'ci',
    testType: 'browser',
    config: {
      workers: config.workers,
      projects: config.projects.map(p => p.name),
      timeout: config.timeout,
    },
    performance: {
      setupDuration: Date.now(),
      memoryUsage: process.memoryUsage(),
    },
  };
  
  if (existsSync(testResultsPath)) {
    writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`📊 Test summary written to: ${summaryPath}`);
  }
  
  // Clear environment variables
  delete process.env.BROWSER_TEST_CI;
  delete process.env.BROWSER_TEST_QUICK;
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
  
  console.log('✅ CI browser test teardown complete');
}

export default globalTeardown;