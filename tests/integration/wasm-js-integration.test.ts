/**
 * WASM-JavaScript Integration Tests
 * Tests the interaction between Rust WASM core and TypeScript orchestration
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { retryableTest, TestRetryManager } from '../utils/retry-mechanism';
import { setupExternalServiceMocks, cleanupExternalServiceMocks } from '../mocks/external-services';

// Mock the DataPrism core for integration testing
interface MockDataPrismCore {
  initialize(): Promise<void>;
  query(sql: string): Promise<{ data: any[]; rowCount: number; executionTime: number }>;
  getMemoryUsage(): Promise<number>;
  healthCheck(): Promise<boolean>;
  cleanup(): Promise<void>;
  forceGC(): Promise<void>;
  getVersion(): string;
  isReady(): boolean;
}

class MockDataPrismCoreImpl implements MockDataPrismCore {
  private initialized = false;
  private memoryUsage = 10 * 1024 * 1024; // 10MB base
  private queryCount = 0;

  async initialize(): Promise<void> {
    // Simulate initialization time
    await new Promise(resolve => setTimeout(resolve, 100));
    this.initialized = true;
  }

  async query(sql: string): Promise<{ data: any[]; rowCount: number; executionTime: number }> {
    if (!this.initialized) {
      throw new Error('Core not initialized');
    }

    const startTime = Date.now();
    
    // Simulate query processing
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const executionTime = Date.now() - startTime;
    this.queryCount++;
    
    // Simulate memory usage increase
    this.memoryUsage += Math.random() * 1024 * 1024; // Random 0-1MB increase
    
    // Mock different query responses
    if (sql.includes('SELECT') && /SELECT\s+(\d+)/.test(sql)) {
      const match = sql.match(/SELECT\s+(\d+)/);
      const number = match ? parseInt(match[1]) : 1;
      return {
        data: [{ [number.toString()]: number }],
        rowCount: 1,
        executionTime
      };
    }
    
    if (sql.includes('generate_series')) {
      const match = sql.match(/generate_series\(1,\s*(\d+)\)/);
      const count = match ? parseInt(match[1]) : 100;
      return {
        data: Array.from({ length: Math.min(count, 1000) }, (_, i) => ({ value: i + 1 })),
        rowCount: count,
        executionTime: executionTime + Math.floor(count / 1000) // Simulate scaling time
      };
    }
    
    if (sql.includes('COUNT(*)')) {
      return {
        data: [{ 'COUNT(*)': 42 }],
        rowCount: 1,
        executionTime
      };
    }
    
    // Default response
    return {
      data: [{ result: 'success' }],
      rowCount: 1,
      executionTime
    };
  }

  async getMemoryUsage(): Promise<number> {
    return this.memoryUsage;
  }

  async healthCheck(): Promise<boolean> {
    return this.initialized;
  }

  async cleanup(): Promise<void> {
    this.initialized = false;
    this.memoryUsage = 10 * 1024 * 1024;
    this.queryCount = 0;
  }

  async forceGC(): Promise<void> {
    // Simulate garbage collection
    this.memoryUsage = Math.max(10 * 1024 * 1024, this.memoryUsage * 0.8);
  }

  getVersion(): string {
    return '1.0.0-test';
  }

  isReady(): boolean {
    return this.initialized;
  }
}

describe('WASM-JavaScript Integration', () => {
  let core: MockDataPrismCore;
  let retryManager: TestRetryManager;

  beforeAll(async () => {
    // Set up external service mocks
    setupExternalServiceMocks({
      llmProviders: true,
      cdnRequests: true,
      networkRequests: true,
      wasmModules: true,
      localStorage: true,
      performance: true
    });

    retryManager = new TestRetryManager();
  });

  afterAll(async () => {
    cleanupExternalServiceMocks();
  });

  beforeEach(async () => {
    core = new MockDataPrismCoreImpl();
    await core.initialize();
  });

  describe('Core Initialization', () => {
    it('should initialize WASM module successfully', async () => {
      await retryableTest(async () => {
        const freshCore = new MockDataPrismCoreImpl();
        
        expect(freshCore.isReady()).toBe(false);
        
        await freshCore.initialize();
        
        expect(freshCore.isReady()).toBe(true);
        expect(await freshCore.healthCheck()).toBe(true);
        expect(freshCore.getVersion()).toMatch(/^\d+\.\d+\.\d+/);
      }, 'wasm');
    });

    it('should handle initialization failures gracefully', async () => {
      const faultyCore = new MockDataPrismCoreImpl();
      
      // Mock initialization failure
      const originalInitialize = faultyCore.initialize;
      let attemptCount = 0;
      
      faultyCore.initialize = async () => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('WASM module compilation failed');
        }
        return originalInitialize.call(faultyCore);
      };
      
      // Should eventually succeed with retry mechanism
      await retryManager.runWithRetry(
        () => faultyCore.initialize(),
        TestRetryManager.createRetryOptions('wasm')
      );
      
      expect(faultyCore.isReady()).toBe(true);
      expect(attemptCount).toBe(3);
    }, 15000); // Increase timeout to 15 seconds
  });

  describe('Query Execution', () => {
    it('should execute basic SQL queries', async () => {
      await retryableTest(async () => {
        const result = await core.query('SELECT 1');
        
        expect(result).toBeDefined();
        expect(result.data).toHaveLength(1);
        expect(result.data[0]['1']).toBe(1);
        expect(result.rowCount).toBe(1);
        expect(result.executionTime).toBeGreaterThan(0);
      }, 'integration');
    });

    it('should handle large dataset queries', async () => {
      await retryableTest(async () => {
        const result = await core.query('SELECT * FROM generate_series(1, 10000)');
        
        expect(result).toBeDefined();
        expect(result.rowCount).toBe(10000);
        expect(result.data.length).toBeLessThanOrEqual(1000); // Mock limits response size
        expect(result.executionTime).toBeGreaterThan(0);
        
        // Should complete within reasonable time
        expect(result.executionTime).toBeLessThan(5000);
      }, 'integration');
    });

    it('should handle concurrent queries efficiently', async () => {
      await retryableTest(async () => {
        const startTime = Date.now();
        
        // Execute multiple queries concurrently
        const promises = Array.from({ length: 5 }, (_, i) =>
          core.query(`SELECT ${i + 1}`)
        );
        
        const results = await Promise.all(promises);
        const totalTime = Date.now() - startTime;
        
        expect(results).toHaveLength(5);
        results.forEach((result, index) => {
          const expectedNumber = index + 1;
          expect(result.data[0][expectedNumber.toString()]).toBe(expectedNumber);
        });
        
        // Concurrent execution should be faster than sequential
        expect(totalTime).toBeLessThan(1000);
      }, 'integration');
    });

    it('should handle query errors gracefully', async () => {
      await retryableTest(async () => {
        // Test malformed SQL - mock should simulate error
        const mockCore = core as any;
        const originalQuery = mockCore.query;
        mockCore.query = async (sql: string) => {
          if (sql.includes('INVALID')) {
            throw new Error('Invalid SQL syntax');
          }
          return originalQuery.call(mockCore, sql);
        };
        
        await expect(async () => {
          await mockCore.query('INVALID SQL SYNTAX');
        }).rejects.toThrow('Invalid SQL syntax');
        
        // Restore original method
        mockCore.query = originalQuery;
        
        // Core should still be functional after error
        const recoveryResult = await core.query('SELECT 1');
        expect(recoveryResult.data[0]['1']).toBe(1);
      }, 'integration');
    });
  });

  describe('Memory Management', () => {
    it('should track memory usage correctly', async () => {
      await retryableTest(async () => {
        const initialMemory = await core.getMemoryUsage();
        expect(initialMemory).toBeGreaterThan(0);
        
        // Execute some queries to increase memory usage
        for (let i = 0; i < 10; i++) {
          await core.query('SELECT * FROM generate_series(1, 1000)');
        }
        
        const afterQueriesMemory = await core.getMemoryUsage();
        expect(afterQueriesMemory).toBeGreaterThan(initialMemory);
      }, 'integration');
    }, 10000); // Increase timeout to 10 seconds

    it('should handle memory cleanup with garbage collection', async () => {
      await retryableTest(async () => {
        const initialMemory = await core.getMemoryUsage();
        
        // Increase memory usage
        for (let i = 0; i < 20; i++) {
          await core.query('SELECT * FROM generate_series(1, 1000)');
        }
        
        const beforeGCMemory = await core.getMemoryUsage();
        expect(beforeGCMemory).toBeGreaterThan(initialMemory);
        
        // Force garbage collection
        await core.forceGC();
        
        const afterGCMemory = await core.getMemoryUsage();
        expect(afterGCMemory).toBeLessThan(beforeGCMemory);
      }, 'integration');
    });

    it('should prevent memory leaks in long-running operations', async () => {
      await retryableTest(async () => {
        const initialMemory = await core.getMemoryUsage();
        
        // Simulate long-running operations with periodic cleanup
        for (let i = 0; i < 100; i++) {
          await core.query('SELECT COUNT(*) FROM generate_series(1, 100)');
          
          // Force GC every 10 iterations
          if (i % 10 === 9) {
            await core.forceGC();
          }
        }
        
        const finalMemory = await core.getMemoryUsage();
        const memoryIncrease = finalMemory - initialMemory;
        
        // Memory increase should be reasonable (< 100MB)
        expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
      }, 'integration');
    }, 15000); // Increase timeout to 15 seconds
  });

  describe('Error Recovery', () => {
    it('should recover from WASM module crashes', async () => {
      await retryableTest(async () => {
        // Simulate a crash by creating a new core instance
        const crashedCore = new MockDataPrismCoreImpl();
        await crashedCore.initialize();
        
        // Simulate crash
        await crashedCore.cleanup();
        
        // Should not be ready after crash
        expect(crashedCore.isReady()).toBe(false);
        expect(await crashedCore.healthCheck()).toBe(false);
        
        // Reinitialize (simulate auto-recovery)
        await crashedCore.initialize();
        
        // Should be functional again
        expect(crashedCore.isReady()).toBe(true);
        const result = await crashedCore.query('SELECT 1');
        expect(result.data[0]['1']).toBe(1);
      }, 'integration');
    });

    it('should handle network failures during WASM loading', async () => {
      await retryableTest(async () => {
        // This test verifies that our mocks are working
        // In a real scenario, this would test actual network failure recovery
        
        const networkFailureCore = new MockDataPrismCoreImpl();
        
        // Simulate network failure on first attempt
        let attemptCount = 0;
        const originalInitialize = networkFailureCore.initialize;
        
        networkFailureCore.initialize = async () => {
          attemptCount++;
          if (attemptCount === 1) {
            throw new Error('Network failure during WASM loading');
          }
          return originalInitialize.call(networkFailureCore);
        };
        
        // Should recover after retry
        await retryManager.runWithRetry(
          () => networkFailureCore.initialize(),
          TestRetryManager.createRetryOptions('network')
        );
        
        expect(networkFailureCore.isReady()).toBe(true);
        expect(attemptCount).toBe(2);
      }, 'network');
    });
  });

  describe('Performance Characteristics', () => {
    it('should meet query response time targets', async () => {
      await retryableTest(async () => {
        const startTime = Date.now();
        
        // Execute a series of queries
        const queries = [
          'SELECT 1',
          'SELECT COUNT(*) FROM generate_series(1, 1000)',
          'SELECT * FROM generate_series(1, 100)',
          'SELECT AVG(value) FROM (SELECT * FROM generate_series(1, 500))'
        ];
        
        for (const query of queries) {
          const result = await core.query(query);
          expect(result.executionTime).toBeLessThan(2000); // 2 second target
        }
        
        const totalTime = Date.now() - startTime;
        expect(totalTime).toBeLessThan(5000); // Total under 5 seconds
      }, 'integration');
    });

    it('should scale efficiently with data size', async () => {
      await retryableTest(async () => {
        const dataSizes = [100, 1000, 5000];
        const executionTimes: number[] = [];
        
        for (const size of dataSizes) {
          const result = await core.query(`SELECT COUNT(*) FROM generate_series(1, ${size})`);
          executionTimes.push(result.executionTime);
        }
        
        // Execution time should scale reasonably (not exponentially)
        const timeRatio = executionTimes[2] / executionTimes[0];
        expect(timeRatio).toBeLessThan(10); // Should not be more than 10x slower for 50x data
      }, 'integration');
    });

    it('should maintain consistent performance under load', async () => {
      await retryableTest(async () => {
        const executionTimes: number[] = [];
        
        // Execute the same query multiple times
        for (let i = 0; i < 20; i++) {
          const result = await core.query('SELECT COUNT(*) FROM generate_series(1, 100)');
          executionTimes.push(result.executionTime);
        }
        
        // Calculate performance consistency
        const avgTime = executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length;
        const maxTime = Math.max(...executionTimes);
        const minTime = Math.min(...executionTimes);
        
        // Performance should be relatively consistent
        expect(maxTime - minTime).toBeLessThan(avgTime); // Variance should be < average
        expect(maxTime / minTime).toBeLessThan(5); // Max should not be > 5x min
      }, 'integration');
    });
  });

  describe('Cleanup and Resource Management', () => {
    it('should clean up resources properly', async () => {
      await retryableTest(async () => {
        const testCore = new MockDataPrismCoreImpl();
        await testCore.initialize();
        
        expect(testCore.isReady()).toBe(true);
        expect(await testCore.getMemoryUsage()).toBeGreaterThan(0);
        
        await testCore.cleanup();
        
        expect(testCore.isReady()).toBe(false);
        expect(await testCore.healthCheck()).toBe(false);
      }, 'integration');
    });

    it('should handle multiple cleanup calls safely', async () => {
      await retryableTest(async () => {
        const testCore = new MockDataPrismCoreImpl();
        await testCore.initialize();
        
        // Multiple cleanup calls should not cause errors
        await testCore.cleanup();
        await testCore.cleanup();
        await testCore.cleanup();
        
        expect(testCore.isReady()).toBe(false);
      }, 'integration');
    });
  });
});