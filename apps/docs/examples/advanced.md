# Advanced Examples

Explore advanced DataPrism Core features and patterns for complex analytical workloads, performance optimization, and enterprise-grade implementations.

## Overview

This section covers:
- Complex data processing workflows
- Performance optimization techniques
- Real-time streaming analytics
- Advanced visualization patterns
- Enterprise integration examples
- Memory optimization strategies

## Complex Data Processing

### Multi-table Joins and Aggregations

```typescript
import { DataPrismEngine } from "@dataprism/core";

async function complexAnalysis() {
  const engine = new DataPrismEngine();
  await engine.initialize();
  
  // Load multiple related datasets
  const salesData = await loadSalesData();
  const customerData = await loadCustomerData();
  const productData = await loadProductData();
  const regionData = await loadRegionData();
  
  await engine.loadData(salesData, "sales");
  await engine.loadData(customerData, "customers");
  await engine.loadData(productData, "products");
  await engine.loadData(regionData, "regions");
  
  // Complex analytical query
  const result = await engine.query(`
    WITH monthly_sales AS (
      SELECT 
        DATE_TRUNC('month', s.sale_date) as month,
        p.category,
        r.region_name,
        SUM(s.amount) as total_sales,
        COUNT(*) as transaction_count,
        AVG(s.amount) as avg_transaction
      FROM sales s
      JOIN products p ON s.product_id = p.id
      JOIN customers c ON s.customer_id = c.id
      JOIN regions r ON c.region_id = r.id
      WHERE s.sale_date >= '2024-01-01'
      GROUP BY DATE_TRUNC('month', s.sale_date), p.category, r.region_name
    ),
    ranked_categories AS (
      SELECT 
        month,
        region_name,
        category,
        total_sales,
        ROW_NUMBER() OVER (PARTITION BY month, region_name ORDER BY total_sales DESC) as rank
      FROM monthly_sales
    )
    SELECT 
      month,
      region_name,
      category,
      total_sales,
      ROUND(total_sales / LAG(total_sales) OVER (PARTITION BY region_name, category ORDER BY month) * 100 - 100, 2) as growth_rate
    FROM ranked_categories
    WHERE rank <= 3
    ORDER BY month, region_name, rank
  `);
  
  return result;
}
```

### Window Functions and Time Series Analysis

```typescript
async function timeSeriesAnalysis() {
  const engine = new DataPrismEngine();
  await engine.initialize();
  
  // Load time series data
  const timeSeriesData = await loadTimeSeriesData();
  await engine.loadData(timeSeriesData, "metrics");
  
  // Advanced time series analysis
  const result = await engine.query(`
    WITH time_series_metrics AS (
      SELECT 
        timestamp,
        metric_value,
        -- Moving averages
        AVG(metric_value) OVER (
          ORDER BY timestamp 
          ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
        ) as moving_avg_7d,
        AVG(metric_value) OVER (
          ORDER BY timestamp 
          ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
        ) as moving_avg_30d,
        
        -- Percentage change
        (metric_value - LAG(metric_value) OVER (ORDER BY timestamp)) / 
        LAG(metric_value) OVER (ORDER BY timestamp) * 100 as pct_change,
        
        -- Volatility (rolling standard deviation)
        STDDEV(metric_value) OVER (
          ORDER BY timestamp 
          ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
        ) as volatility_30d,
        
        -- Rank within month
        RANK() OVER (
          PARTITION BY DATE_TRUNC('month', timestamp) 
          ORDER BY metric_value DESC
        ) as monthly_rank
      FROM metrics
    ),
    anomaly_detection AS (
      SELECT 
        *,
        -- Z-score for anomaly detection
        (metric_value - moving_avg_30d) / NULLIF(volatility_30d, 0) as z_score,
        -- Trend detection
        CASE 
          WHEN moving_avg_7d > moving_avg_30d THEN 'upward'
          WHEN moving_avg_7d < moving_avg_30d THEN 'downward'
          ELSE 'stable'
        END as trend
      FROM time_series_metrics
    )
    SELECT 
      *,
      CASE 
        WHEN ABS(z_score) > 2 THEN 'anomaly'
        WHEN ABS(z_score) > 1.5 THEN 'warning'
        ELSE 'normal'
      END as anomaly_status
    FROM anomaly_detection
    ORDER BY timestamp DESC
  `);
  
  return result;
}
```

