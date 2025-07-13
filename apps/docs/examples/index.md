# Examples

Learn DataPrism Core through practical examples. Each example includes complete, runnable code that you can copy and adapt for your own projects.

## Quick Examples

### Hello World

The simplest possible DataPrism Core application:

```typescript
import { DataPrismEngine } from '@dataprism/core';

async function helloWorld() {
  // Initialize the engine
  const engine = new DataPrismEngine();
  await engine.initialize();
  
  // Execute a simple query
  const result = await engine.query('SELECT 1 as hello, 2 as world');
  console.log(result.data); // [{ hello: 1, world: 2 }]
}

helloWorld();
```

### Loading Data

Load data from various sources:

::: code-group

```typescript [Array of Objects]
const salesData = [
  { date: '2024-01-01', product: 'Widget A', revenue: 1500 },
  { date: '2024-01-02', product: 'Widget B', revenue: 2300 }
];

await engine.loadData(salesData, 'sales');
```

```typescript [CSV String]
const csvData = `date,product,revenue
2024-01-01,Widget A,1500
2024-01-02,Widget B,2300`;

await engine.loadCSV(csvData, 'sales');
```

```typescript [File Upload]
const fileInput = document.querySelector('#file-input');
fileInput.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  const csvText = await file.text();
  await engine.loadCSV(csvText, 'uploaded_data');
});
```

:::

### Basic Queries

Common SQL query patterns:

```typescript
// Aggregation
const summary = await engine.query(`
  SELECT 
    product,
    SUM(revenue) as total_revenue,
    COUNT(*) as transaction_count,
    AVG(revenue) as avg_revenue
  FROM sales 
  GROUP BY product 
  ORDER BY total_revenue DESC
`);

// Filtering and sorting
const recentSales = await engine.query(`
  SELECT * FROM sales 
  WHERE date >= '2024-01-01' 
  ORDER BY date DESC, revenue DESC
  LIMIT 10
`);

// Window functions
const trends = await engine.query(`
  SELECT 
    date,
    revenue,
    SUM(revenue) OVER (ORDER BY date) as running_total,
    LAG(revenue) OVER (ORDER BY date) as prev_revenue
  FROM sales 
  ORDER BY date
`);
```

## Framework Integration

### React Hook

Create a custom hook for DataPrism integration:

```typescript
// useDataPrism.ts
import { useState, useEffect, useCallback } from 'react';
import { DataPrismEngine } from '@dataprism/core';

export function useDataPrism() {
  const [engine, setEngine] = useState<DataPrismEngine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function initEngine() {
      try {
        const newEngine = new DataPrismEngine();
        await newEngine.initialize();
        setEngine(newEngine);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }
    
    initEngine();
  }, []);

  const query = useCallback(async (sql: string) => {
    if (!engine) throw new Error('Engine not initialized');
    return await engine.query(sql);
  }, [engine]);

  const loadData = useCallback(async (data: any[], tableName: string) => {
    if (!engine) throw new Error('Engine not initialized');
    return await engine.loadData(data, tableName);
  }, [engine]);

  return { engine, isLoading, error, query, loadData };
}
```

```tsx
// App.tsx
import React, { useState } from 'react';
import { useDataPrism } from './useDataPrism';

function App() {
  const { engine, isLoading, error, query, loadData } = useDataPrism();
  const [results, setResults] = useState(null);

  const runExample = async () => {
    // Load sample data
    await loadData([
      { name: 'Alice', age: 25, city: 'New York' },
      { name: 'Bob', age: 30, city: 'London' },
      { name: 'Charlie', age: 35, city: 'Tokyo' }
    ], 'users');

    // Query the data
    const result = await query('SELECT city, COUNT(*) as count FROM users GROUP BY city');
    setResults(result.data);
  };

  if (isLoading) return <div>Loading DataPrism...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>DataPrism React Example</h1>
      <button onClick={runExample}>Run Example</button>
      {results && (
        <pre>{JSON.stringify(results, null, 2)}</pre>
      )}
    </div>
  );
}
```

### Vue Composition

Vue 3 integration with composition API:

