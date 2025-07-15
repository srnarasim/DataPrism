/**
 * Optimized CI browser tests for DataPrism Core
 * Focused on essential functionality with minimal overhead
 */

import { test, expect } from '@playwright/test';

// Test configuration for CI
const CI_CONFIG = {
  timeout: 15000,
  navigationTimeout: 10000,
  actionTimeout: 5000,
};

test.describe('DataPrism Core CI Tests', () => {
  test.setTimeout(CI_CONFIG.timeout);

  test.beforeEach(async ({ page }) => {
    // Set shorter timeouts for CI
    page.setDefaultTimeout(CI_CONFIG.actionTimeout);
    page.setDefaultNavigationTimeout(CI_CONFIG.navigationTimeout);
    
    // Navigate to test page
    await page.goto('/', { waitUntil: 'networkidle' });
  });

  test('should have WebAssembly support', async ({ page }) => {
    const wasmSupported = await page.evaluate(() => {
      return typeof WebAssembly !== 'undefined' && 
             typeof WebAssembly.instantiate === 'function';
    });
    
    expect(wasmSupported).toBe(true);
  });

  test('should initialize DataPrism engine', async ({ page }) => {
    // Wait for engine status to be ready
    await page.waitForSelector('[data-testid="engine-status"]', { 
      timeout: CI_CONFIG.timeout 
    });
    
    const status = await page.textContent('[data-testid="engine-status"]');
    expect(status).toContain('Engine Ready');
    
    // Verify engine is available
    const engineReady = await page.evaluate(() => {
      return window.DataPrism && window.DataPrism.isReady === true;
    });
    
    expect(engineReady).toBe(true);
  });

  test('should execute basic query', async ({ page }) => {
    // Wait for engine to be ready
    await page.waitForSelector('[data-testid="engine-status"]');
    
    // Execute a basic query
    const result = await page.evaluate(async () => {
      try {
        const queryResult = await window.DataPrism.query('SELECT 1 as test');
        return {
          success: true,
          hasData: queryResult.data && queryResult.data.length > 0,
          rowCount: queryResult.rowCount,
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
        };
      }
    });
    
    expect(result.success).toBe(true);
    expect(result.hasData).toBe(true);
  });

  test('should display data explorer', async ({ page }) => {
    // Navigate to explorer (simulated route)
    await page.goto('/explorer');
    
    // Check for data explorer elements
    await page.waitForSelector('[data-testid="data-explorer"]');
    
    const tableCount = await page.textContent('[data-testid="table-count"]');
    expect(parseInt(tableCount || '0')).toBeGreaterThan(0);
    
    // Test query execution
    await page.click('[data-testid="run-sample-query"]');
    
    // Check for results
    await page.waitForSelector('[data-testid="query-results"]');
    const results = page.locator('[data-testid="query-results"] table');
    await expect(results).toBeVisible();
  });

  test('should handle file upload', async ({ page }) => {
    await page.goto('/explorer');
    
    // Create mock CSV content
    const csvContent = 'name,value\ntest1,100\ntest2,200';
    
    // Simulate file upload
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    });
    
    // Check upload success
    await page.waitForSelector('[data-testid="upload-success"]');
    
    const tableName = await page.textContent('[data-testid="uploaded-table-name"]');
    expect(tableName).toBeTruthy();
  });

  test('should show performance metrics', async ({ page }) => {
    await page.goto('/performance');
    
    // Wait for metrics to load
    await page.waitForSelector('[data-testid="performance-metrics"]');
    
    // Check memory usage
    const memoryUsage = await page.textContent('[data-testid="memory-usage"]');
    expect(memoryUsage).toMatch(/\d+(\.\d+)?\s*MB/);
    
    // Check query count
    const queryCount = await page.textContent('[data-testid="query-count"]');
    expect(parseInt(queryCount || '0')).toBeGreaterThanOrEqual(0);
  });

  test('should handle API endpoints', async ({ page }) => {
    // Test API status endpoint
    const statusResponse = await page.request.get('/api/status');
    expect(statusResponse.ok()).toBe(true);
    
    const statusData = await statusResponse.json();
    expect(statusData.engine).toBe('ready');
    
    // Test API query endpoint
    const queryResponse = await page.request.post('/api/query', {
      data: { sql: 'SELECT 1' }
    });
    expect(queryResponse.ok()).toBe(true);
    
    const queryData = await queryResponse.json();
    expect(queryData.success).toBe(true);
  });

  test('should validate engine status', async ({ page }) => {
    // Wait for engine to be ready
    await page.waitForSelector('[data-testid="engine-status"]');
    
    // Get engine status
    const status = await page.evaluate(() => {
      return window.DataPrism ? window.DataPrism.getStatus() : null;
    });
    
    expect(status).toBeTruthy();
    expect(status.engine).toBe('ready');
    expect(status.wasm).toBe(true);
  });

  test('should handle memory within limits', async ({ page }) => {
    // Execute multiple queries to test memory usage
    const memoryTest = await page.evaluate(async () => {
      const results = [];
      
      for (let i = 0; i < 5; i++) {
        try {
          const result = await window.DataPrism.query(`SELECT ${i} as iteration`);
          results.push(result);
        } catch (error) {
          return { success: false, error: error.message };
        }
      }
      
      // Check memory usage if available
      const memoryInfo = (performance as any).memory ? {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize,
      } : null;
      
      return {
        success: true,
        queryCount: results.length,
        memoryInfo,
      };
    });
    
    expect(memoryTest.success).toBe(true);
    expect(memoryTest.queryCount).toBe(5);
    
    // Check memory usage is reasonable (if available)
    if (memoryTest.memoryInfo) {
      const memoryUsageMB = memoryTest.memoryInfo.used / 1024 / 1024;
      expect(memoryUsageMB).toBeLessThan(100); // Should be under 100MB for basic tests
    }
  });
});