## Performance Optimization

### Large Dataset Processing

```typescript
async function optimizedLargeDatasetProcessing() {
  const engine = new DataPrismEngine({
    duckdbOptions: {
      maxMemory: "4GB",
      threadsCount: 8
    },
    queryTimeout: 300000, // 5 minutes
    enableQueryCache: true
  });
  
  await engine.initialize();
  
  // Load large dataset in chunks
  const chunkSize = 100000;
  const totalRows = 10000000;
  
  console.log("Loading large dataset...");
  
  for (let i = 0; i < totalRows; i += chunkSize) {
    const chunk = await generateDataChunk(i, Math.min(chunkSize, totalRows - i));
    
    if (i === 0) {
      // Create table with first chunk
      await engine.loadData(chunk, "large_dataset", {
        createIndexes: [
          { name: "idx_timestamp", columns: ["timestamp"] },
          { name: "idx_category", columns: ["category"] },
          { name: "idx_user_id", columns: ["user_id"] }
        ]
      });
    } else {
      // Append subsequent chunks
      await engine.query(`
        INSERT INTO large_dataset 
        SELECT * FROM (VALUES ${chunk.map(row => 
          `(${row.id}, '${row.timestamp}', '${row.category}', ${row.user_id}, ${row.value})`
        ).join(', ')})
      `);
    }
    
    console.log(`Loaded ${Math.min(i + chunkSize, totalRows)} / ${totalRows} rows`);
  }
  
  // Optimize table after loading
  await engine.query("ANALYZE large_dataset");
  
  // Run optimized queries
  const result = await engine.query(`
    SELECT 
      category,
      COUNT(*) as record_count,
      AVG(value) as avg_value,
      MIN(value) as min_value,
      MAX(value) as max_value,
      STDDEV(value) as stddev_value
    FROM large_dataset
    WHERE timestamp >= '2024-01-01'
    GROUP BY category
    ORDER BY record_count DESC
  `);
  
  return result;
}
```

### Memory-Efficient Processing

```typescript
async function memoryEfficientProcessing() {
  const engine = new DataPrismEngine({
    duckdbOptions: {
      maxMemory: "2GB",
      useTemporaryDirectory: true
    }
  });
  
  await engine.initialize();
  
  // Use streaming processing for large datasets
  const streamProcessor = async function* (data: any[]) {
    const batchSize = 10000;
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      // Process batch
      const processed = batch.map(item => ({
        ...item,
        processed_at: Date.now(),
        hash: calculateHash(item)
      }));
      
      yield processed;
    }
  };
  
  // Process in streaming fashion
  const largeDataset = await loadLargeDataset();
  const results = [];
  
  for await (const batch of streamProcessor(largeDataset)) {
    // Load batch into temporary table
    await engine.loadData(batch, "temp_batch", { replaceTable: true });
    
    // Process batch
    const batchResult = await engine.query(`
      SELECT 
        category,
        COUNT(*) as count,
        SUM(value) as total
      FROM temp_batch
      GROUP BY category
    `);
    
    results.push(...batchResult.data);
  }
  
  // Aggregate final results
  const finalResult = aggregateResults(results);
  return finalResult;
}
```

## Real-time Streaming Analytics

### WebSocket Data Streaming