```vue
<!-- DataPrismComponent.vue -->
<template>
  <div>
    <h1>DataPrism Vue Example</h1>
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="error" class="error">{{ error.message }}</div>
    <div v-else>
      <button @click="runQuery">Execute Query</button>
      <div v-if="results" class="results">
        <h2>Results:</h2>
        <table>
          <thead>
            <tr>
              <th v-for="col in columns" :key="col">{{ col }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in results" :key="index">
              <td v-for="col in columns" :key="col">{{ row[col] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { DataPrismEngine } from '@dataprism/core';

const engine = ref<DataPrismEngine | null>(null);
const isLoading = ref(true);
const error = ref<Error | null>(null);
const results = ref<any[] | null>(null);

const columns = computed(() => {
  if (!results.value || results.value.length === 0) return [];
  return Object.keys(results.value[0]);
});

onMounted(async () => {
  try {
    const newEngine = new DataPrismEngine();
    await newEngine.initialize();
    
    // Load sample data
    await newEngine.loadData([
      { product: 'Widget A', sales: 100, region: 'North' },
      { product: 'Widget B', sales: 150, region: 'South' },
      { product: 'Widget C', sales: 200, region: 'East' }
    ], 'products');
    
    engine.value = newEngine;
  } catch (err) {
    error.value = err as Error;
  } finally {
    isLoading.value = false;
  }
});

const runQuery = async () => {
  if (!engine.value) return;
  
  const result = await engine.value.query(`
    SELECT region, SUM(sales) as total_sales 
    FROM products 
    GROUP BY region 
    ORDER BY total_sales DESC
  `);
  
  results.value = result.data;
};
</script>
```

## Data Visualization

### Chart.js Integration

Create interactive charts with Chart.js:

```typescript
import { Chart } from 'chart.js/auto';
import { DataPrismEngine } from '@dataprism/core';

class DataPrismCharts {
  constructor(private engine: DataPrismEngine) {}

  async createBarChart(containerId: string, sql: string, options: {
    labelColumn: string;
    valueColumn: string;
    title?: string;
  }) {
    // Execute query
    const result = await this.engine.query(sql);
    
    // Prepare chart data
    const chartData = {
      labels: result.data.map(row => row[options.labelColumn]),
      datasets: [{
        label: options.valueColumn,
        data: result.data.map(row => row[options.valueColumn]),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    };

    // Create chart
    const ctx = document.getElementById(containerId) as HTMLCanvasElement;
    return new Chart(ctx, {
      type: 'bar',
      data: chartData,
      options: {
        responsive: true,
        plugins: {
          title: {
            display: !!options.title,
            text: options.title
          }
        }
      }
    });
  }

  async createLineChart(containerId: string, sql: string, options: {
    xColumn: string;
    yColumn: string;
    title?: string;
  }) {
    const result = await this.engine.query(sql);
    
    const chartData = {
      labels: result.data.map(row => row[options.xColumn]),
      datasets: [{
        label: options.yColumn,
        data: result.data.map(row => row[options.yColumn]),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      }]
    };

    const ctx = document.getElementById(containerId) as HTMLCanvasElement;
    return new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        plugins: {
          title: {
            display: !!options.title,
            text: options.title
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}

// Usage example
async function createDashboard() {
  const engine = new DataPrismEngine();
  await engine.initialize();
  
  // Load sample data
  await engine.loadData(salesData, 'sales');
  
  const charts = new DataPrismCharts(engine);
  
  // Create revenue by region chart
  await charts.createBarChart('revenue-chart', `
    SELECT region, SUM(revenue) as total_revenue 
    FROM sales 
    GROUP BY region
  `, {
    labelColumn: 'region',
    valueColumn: 'total_revenue',
    title: 'Revenue by Region'
  });
  
  // Create sales trend chart
  await charts.createLineChart('trend-chart', `
    SELECT date, SUM(revenue) as daily_revenue 
    FROM sales 
    GROUP BY date 
    ORDER BY date
  `, {
    xColumn: 'date',
    yColumn: 'daily_revenue',
    title: 'Daily Sales Trend'
  });
}
```

### D3.js Integration

For more advanced visualizations with D3.js:

