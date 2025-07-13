import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DuckDBManager } from '../src/duckdb-manager.js';

describe('DuckDBManager', () => {
  let manager: DuckDBManager;

  beforeEach(async () => {
    manager = new DuckDBManager();
    await manager.initialize();
  });

  afterEach(async () => {
    await manager.close();
  });

  it('should initialize successfully', async () => {
    expect(manager.isInitialized()).toBe(true);
  });

  it('should execute basic SQL queries', async () => {
    const result = await manager.query('SELECT 1 as test_value');
    
    expect(result.data).toHaveLength(1);
    expect(result.data[0].test_value).toBe(1);
    expect(result.metadata.rowCount).toBe(1);
    expect(result.metadata.executionTime).toBeGreaterThan(0);
  });

  it('should handle data insertion and querying', async () => {
    const testData = [
      { name: 'Alice', age: 30, city: 'New York' },
      { name: 'Bob', age: 25, city: 'Boston' },
      { name: 'Charlie', age: 35, city: 'Chicago' }
    ];

    await manager.insertData('users', testData);
    
    const result = await manager.query('SELECT * FROM users WHERE age > 28');
    expect(result.data).toHaveLength(2);
    expect(result.data.every(row => row.age > 28)).toBe(true);
  });

  it('should handle complex analytical queries', async () => {
    const salesData = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      product: `Product_${i % 10}`,
      amount: Math.random() * 1000,
      date: `2024-01-${String((i % 30) + 1).padStart(2, '0')}`
    }));

    await manager.insertData('sales', salesData);
    
    const result = await manager.query(`
      SELECT 
        product,
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount
      FROM sales 
      GROUP BY product 
      ORDER BY total_amount DESC
    `);

    expect(result.data).toHaveLength(10); // 10 products
    expect(result.data[0]).toHaveProperty('transaction_count');
    expect(result.data[0]).toHaveProperty('total_amount');
    expect(result.data[0]).toHaveProperty('avg_amount');
  });

  it('should handle table management operations', async () => {
    // Create table with explicit schema
    await manager.createTable('test_schema', {
      id: 'INTEGER PRIMARY KEY',
      name: 'VARCHAR(100)',
      score: 'DOUBLE',
      active: 'BOOLEAN'
    });

    const tables = await manager.listTables();
    expect(tables).toContain('test_schema');

    const tableInfo = await manager.getTableInfo('test_schema');
    expect(tableInfo).toHaveLength(4); // 4 columns
    
    const columnNames = tableInfo.map(col => col.column_name);
    expect(columnNames).toContain('id');
    expect(columnNames).toContain('name');
    expect(columnNames).toContain('score');
    expect(columnNames).toContain('active');
  });

  it('should handle SQL errors gracefully', async () => {
    const result = await manager.query('SELECT * FROM non_existent_table');
    
    expect(result.error).toBeDefined();
    expect(result.data).toHaveLength(0);
    expect(result.metadata.rowCount).toBe(0);
    expect(result.error?.source).toBe('duckdb');
  });

  it('should handle date and time operations', async () => {
    const timeData = [
      { event: 'start', timestamp: '2024-01-15 10:30:00' },
      { event: 'middle', timestamp: '2024-01-15 14:45:00' },
      { event: 'end', timestamp: '2024-01-15 18:20:00' }
    ];

    await manager.insertData('events', timeData);
    
    const result = await manager.query(`
      SELECT 
        event,
        timestamp::timestamp as parsed_time,
        EXTRACT(hour FROM timestamp::timestamp) as hour
      FROM events 
      ORDER BY timestamp
    `);

    expect(result.data).toHaveLength(3);
    expect(result.data[0].hour).toBe(10);
    expect(result.data[1].hour).toBe(14);
    expect(result.data[2].hour).toBe(18);
  });

  it('should perform aggregation queries efficiently', async () => {
    const largeDataset = Array.from({ length: 50000 }, (_, i) => ({
      category: `Category_${i % 100}`,
      value: Math.random() * 1000,
      region: `Region_${i % 5}`
    }));

    await manager.insertData('large_analysis', largeDataset);
    
    const startTime = performance.now();
    const result = await manager.query(`
      SELECT 
        category,
        region,
        COUNT(*) as count,
        SUM(value) as total,
        AVG(value) as average,
        MIN(value) as minimum,
        MAX(value) as maximum
      FROM large_analysis 
      GROUP BY category, region
      HAVING COUNT(*) > 5
      ORDER BY total DESC
      LIMIT 20
    `);
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(1000); // Should be fast
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data.length).toBeLessThanOrEqual(20);
    
    // Verify all rows meet the HAVING condition
    expect(result.data.every(row => row.count > 5)).toBe(true);
  });

  it('should handle JSON data operations', async () => {
    const jsonData = [
      { 
        id: 1, 
        metadata: JSON.stringify({ tags: ['urgent', 'important'], score: 95 }) 
      },
      { 
        id: 2, 
        metadata: JSON.stringify({ tags: ['normal'], score: 75 }) 
      }
    ];

    await manager.insertData('json_test', jsonData);
    
    // Test JSON parsing in DuckDB
    const result = await manager.query(`
      SELECT 
        id,
        JSON_EXTRACT(metadata, '$.score') as score,
        JSON_EXTRACT(metadata, '$.tags[0]') as first_tag
      FROM json_test
      WHERE JSON_EXTRACT(metadata, '$.score')::INTEGER > 80
    `);

    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe(1);
    expect(parseInt(result.data[0].score)).toBe(95);
  });
});