```typescript
class StreamingAnalytics {
  private engine: DataPrismEngine;
  private buffer: any[] = [];
  private bufferSize = 1000;
  private lastFlush = Date.now();
  
  constructor() {
    this.engine = new DataPrismEngine();
  }
  
  async initialize() {
    await this.engine.initialize();
    
    // Create streaming table
    await this.engine.createTable("streaming_data", {
      columns: [
        { name: "id", type: "INTEGER", nullable: false },
        { name: "timestamp", type: "TIMESTAMP", nullable: false },
        { name: "event_type", type: "VARCHAR(50)", nullable: false },
        { name: "user_id", type: "INTEGER", nullable: false },
        { name: "properties", type: "JSON", nullable: true }
      ],
      primaryKey: ["id"],
      indexes: [
        { name: "idx_timestamp", columns: ["timestamp"] },
        { name: "idx_event_type", columns: ["event_type"] },
        { name: "idx_user_id", columns: ["user_id"] }
      ]
    });
  }
  
  async processStreamingData(data: any) {
    // Add to buffer
    this.buffer.push({
      id: data.id,
      timestamp: new Date(data.timestamp),
      event_type: data.event_type,
      user_id: data.user_id,
      properties: JSON.stringify(data.properties)
    });
    
    // Flush buffer if needed
    if (this.buffer.length >= this.bufferSize || 
        Date.now() - this.lastFlush > 5000) {
      await this.flushBuffer();
    }
  }
  
  private async flushBuffer() {
    if (this.buffer.length === 0) return;
    
    // Insert buffered data
    await this.engine.query(`
      INSERT INTO streaming_data (id, timestamp, event_type, user_id, properties)
      VALUES ${this.buffer.map(item => 
        `(${item.id}, '${item.timestamp.toISOString()}', '${item.event_type}', ${item.user_id}, '${item.properties}')`
      ).join(', ')}
    `);
    
    // Clear buffer
    this.buffer = [];
    this.lastFlush = Date.now();
    
    // Run real-time analytics
    await this.runRealTimeAnalytics();
  }
  
  private async runRealTimeAnalytics() {
    // Real-time event counting
    const eventCounts = await this.engine.query(`
      SELECT 
        event_type,
        COUNT(*) as count,
        COUNT(DISTINCT user_id) as unique_users
      FROM streaming_data
      WHERE timestamp >= NOW() - INTERVAL '5 minutes'
      GROUP BY event_type
      ORDER BY count DESC
    `);
    
    // Active users in last hour
    const activeUsers = await this.engine.query(`
      SELECT 
        COUNT(DISTINCT user_id) as active_users,
        COUNT(*) as total_events
      FROM streaming_data
      WHERE timestamp >= NOW() - INTERVAL '1 hour'
    `);
    
    // Emit results
    this.emitAnalytics({
      eventCounts: eventCounts.data,
      activeUsers: activeUsers.data[0],
      timestamp: new Date()
    });
  }
  
  private emitAnalytics(data: any) {
    // Emit to WebSocket, EventEmitter, etc.
    console.log('Real-time analytics:', data);
  }
}

// Usage
const analytics = new StreamingAnalytics();
await analytics.initialize();

// WebSocket connection
const ws = new WebSocket('ws://your-streaming-endpoint');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  analytics.processStreamingData(data);
};
```

## Advanced Visualization Patterns

### Interactive Dashboard Creation