```typescript
import * as d3 from 'd3';
import { DataPrismEngine } from '@dataprism/core';

class D3DataPrismViz {
  constructor(private engine: DataPrismEngine) {}

  async createScatterPlot(containerId: string, sql: string, options: {
    xColumn: string;
    yColumn: string;
    colorColumn?: string;
    width?: number;
    height?: number;
  }) {
    const result = await this.engine.query(sql);
    const data = result.data;
    
    const width = options.width || 800;
    const height = options.height || 600;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    
    // Create SVG
    const svg = d3.select(`#${containerId}`)
      .append('svg')
      .attr('width', width)
      .attr('height', height);
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d[options.xColumn]))
      .range([margin.left, width - margin.right]);
    
    const yScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d[options.yColumn]))
      .range([height - margin.bottom, margin.top]);
    
    const colorScale = options.colorColumn 
      ? d3.scaleOrdinal(d3.schemeCategory10)
          .domain([...new Set(data.map(d => d[options.colorColumn]))])
      : () => 'steelblue';
    
    // Add circles
    svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d[options.xColumn]))
      .attr('cy', d => yScale(d[options.yColumn]))
      .attr('r', 5)
      .attr('fill', d => colorScale(d[options.colorColumn] || 'default'))
      .attr('opacity', 0.7);
    
    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));
    
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));
    
    // Add axis labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 5)
      .style('text-anchor', 'middle')
      .text(options.xColumn);
    
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 15)
      .attr('x', -(height / 2))
      .style('text-anchor', 'middle')
      .text(options.yColumn);
  }
}
```

## Performance Examples

### Large Dataset Processing

Handle millions of rows efficiently:

```typescript
async function processLargeDataset() {
  const engine = new DataPrismEngine({
    memoryLimit: '2GB',
    enableOptimizations: true
  });
  await engine.initialize();
  
  // Generate large dataset (1M rows)
  const largeDataset = Array.from({ length: 1000000 }, (_, i) => ({
    id: i + 1,
    timestamp: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    user_id: Math.floor(Math.random() * 10000),
    event_type: ['click', 'view', 'purchase'][Math.floor(Math.random() * 3)],
    value: Math.random() * 100
  }));
  
  console.time('Data Loading');
  await engine.loadData(largeDataset, 'events');
  console.timeEnd('Data Loading');
  
  // Complex aggregation query
  console.time('Complex Query');
  const result = await engine.query(`
    SELECT 
      event_type,
      DATE_TRUNC('day', timestamp) as day,
      COUNT(*) as event_count,
      COUNT(DISTINCT user_id) as unique_users,
      AVG(value) as avg_value,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY value) as median_value
    FROM events
    WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY event_type, DATE_TRUNC('day', timestamp)
    ORDER BY day, event_type
  `);
  console.timeEnd('Complex Query');
  
  console.log(`Processed ${result.data.length} rows`);
  return result;
}
```

### Batch Processing

Process data in batches for memory efficiency:

```typescript
async function batchProcessor(data: any[], batchSize = 10000) {
  const engine = new DataPrismEngine();
  await engine.initialize();
  
  const results = [];
  
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const tableName = `batch_${Math.floor(i / batchSize)}`;
    
    // Load batch
    await engine.loadData(batch, tableName);
    
    // Process batch
    const batchResult = await engine.query(`
      SELECT 
        COUNT(*) as row_count,
        AVG(value) as avg_value,
        MIN(timestamp) as min_time,
        MAX(timestamp) as max_time
      FROM ${tableName}
    `);
    
    results.push({
      batch: Math.floor(i / batchSize),
      ...batchResult.data[0]
    });
    
    // Clean up to save memory
    await engine.dropTable(tableName);
    
    console.log(`Processed batch ${Math.floor(i / batchSize) + 1}`);
  }
  
  return results;
}
```

## Advanced Examples

### Real-time Data Streaming

Simulate real-time data processing:

```typescript
class RealTimeAnalytics {
  private engine: DataPrismEngine;
  private updateInterval: number;
  
  constructor(updateIntervalMs = 1000) {
    this.updateInterval = updateIntervalMs;
  }
  