test.describe('DataPrism Core Error Handling', () => {
  test.setTimeout(CI_CONFIG.timeout);

  test.beforeEach(async ({ page }) => {
    page.setDefaultTimeout(CI_CONFIG.actionTimeout);
    await page.goto('/');
  });

  test('should handle invalid queries gracefully', async ({ page }) => {
    await page.waitForSelector('[data-testid="engine-status"]');
    
    const errorTest = await page.evaluate(async () => {
      try {
        await window.DataPrism.query('INVALID SQL QUERY');
        return { success: true, error: null };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    // Should handle errors gracefully
    expect(errorTest.success).toBe(false);
    expect(errorTest.error).toBeTruthy();
  });

  test('should handle network errors', async ({ page }) => {
    // Simulate network failure
    await page.route('**/api/**', route => {
      route.abort('internetdisconnected');
    });
    
    const networkTest = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/status');
        return { success: response.ok, status: response.status };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    expect(networkTest.success).toBe(false);
  });
});

test.describe('DataPrism Core Performance', () => {
  test.setTimeout(CI_CONFIG.timeout);

  test.beforeEach(async ({ page }) => {
    page.setDefaultTimeout(CI_CONFIG.actionTimeout);
    await page.goto('/');
  });

  test('should load within performance budget', async ({ page }) => {
    await page.waitForSelector('[data-testid="engine-status"]');
    
    // Measure page load performance
    const timing = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByType('paint')
          .find(entry => entry.name === 'first-paint')?.startTime || 0,
      };
    });
    
    // Performance budgets for CI
    expect(timing.domContentLoaded).toBeLessThan(5000); // 5 seconds
    expect(timing.loadComplete).toBeLessThan(10000); // 10 seconds
    expect(timing.firstPaint).toBeLessThan(3000); // 3 seconds
  });

  test('should execute queries within time limit', async ({ page }) => {
    await page.waitForSelector('[data-testid="engine-status"]');
    
    const queryPerformance = await page.evaluate(async () => {
      const startTime = performance.now();
      
      try {
        await window.DataPrism.query('SELECT 1 as test');
        const endTime = performance.now();
        
        return {
          success: true,
          duration: endTime - startTime,
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
        };
      }
    });
    
    expect(queryPerformance.success).toBe(true);
    expect(queryPerformance.duration).toBeLessThan(1000); // 1 second for simple query
  });
});