```typescript
class InteractiveDashboard {
  private engine: DataPrismEngine;
  private charts: Map<string, any> = new Map();
  
  constructor() {
    this.engine = new DataPrismEngine();
  }
  
  async initialize() {
    await this.engine.initialize();
    
    // Load dashboard data
    const salesData = await loadSalesData();
    const customerData = await loadCustomerData();
    const productData = await loadProductData();
    
    await this.engine.loadData(salesData, "sales");
    await this.engine.loadData(customerData, "customers");
    await this.engine.loadData(productData, "products");
  }
  
  async createDashboard(container: HTMLElement) {
    // Create dashboard layout
    const dashboard = document.createElement('div');
    dashboard.className = 'dashboard';
    
    // Create filters
    const filters = this.createFilters();
    dashboard.appendChild(filters);
    
    // Create charts
    const chartsContainer = document.createElement('div');
    chartsContainer.className = 'charts-container';
    
    // Revenue chart
    const revenueChart = await this.createRevenueChart();
    chartsContainer.appendChild(revenueChart);
    
    // Customer segments chart
    const segmentChart = await this.createCustomerSegmentChart();
    chartsContainer.appendChild(segmentChart);
    
    // Product performance chart
    const productChart = await this.createProductPerformanceChart();
    chartsContainer.appendChild(productChart);
    
    // Geographic distribution
    const geoChart = await this.createGeographicChart();
    chartsContainer.appendChild(geoChart);
    
    dashboard.appendChild(chartsContainer);
    container.appendChild(dashboard);
    
    // Setup interactivity
    this.setupInteractivity();
  }
  
  private createFilters(): HTMLElement {
    const filters = document.createElement('div');
    filters.className = 'filters';
    
    // Date range filter
    const dateFilter = document.createElement('input');
    dateFilter.type = 'date';
    dateFilter.addEventListener('change', () => this.updateCharts());
    
    // Category filter
    const categoryFilter = document.createElement('select');
    categoryFilter.addEventListener('change', () => this.updateCharts());
    
    filters.appendChild(dateFilter);
    filters.appendChild(categoryFilter);
    
    return filters;
  }
  
  private async createRevenueChart(): Promise<HTMLElement> {
    const data = await this.engine.query(`
      SELECT 
        DATE_TRUNC('month', sale_date) as month,
        SUM(amount) as revenue
      FROM sales
      WHERE sale_date >= '2024-01-01'
      GROUP BY DATE_TRUNC('month', sale_date)
      ORDER BY month
    `);
    
    const chart = this.createChart('line', data.data, {
      title: 'Monthly Revenue',
      x: 'month',
      y: 'revenue'
    });
    
    this.charts.set('revenue', chart);
    return chart;
  }
  
  private async createCustomerSegmentChart(): Promise<HTMLElement> {
    const data = await this.engine.query(`
      WITH customer_stats AS (
        SELECT 
          customer_id,
          COUNT(*) as order_count,
          SUM(amount) as total_spent,
          AVG(amount) as avg_order_value
        FROM sales
        GROUP BY customer_id
      )
      SELECT 
        CASE 
          WHEN total_spent > 5000 THEN 'High Value'
          WHEN total_spent > 1000 THEN 'Medium Value'
          ELSE 'Low Value'
        END as segment,
        COUNT(*) as customer_count,
        AVG(total_spent) as avg_spent
      FROM customer_stats
      GROUP BY segment
      ORDER BY avg_spent DESC
    `);
    
    const chart = this.createChart('pie', data.data, {
      title: 'Customer Segments',
      value: 'customer_count',
      label: 'segment'
    });
    
    this.charts.set('segments', chart);
    return chart;
  }
  
  private async createProductPerformanceChart(): Promise<HTMLElement> {
    const data = await this.engine.query(`
      SELECT 
        p.name as product_name,
        p.category,
        SUM(s.quantity) as units_sold,
        SUM(s.amount) as revenue,
        AVG(s.amount / s.quantity) as avg_price
      FROM sales s
      JOIN products p ON s.product_id = p.id
      GROUP BY p.name, p.category
      ORDER BY revenue DESC
      LIMIT 20
    `);
    
    const chart = this.createChart('bar', data.data, {
      title: 'Top Products by Revenue',
      x: 'product_name',
      y: 'revenue'
    });
    
    this.charts.set('products', chart);
    return chart;
  }
  
  private async createGeographicChart(): Promise<HTMLElement> {
    const data = await this.engine.query(`
      SELECT 
        c.city,
        c.state,
        COUNT(*) as customer_count,
        SUM(s.amount) as total_sales
      FROM sales s
      JOIN customers c ON s.customer_id = c.id
      GROUP BY c.city, c.state
      ORDER BY total_sales DESC
    `);
    
    const chart = this.createChart('map', data.data, {
      title: 'Sales by Geography',
      location: 'city',
      value: 'total_sales'
    });
    
    this.charts.set('geography', chart);
    return chart;
  }
  
  private createChart(type: string, data: any[], options: any): HTMLElement {
    // Implementation depends on charting library
    const container = document.createElement('div');
    container.className = 'chart-container';
    
    // Create chart using your preferred library (D3.js, Chart.js, etc.)
    // This is a simplified example
    
    return container;
  }
  
  private setupInteractivity() {
    // Setup cross-filtering between charts
    this.charts.forEach((chart, key) => {
      chart.addEventListener('select', (event) => {
        this.handleChartSelection(key, event.detail);
      });
    });
  }
  
  private handleChartSelection(chartKey: string, selection: any) {
    // Update other charts based on selection
    console.log(`Selection in ${chartKey}:`, selection);
    // Implement cross-filtering logic
  }
  
  private async updateCharts() {
    // Update all charts based on current filters
    for (const [key, chart] of this.charts) {
      await this.updateChart(key, chart);
    }
  }
  
  private async updateChart(key: string, chart: HTMLElement) {
    // Re-query data and update chart
    // Implementation depends on chart type
  }
}
```