  async initialize() {
    this.engine = new DataPrismEngine();
    await this.engine.initialize();
    
    // Create initial table
    await this.engine.query(`
      CREATE TABLE live_events (
        timestamp TIMESTAMP,
        event_type VARCHAR,
        user_id INTEGER,
        value DOUBLE
      )
    `);
  }
  
  startStreaming(onUpdate: (metrics: any) => void) {
    setInterval(async () => {
      // Generate new events
      const newEvents = Array.from({ length: 100 }, () => ({
        timestamp: new Date(),
        event_type: ['click', 'view', 'purchase'][Math.floor(Math.random() * 3)],
        user_id: Math.floor(Math.random() * 1000),
        value: Math.random() * 100
      }));
      
      // Insert new events
      await this.engine.loadData(newEvents, 'temp_events');
      await this.engine.query(`
        INSERT INTO live_events 
        SELECT * FROM temp_events
      `);
      await this.engine.dropTable('temp_events');
      
      // Calculate real-time metrics
      const metrics = await this.engine.query(`
        SELECT 
          event_type,
          COUNT(*) as count_1min,
          AVG(value) as avg_value_1min
        FROM live_events 
        WHERE timestamp >= CURRENT_TIMESTAMP - INTERVAL '1 minute'
        GROUP BY event_type
      `);
      
      onUpdate(metrics.data);
      
      // Clean old data (keep last hour)
      await this.engine.query(`
        DELETE FROM live_events 
        WHERE timestamp < CURRENT_TIMESTAMP - INTERVAL '1 hour'
      `);
      
    }, this.updateInterval);
  }
}

// Usage
const analytics = new RealTimeAnalytics(5000); // Update every 5 seconds
await analytics.initialize();

analytics.startStreaming((metrics) => {
  console.log('Real-time metrics:', metrics);
  // Update your dashboard here
});
```

### Multi-table Joins

Complex data relationships:

```typescript
async function setupMultiTableExample() {
  const engine = new DataPrismEngine();
  await engine.initialize();
  
  // Load related tables
  await engine.loadData([
    { customer_id: 1, name: 'Alice', segment: 'Premium' },
    { customer_id: 2, name: 'Bob', segment: 'Standard' },
    { customer_id: 3, name: 'Charlie', segment: 'Premium' }
  ], 'customers');
  
  await engine.loadData([
    { order_id: 101, customer_id: 1, product: 'Widget A', amount: 100, date: '2024-01-01' },
    { order_id: 102, customer_id: 2, product: 'Widget B', amount: 200, date: '2024-01-02' },
    { order_id: 103, customer_id: 1, product: 'Widget C', amount: 150, date: '2024-01-03' },
    { order_id: 104, customer_id: 3, product: 'Widget A', amount: 300, date: '2024-01-04' }
  ], 'orders');
  
  await engine.loadData([
    { product: 'Widget A', category: 'Electronics', cost: 50 },
    { product: 'Widget B', category: 'Home', cost: 80 },
    { product: 'Widget C', category: 'Electronics', cost: 70 }
  ], 'products');
  
  // Complex join query
  const customerAnalysis = await engine.query(`
    SELECT 
      c.name,
      c.segment,
      COUNT(o.order_id) as order_count,
      SUM(o.amount) as total_spent,
      AVG(o.amount) as avg_order_value,
      STRING_AGG(DISTINCT p.category, ', ') as categories_purchased,
      SUM(o.amount - p.cost) as total_profit
    FROM customers c
    LEFT JOIN orders o ON c.customer_id = o.customer_id
    LEFT JOIN products p ON o.product = p.product
    GROUP BY c.customer_id, c.name, c.segment
    ORDER BY total_spent DESC
  `);
  
  console.log('Customer Analysis:', customerAnalysis.data);
  
  return customerAnalysis;
}
```

## Next Steps

These examples provide a foundation for building with DataPrism Core. For more advanced use cases:

- **[Plugin Development](/plugins/)** - Create custom functionality
- **[Performance Optimization](/guide/performance)** - Handle large datasets efficiently  
- **[API Reference](/api/)** - Complete API documentation
- **[GitHub Examples](https://github.com/dataprism/examples)** - Community examples

Have a specific use case? [Open a discussion](https://github.com/dataprism/core/discussions) and we'll help you build it!