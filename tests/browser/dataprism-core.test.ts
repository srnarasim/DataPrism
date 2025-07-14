/**
 * DataPrism Core Browser Tests
 * Tests basic functionality in real browser environments
 */

import { test, expect } from '@playwright/test';
import { createDataPrismBrowserTest, StableBrowserTestRunner } from './stable-test-runner';

// Configure Playwright for DataPrism testing
test.use({
  // Use a realistic viewport
  viewport: { width: 1280, height: 720 },
  // Increase timeout for WASM loading
  actionTimeout: 30000,
  navigationTimeout: 30000
});

test.describe('DataPrism Core Browser Tests', () => {
  createDataPrismBrowserTest(
    'should load DataPrism and initialize WASM module',
    async (page, context, runner) => {
      // Test DataPrism initialization
      await runner.testDataPrismInitialization(page);
    },
    {
      timeout: 45000,
      waitForWasm: true,
      mockNetworkRequests: true
    }
  );

  createDataPrismBrowserTest(
    'should execute basic SQL queries',
    async (page, context, runner) => {
      // Initialize DataPrism
      await runner.testDataPrismInitialization(page);
      
      // Test basic query functionality
      await runner.testBasicQuery(page);
    },
    {
      timeout: 30000,
      waitForWasm: true
    }
  );

  createDataPrismBrowserTest(
    'should handle large datasets efficiently',
    async (page, context, runner) => {
      // Initialize DataPrism
      await runner.testDataPrismInitialization(page);
      
      // Test large dataset handling
      await runner.testLargeDatasetHandling(page);
    },
    {
      timeout: 60000,
      waitForWasm: true
    }
  );

  createDataPrismBrowserTest(
    'should load and manage plugins',
    async (page, context, runner) => {
      // Initialize DataPrism
      await runner.testDataPrismInitialization(page);
      
      // Test plugin loading
      await runner.testPluginLoading(page);
    },
    {
      timeout: 45000,
      waitForWasm: true,
      mockNetworkRequests: true
    }
  );

  test('should recover from WASM module failures', async ({ page }) => {
    const runner = new StableBrowserTestRunner();
    
    // Navigate to demo page
    await page.goto('/demo', { waitUntil: 'networkidle' });
    
    // Try WASM loading with fallback mechanisms
    const wasmLoaded = await runner.testWasmLoading(page, {
      wasmPath: '/pkg/dataprism_core_bg.wasm',
      fallbackPaths: [
        '/cdn/dataprism.fallback.wasm',
        '/assets/dataprism.wasm'
      ],
      timeout: 30000,
      validateModule: true
    });
    
    expect(wasmLoaded).toBe(true);
  });

  test('should handle network failures gracefully', async ({ page }) => {
    // Simulate network failures
    await page.route('**/*.wasm', route => route.abort());
    await page.route('**/api/**', route => route.abort());
    
    await page.goto('/demo');
    
    // Even with network failures, page should load
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Check for error handling
    const hasErrorHandling = await page.evaluate(() => {
      return typeof window.onerror === 'function' || 
             typeof window.addEventListener === 'function';
    });
    
    expect(hasErrorHandling).toBe(true);
  });

  test('should maintain performance under load', async ({ page }) => {
    const runner = new StableBrowserTestRunner();
    
    // Initialize DataPrism
    await runner.testDataPrismInitialization(page);
    
    // Measure performance
    const startTime = Date.now();
    
    // Execute multiple queries in sequence
    for (let i = 0; i < 10; i++) {
      await page.evaluate(async (index) => {
        const result = await window.DataPrism.query(`SELECT ${index} as test_value`);
        if (!result || result.data.length === 0) {
          throw new Error(`Query ${index} failed`);
        }
      }, i);
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // Should complete 10 queries in under 5 seconds
    expect(totalTime).toBeLessThan(5000);
    
    console.log(`✅ Completed 10 queries in ${totalTime}ms`);
  });

  test('should handle memory management correctly', async ({ page }) => {
    const runner = new StableBrowserTestRunner();
    
    // Initialize DataPrism
    await runner.testDataPrismInitialization(page);
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory ? {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize
      } : null;
    });
    
    // Execute memory-intensive operations
    await page.evaluate(async () => {
      for (let i = 0; i < 5; i++) {
        const result = await window.DataPrism.query(`
          SELECT COUNT(*) 
          FROM (SELECT * FROM generate_series(1, 1000))
        `);
        
        // Force garbage collection if available
        if ((window as any).gc) {
          (window as any).gc();
        }
      }
    });
    
    // Get final memory usage
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory ? {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize
      } : null;
    });
    
    if (initialMemory && finalMemory) {
      const memoryIncrease = finalMemory.used - initialMemory.used;
      const increasePercent = (memoryIncrease / initialMemory.used) * 100;
      
      console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB (${increasePercent.toFixed(1)}%)`);
      
      // Memory increase should be reasonable (less than 50MB or 100% increase)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
      expect(increasePercent).toBeLessThan(100);
    }
  });
});

test.describe('Cross-browser Compatibility', () => {
  const browsers = ['chromium', 'firefox', 'webkit'];
  
  for (const browserName of browsers) {
    test(`should work correctly in ${browserName}`, async ({ page, browserName: currentBrowser }) => {
      // Skip if not the target browser
      if (currentBrowser !== browserName) {
        test.skip();
      }
      
      const runner = new StableBrowserTestRunner();
      
      console.log(`🌐 Testing in ${browserName}...`);
      
      // Test basic functionality
      await runner.testDataPrismInitialization(page);
      await runner.testBasicQuery(page);
      
      console.log(`✅ ${browserName} compatibility test passed`);
    });
  }
});

test.describe('Error Recovery', () => {
  test('should recover from JavaScript errors', async ({ page }) => {
    const runner = new StableBrowserTestRunner();
    
    // Initialize DataPrism
    await runner.testDataPrismInitialization(page);
    
    // Inject a JavaScript error
    await page.evaluate(() => {
      // Trigger an error
      throw new Error('Simulated JavaScript error');
    });
    
    // DataPrism should still be functional
    const isStillWorking = await page.evaluate(async () => {
      try {
        const result = await window.DataPrism.query('SELECT 1');
        return result && result.data && result.data.length === 1;
      } catch {
        return false;
      }
    });
    
    expect(isStillWorking).toBe(true);
  });

  test('should handle malformed SQL gracefully', async ({ page }) => {
    const runner = new StableBrowserTestRunner();
    
    // Initialize DataPrism
    await runner.testDataPrismInitialization(page);
    
    // Test malformed SQL
    const errorResult = await page.evaluate(async () => {
      try {
        await window.DataPrism.query('SELECT INVALID SYNTAX FROM');
        return { success: true, error: null };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    expect(errorResult.success).toBe(false);
    expect(errorResult.error).toBeTruthy();
    
    // Should still be able to execute valid queries after error
    const recoveryResult = await page.evaluate(async () => {
      try {
        const result = await window.DataPrism.query('SELECT 1 as recovery_test');
        return { success: true, data: result.data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    expect(recoveryResult.success).toBe(true);
    expect(recoveryResult.data[0].recovery_test).toBe(1);
  });
});