## Enterprise Integration

### Database Integration

```typescript
class DatabaseIntegration {
  private engine: DataPrismEngine;
  
  constructor() {
    this.engine = new DataPrismEngine();
  }
  
  async connectToDatabase(config: DatabaseConfig) {
    await this.engine.initialize();
    
    // Create database connection plugin
    const dbPlugin = new DatabasePlugin(config);
    await this.engine.registerPlugin(dbPlugin);
    
    // Test connection
    const testResult = await this.engine.executePlugin('database', 'test_connection', {});
    
    if (!testResult.success) {
      throw new Error(`Database connection failed: ${testResult.error}`);
    }
    
    return testResult;
  }
  
  async syncData(tableName: string, query: string) {
    // Fetch data from database
    const data = await this.engine.executePlugin('database', 'query', {
      query: query
    });
    
    // Load into DataPrism
    await this.engine.loadData(data.rows, tableName, {
      replaceTable: true,
      createIndexes: this.getOptimalIndexes(data.schema)
    });
    
    return {
      tableName,
      rowCount: data.rows.length,
      syncTime: Date.now()
    };
  }
  
  async incrementalSync(tableName: string, query: string, timestampColumn: string) {
    // Get last sync timestamp
    const lastSync = await this.getLastSyncTimestamp(tableName);
    
    // Fetch incremental data
    const incrementalQuery = query.replace(
      'WHERE',
      `WHERE ${timestampColumn} > '${lastSync}' AND`
    );
    
    const data = await this.engine.executePlugin('database', 'query', {
      query: incrementalQuery
    });
    
    if (data.rows.length > 0) {
      // Append new data
      await this.engine.query(`
        INSERT INTO ${tableName} 
        SELECT * FROM (VALUES ${data.rows.map(row => 
          `(${Object.values(row).map(v => `'${v}'`).join(', ')})`
        ).join(', ')})
      `);
      
      // Update sync timestamp
      await this.updateLastSyncTimestamp(tableName, Date.now());
    }
    
    return {
      tableName,
      newRows: data.rows.length,
      lastSync: Date.now()
    };
  }
  
  private getOptimalIndexes(schema: any): any[] {
    // Analyze schema and suggest optimal indexes
    const indexes = [];
    
    schema.columns.forEach(column => {
      if (column.type === 'INTEGER' || column.type === 'TIMESTAMP') {
        indexes.push({
          name: `idx_${column.name}`,
          columns: [column.name]
        });
      }
    });
    
    return indexes;
  }
  
  private async getLastSyncTimestamp(tableName: string): Promise<string> {
    // Implementation to get last sync timestamp
    return '2024-01-01 00:00:00';
  }
  
  private async updateLastSyncTimestamp(tableName: string, timestamp: number): Promise<void> {
    // Implementation to update last sync timestamp
  }
}
```

### API Integration

