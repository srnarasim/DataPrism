import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DataPrismEngine } from '../src/engine.js';

describe('DataPrismEngine', () => {
  let engine: DataPrismEngine;

  beforeEach(async () => {
    engine = new DataPrismEngine({
      enableWasmOptimizations: false, // Disable for testing without WASM
      maxMemoryMB: 1024,
      queryTimeoutMs: 10000,
      logLevel: 'error' // Reduce log noise in tests
    });
    await engine.initialize();
  });

  afterEach(async () => {
    await engine.close();
  });

  it('should initialize successfully', async () => {
    expect(engine).toBeDefined();
    const status = engine.getStatus();
    expect(status.initialized).toBe(true);
    expect(status.duckdbConnected).toBe(true);
  });

  it('should load and query data', async () => {
    const testData = [
      { id: 1, name: 'Alice', value: 100 },
      { id: 2, name: 'Bob', value: 200 },
      { id: 3, name: 'Charlie', value: 300 }
    ];

    await engine.loadData(testData, 'test_table');
    
    const result = await engine.query('SELECT * FROM test_table WHERE value > 150');
    
    expect(result.data).toHaveLength(2);
    expect(result.metadata.rowCount).toBe(2);
    expect(result.metadata.executionTime).toBeGreaterThan(0);
    expect(result.data[0]).toHaveProperty('name');
    expect(result.data[1].value).toBeGreaterThan(150);
  });

  it('should handle query errors gracefully', async () => {
    const result = await engine.query('INVALID SQL SYNTAX');
    
    expect(result.error).toBeDefined();
    expect(result.data).toHaveLength(0);
    expect(result.metadata.rowCount).toBe(0);
  });

  it('should meet performance targets for medium datasets', async () => {
    const testData = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      value: Math.random() * 1000,
      category: `cat_${i % 10}`
    }));

    await engine.loadData(testData, 'perf_test');
    
    const startTime = performance.now();
    const result = await engine.query('SELECT category, COUNT(*) as count, AVG(value) as avg_value FROM perf_test GROUP BY category');
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(2000); // <2 seconds
    expect(result.data).toHaveLength(10); // 10 categories
    expect(result.metadata.rowCount).toBe(10);
  });

  it('should manage tables correctly', async () => {
    // Create a table with schema
    await engine.createTable('schema_test', {
      id: 'INTEGER',
      name: 'VARCHAR',
      score: 'DOUBLE'
    });

    const tables = await engine.listTables();
    expect(tables).toContain('schema_test');

    const tableInfo = await engine.getTableInfo('schema_test');
    expect(tableInfo).toHaveLength(3); // 3 columns
    expect(tableInfo.some(col => col.column_name === 'id')).toBe(true);
  });

  it('should track performance metrics', async () => {
    const testData = [{ id: 1, value: 100 }];
    await engine.loadData(testData, 'metrics_test');
    
    // Perform some queries
    await engine.query('SELECT * FROM metrics_test');
    await engine.query('SELECT COUNT(*) FROM metrics_test');
    
    const metrics = engine.getMetrics();
    expect(metrics.queryCount).toBeGreaterThan(0);
    expect(metrics.totalExecutionTime).toBeGreaterThan(0);
    expect(metrics.averageResponseTime).toBeGreaterThan(0);
  });

  it('should provide engine status information', async () => {
    const status = engine.getStatus();
    
    expect(status.initialized).toBe(true);
    expect(status.duckdbConnected).toBe(true);
    expect(status.memoryUsage).toBeGreaterThanOrEqual(0);
    expect(status.uptime).toBeGreaterThan(0);
  });

  it('should handle large datasets within memory constraints', async () => {
    // Test with 100k records (smaller than 1M for test speed)
    const testData = Array.from({ length: 100000 }, (_, i) => ({
      id: i,
      value: Math.random() * 1000,
      timestamp: Date.now() + i
    }));

    await engine.loadData(testData, 'large_test');
    
    const result = await engine.query('SELECT COUNT(*) as total FROM large_test WHERE value > 500');
    
    expect(result.data[0].total).toBeGreaterThan(0);
    expect(result.metadata.executionTime).toBeLessThan(5000); // 5 seconds max
    
    // Check memory usage is reasonable
    const memoryUsage = engine.getMemoryUsage();
    expect(memoryUsage).toBeLessThan(1024 * 1024 * 1024); // Less than 1GB
  });

  it('should handle concurrent queries', async () => {
    const testData = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      group: i % 5,
      value: Math.random() * 100
    }));

    await engine.loadData(testData, 'concurrent_test');

    // Execute multiple queries concurrently
    const queries = [
      engine.query('SELECT COUNT(*) FROM concurrent_test'),
      engine.query('SELECT AVG(value) FROM concurrent_test'),
      engine.query('SELECT group, COUNT(*) FROM concurrent_test GROUP BY group'),
      engine.query('SELECT MAX(value), MIN(value) FROM concurrent_test')
    ];

    const results = await Promise.all(queries);
    
    // All queries should succeed
    results.forEach(result => {
      expect(result.error).toBeUndefined();
      expect(result.data.length).toBeGreaterThan(0);
    });
  });
});