```typescript
class APIIntegration {
  private engine: DataPrismEngine;
  private apiCache: Map<string, any> = new Map();
  
  constructor() {
    this.engine = new DataPrismEngine();
  }
  
  async initialize() {
    await this.engine.initialize();
    
    // Register API plugin
    const apiPlugin = new APIPlugin();
    await this.engine.registerPlugin(apiPlugin);
  }
  
  async fetchAndAnalyze(endpoint: string, params: any = {}) {
    // Check cache
    const cacheKey = `${endpoint}:${JSON.stringify(params)}`;
    if (this.apiCache.has(cacheKey)) {
      return this.apiCache.get(cacheKey);
    }
    
    try {
      // Fetch data from API
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
      });
      
      const data = await response.json();
      
      // Load into DataPrism
      await this.engine.loadData(data.results, 'api_data', {
        replaceTable: true
      });
      
      // Perform analysis
      const analysis = await this.engine.query(`
        SELECT 
          COUNT(*) as total_records,
          COUNT(DISTINCT user_id) as unique_users,
          AVG(CAST(value AS FLOAT)) as avg_value,
          MIN(CAST(value AS FLOAT)) as min_value,
          MAX(CAST(value AS FLOAT)) as max_value
        FROM api_data
      `);
      
      const result = {
        data: data.results,
        analysis: analysis.data[0],
        fetchTime: Date.now()
      };
      
      // Cache result
      this.apiCache.set(cacheKey, result);
      
      return result;
      
    } catch (error) {
      console.error('API fetch error:', error);
      throw error;
    }
  }
  
  async aggregateMultipleAPIs(endpoints: string[]) {
    const results = await Promise.all(
      endpoints.map(endpoint => this.fetchAndAnalyze(endpoint))
    );
    
    // Combine results
    const combinedData = results.flatMap(result => result.data);
    
    // Load combined data
    await this.engine.loadData(combinedData, 'combined_api_data', {
      replaceTable: true
    });
    
    // Perform cross-API analysis
    const crossAnalysis = await this.engine.query(`
      SELECT 
        source_api,
        COUNT(*) as record_count,
        AVG(CAST(value AS FLOAT)) as avg_value,
        STDDEV(CAST(value AS FLOAT)) as stddev_value
      FROM combined_api_data
      GROUP BY source_api
      ORDER BY record_count DESC
    `);
    
    return {
      totalRecords: combinedData.length,
      apiCount: endpoints.length,
      crossAnalysis: crossAnalysis.data
    };
  }
}
```

## Best Practices

### Error Handling and Recovery

```typescript
class RobustAnalytics {
  private engine: DataPrismEngine;
  private retryAttempts = 3;
  private retryDelay = 1000;
  
  constructor() {
    this.engine = new DataPrismEngine();
  }
  
  async executeWithRetry<T>(operation: () => Promise<T>, context: string): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        console.warn(`${context} failed (attempt ${attempt}/${this.retryAttempts}):`, error.message);
        
        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }
    
    throw new Error(`${context} failed after ${this.retryAttempts} attempts: ${lastError.message}`);
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async safeQuery(sql: string, params: any[] = []): Promise<any> {
    return this.executeWithRetry(async () => {
      const result = await this.engine.query(sql, params);
      
      if (result.data.length === 0) {
        console.warn('Query returned no results:', sql);
      }
      
      return result;
    }, 'Query execution');
  }
}
```

### Performance Monitoring

```typescript
class PerformanceMonitor {
  private metrics: Map<string, any[]> = new Map();
  
  async measureOperation<T>(name: string, operation: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;
    
    try {
      const result = await operation();
      
      const endTime = performance.now();
      const endMemory = process.memoryUsage().heapUsed;
      
      this.recordMetric(name, {
        duration: endTime - startTime,
        memoryDelta: endMemory - startMemory,
        timestamp: Date.now(),
        success: true
      });
      
      return result;
    } catch (error) {
      this.recordMetric(name, {
        duration: performance.now() - startTime,
        memoryDelta: process.memoryUsage().heapUsed - startMemory,
        timestamp: Date.now(),
        success: false,
        error: error.message
      });
      
      throw error;
    }
  }
  
  private recordMetric(name: string, metric: any) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    this.metrics.get(name).push(metric);
  }
  
  getMetrics(name: string) {
    const metrics = this.metrics.get(name) || [];
    
    return {
      count: metrics.length,
      avgDuration: metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length,
      avgMemoryDelta: metrics.reduce((sum, m) => sum + m.memoryDelta, 0) / metrics.length,
      successRate: metrics.filter(m => m.success).length / metrics.length,
      recent: metrics.slice(-10)
    };
  }
}
```

## Next Steps

- Explore [Plugin Development](/plugins/development) for custom extensions
- See [Performance Guide](/guide/performance) for optimization strategies
- Check [API Reference](/api/core) for complete method documentation
- Review [Basic Examples](/examples/basic) for foundational patterns

## Contributing

Found an issue or have a suggestion? Please contribute to our [GitHub repository](https://github.com/srnarasim/DataPrism).

## License

MIT License. See [LICENSE](https://github.com/srnarasim/DataPrism/blob/main/LICENSE) for details.