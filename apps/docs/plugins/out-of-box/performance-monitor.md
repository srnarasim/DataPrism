# Performance Monitor Plugin

The Performance Monitor plugin provides comprehensive real-time monitoring and profiling capabilities for DataPrism Core, helping you optimize performance and track resource usage.

## Features

- **Real-time Monitoring**: Live performance metrics and resource usage
- **Query Profiling**: Detailed analysis of query execution
- **Memory Tracking**: Memory usage monitoring and leak detection
- **Performance Benchmarks**: Built-in performance testing suite
- **Historical Data**: Performance trends and historical analysis
- **Alerting**: Custom alerts for performance thresholds
- **Export Reports**: Generate performance reports in various formats

## Installation

```bash
npm install @dataprism/plugin-performance-monitor
```

## Quick Start

```typescript
import { DataPrismEngine } from "@dataprism/core";
import { createPerformanceMonitorPlugin } from "@dataprism/plugin-performance-monitor";

const engine = new DataPrismEngine();
const monitorPlugin = await createPerformanceMonitorPlugin();

// Register the plugin
engine.registerPlugin(monitorPlugin);

// Start monitoring
const monitor = await monitorPlugin.startMonitoring({
  metrics: ["cpu", "memory", "queries"],
  interval: 1000, // Update every second
  history: 3600 // Keep 1 hour of history
});

// Display real-time metrics
monitor.onUpdate((metrics) => {
  console.log("CPU Usage:", metrics.cpu.usage);
  console.log("Memory Usage:", metrics.memory.used);
  console.log("Active Queries:", metrics.queries.active);
});
```

## Performance Metrics

### System Metrics

```typescript
const monitor = await monitorPlugin.startMonitoring({
  metrics: ["system"],
  interval: 1000
});

monitor.onUpdate((metrics) => {
  const system = metrics.system;
  
  console.log("System Metrics:", {
    cpuUsage: system.cpu.usage,
    memoryUsed: system.memory.used,
    memoryTotal: system.memory.total,
    heapUsed: system.memory.heap.used,
    heapTotal: system.memory.heap.total,
    loadAverage: system.loadAverage,
    uptime: system.uptime
  });
});
```

### Query Metrics

```typescript
const monitor = await monitorPlugin.startMonitoring({
  metrics: ["queries"],
  interval: 500
});

monitor.onUpdate((metrics) => {
  const queries = metrics.queries;
  
  console.log("Query Metrics:", {
    active: queries.active,
    completed: queries.completed,
    failed: queries.failed,
    averageTime: queries.averageExecutionTime,
    slowQueries: queries.slowQueries,
    queueLength: queries.queueLength
  });
});
```

### Database Metrics

```typescript
const monitor = await monitorPlugin.startMonitoring({
  metrics: ["database"],
  interval: 2000
});

monitor.onUpdate((metrics) => {
  const db = metrics.database;
  
  console.log("Database Metrics:", {
    connections: db.connections,
    tableCount: db.tableCount,
    indexCount: db.indexCount,
    cacheHitRate: db.cache.hitRate,
    diskUsage: db.diskUsage,
    transactionRate: db.transactionRate
  });
});
```

## Query Profiling

### Profile Individual Queries

```typescript
// Profile a single query
const profile = await monitorPlugin.profileQuery({
  query: "SELECT * FROM sales WHERE amount > 1000",
  includeExecutionPlan: true,
  includeStatistics: true
});

console.log("Query Profile:", {
  executionTime: profile.executionTime,
  planningTime: profile.planningTime,
  rowsProcessed: profile.rowsProcessed,
  memoryUsed: profile.memoryUsed,
  executionPlan: profile.executionPlan,
  statistics: profile.statistics
});
```

### Continuous Query Profiling

```typescript
// Profile all queries
const profiler = await monitorPlugin.startQueryProfiler({
  captureAll: true,
  slowQueryThreshold: 1000, // ms
  includeStackTrace: true
});

profiler.onSlowQuery((query) => {
  console.warn("Slow query detected:", {
    sql: query.sql,
    executionTime: query.executionTime,
    stackTrace: query.stackTrace
  });
});

profiler.onQueryComplete((query) => {
  console.log("Query completed:", {
    sql: query.sql,
    executionTime: query.executionTime,
    rowsReturned: query.rowsReturned
  });
});
```

## Memory Monitoring

### Memory Usage Tracking

```typescript
const memoryMonitor = await monitorPlugin.startMemoryMonitoring({
  interval: 5000,
  trackAllocations: true,
  detectLeaks: true
});

memoryMonitor.onUpdate((memory) => {
  console.log("Memory Usage:", {
    heap: memory.heap,
    external: memory.external,
    buffers: memory.buffers,
    growth: memory.growth,
    fragmentation: memory.fragmentation
  });
});

memoryMonitor.onLeak((leak) => {
  console.warn("Memory leak detected:", {
    type: leak.type,
    size: leak.size,
    location: leak.location,
    stackTrace: leak.stackTrace
  });
});
```

### Memory Profiling

```typescript
// Take memory snapshot
const snapshot = await monitorPlugin.takeMemorySnapshot({
  includeObjectDetails: true,
  includeStackTraces: true
});

// Analyze memory usage
const analysis = await monitorPlugin.analyzeMemoryUsage({
  snapshot: snapshot,
  groupBy: "type",
  sortBy: "size"
});

console.log("Memory Analysis:", analysis.summary);
```

## Performance Benchmarks

### Built-in Benchmarks

```typescript
// Run standard benchmarks
const benchmarks = await monitorPlugin.runBenchmarks({
  tests: ["query_performance", "memory_usage", "concurrency"],
  dataSize: "medium", // small, medium, large
  iterations: 5
});

console.log("Benchmark Results:", {
  queryPerformance: benchmarks.queryPerformance,
  memoryUsage: benchmarks.memoryUsage,
  concurrency: benchmarks.concurrency,
  overallScore: benchmarks.overallScore
});
```

### Custom Benchmarks

```typescript
// Create custom benchmark
const customBenchmark = await monitorPlugin.createBenchmark({
  name: "custom_workload",
  setup: async () => {
    // Setup test data
    await engine.loadData(testData, "test_table");
  },
  test: async () => {
    // Run test queries
    await engine.query("SELECT * FROM test_table WHERE condition = 'value'");
  },
  teardown: async () => {
    // Cleanup
    await engine.dropTable("test_table");
  },
  iterations: 10
});

const results = await customBenchmark.run();
console.log("Custom Benchmark Results:", results);
```

## Alerting System

### Performance Alerts

```typescript
// Configure alerts
const alertManager = await monitorPlugin.createAlertManager({
  rules: [
    {
      name: "high_cpu_usage",
      condition: "cpu.usage > 80",
      duration: 30000, // 30 seconds
      action: "notify"
    },
    {
      name: "slow_queries",
      condition: "queries.averageExecutionTime > 5000",
      duration: 10000, // 10 seconds
      action: "log"
    },
    {
      name: "memory_leak",
      condition: "memory.growth > 100MB",
      duration: 60000, // 1 minute
      action: "alert"
    }
  ]
});

alertManager.onAlert((alert) => {
  console.error("Performance Alert:", {
    rule: alert.rule,
    value: alert.value,
    timestamp: alert.timestamp,
    severity: alert.severity
  });
  
  // Send notification
  if (alert.severity === "critical") {
    sendNotification(alert);
  }
});
```

### Custom Alert Actions

```typescript
// Define custom alert actions
alertManager.registerAction("restart_query", async (alert) => {
  if (alert.rule === "slow_queries") {
    await engine.cancelActiveQueries();
    console.log("Cancelled slow queries");
  }
});

alertManager.registerAction("garbage_collect", async (alert) => {
  if (alert.rule === "memory_leak") {
    await engine.forceGarbageCollection();
    console.log("Forced garbage collection");
  }
});
```

## Performance Dashboard

### Real-time Dashboard

```typescript
// Create performance dashboard
const dashboard = await monitorPlugin.createDashboard({
  metrics: ["cpu", "memory", "queries", "database"],
  refreshInterval: 1000,
  historyWindow: 300000, // 5 minutes
  charts: [
    {
      type: "line",
      metric: "cpu.usage",
      title: "CPU Usage",
      color: "#ff6b6b"
    },
    {
      type: "area",
      metric: "memory.used",
      title: "Memory Usage",
      color: "#4ecdc4"
    },
    {
      type: "bar",
      metric: "queries.active",
      title: "Active Queries",
      color: "#45b7d1"
    }
  ]
});

// Render dashboard
document.getElementById("dashboard").appendChild(dashboard.element);
```

### Custom Widgets

```typescript
// Create custom dashboard widget
const customWidget = await monitorPlugin.createWidget({
  type: "gauge",
  metric: "database.cache.hitRate",
  title: "Cache Hit Rate",
  min: 0,
  max: 100,
  thresholds: [
    { value: 70, color: "red" },
    { value: 85, color: "yellow" },
    { value: 95, color: "green" }
  ]
});

dashboard.addWidget(customWidget);
```

## Historical Analysis

### Performance Trends

```typescript
// Analyze performance trends
const trends = await monitorPlugin.analyzePerformanceTrends({
  timeRange: {
    start: Date.now() - 24 * 60 * 60 * 1000, // 24 hours ago
    end: Date.now()
  },
  metrics: ["cpu", "memory", "queries"],
  granularity: "hour"
});

console.log("Performance Trends:", {
  cpuTrend: trends.cpu.trend,
  memoryTrend: trends.memory.trend,
  queryTrend: trends.queries.trend,
  anomalies: trends.anomalies
});
```

### Performance Regression Detection

```typescript
// Detect performance regressions
const regressions = await monitorPlugin.detectRegressions({
  baseline: {
    start: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
    end: Date.now() - 24 * 60 * 60 * 1000 // 1 day ago
  },
  current: {
    start: Date.now() - 24 * 60 * 60 * 1000, // 24 hours ago
    end: Date.now()
  },
  threshold: 0.2 // 20% degradation
});

if (regressions.length > 0) {
  console.warn("Performance regressions detected:", regressions);
}
```

## Reporting

### Performance Reports

```typescript
// Generate performance report
const report = await monitorPlugin.generateReport({
  type: "performance",
  timeRange: {
    start: Date.now() - 24 * 60 * 60 * 1000,
    end: Date.now()
  },
  format: "html",
  includeCharts: true,
  sections: [
    "summary",
    "system_metrics",
    "query_performance",
    "memory_usage",
    "recommendations"
  ]
});

// Save report
const blob = new Blob([report.content], { type: "text/html" });
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = "performance_report.html";
a.click();
```

### Custom Reports

```typescript
// Create custom report template
const customReport = await monitorPlugin.createReportTemplate({
  name: "weekly_summary",
  template: {
    title: "Weekly Performance Summary",
    sections: [
      {
        title: "Overview",
        metrics: ["cpu.average", "memory.peak", "queries.total"]
      },
      {
        title: "Top Slow Queries",
        query: "SELECT * FROM slow_queries ORDER BY execution_time DESC LIMIT 10"
      },
      {
        title: "Performance Trends",
        charts: ["cpu_trend", "memory_trend", "query_trend"]
      }
    ]
  }
});

// Generate custom report
const weeklyReport = await customReport.generate({
  timeRange: {
    start: Date.now() - 7 * 24 * 60 * 60 * 1000,
    end: Date.now()
  }
});
```

## Configuration Options

### Monitor Configuration

```typescript
interface MonitorConfig {
  metrics: string[];
  interval: number;
  history: number;
  bufferSize?: number;
  aggregation?: {
    enabled: boolean;
    window: number;
    functions: string[];
  };
  storage?: {
    enabled: boolean;
    maxSize: number;
    compression: boolean;
  };
}
```

### Plugin Options

```typescript
const monitorPlugin = await createPerformanceMonitorPlugin({
  defaultMetrics: ["cpu", "memory", "queries"],
  defaultInterval: 1000,
  historyRetention: 24 * 60 * 60 * 1000, // 24 hours
  enableProfiling: true,
  enableAlerting: true,
  storage: {
    type: "indexeddb",
    maxSize: 50 * 1024 * 1024 // 50MB
  }
});
```

## API Reference

### Methods

#### `startMonitoring(config: MonitorConfig): Promise<Monitor>`

Start performance monitoring with specified configuration.

#### `profileQuery(config: QueryProfileConfig): Promise<QueryProfile>`

Profile a specific query execution.

#### `startQueryProfiler(config: ProfilerConfig): Promise<QueryProfiler>`

Start continuous query profiling.

#### `runBenchmarks(config: BenchmarkConfig): Promise<BenchmarkResults>`

Run performance benchmarks.

#### `createDashboard(config: DashboardConfig): Promise<Dashboard>`

Create a performance monitoring dashboard.

#### `generateReport(config: ReportConfig): Promise<Report>`

Generate a performance report.

### Types

```typescript
interface PerformanceMetrics {
  timestamp: number;
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    used: number;
    total: number;
    heap: {
      used: number;
      total: number;
    };
  };
  queries: {
    active: number;
    completed: number;
    failed: number;
    averageExecutionTime: number;
  };
  database: {
    connections: number;
    tableCount: number;
    cacheHitRate: number;
  };
}

interface QueryProfile {
  sql: string;
  executionTime: number;
  planningTime: number;
  rowsProcessed: number;
  memoryUsed: number;
  executionPlan: ExecutionPlan;
  statistics: QueryStatistics;
}
```

## Examples

### Basic Performance Monitoring

```typescript
// Start basic monitoring
const monitor = await monitorPlugin.startMonitoring({
  metrics: ["cpu", "memory"],
  interval: 1000
});

// Log metrics every 10 seconds
setInterval(() => {
  const metrics = monitor.getCurrentMetrics();
  console.log(`CPU: ${metrics.cpu.usage}%, Memory: ${metrics.memory.used}MB`);
}, 10000);
```

### Query Performance Analysis

```typescript
// Profile slow queries
const profiler = await monitorPlugin.startQueryProfiler({
  slowQueryThreshold: 2000
});

profiler.onSlowQuery(async (query) => {
  console.log(`Slow query: ${query.sql} (${query.executionTime}ms)`);
  
  // Analyze execution plan
  const analysis = await monitorPlugin.analyzeExecutionPlan(query.executionPlan);
  console.log("Optimization suggestions:", analysis.suggestions);
});
```

## Troubleshooting

### Common Issues

**High CPU usage**
- Check for inefficient queries
- Review query execution plans
- Consider query optimization

**Memory leaks**
- Monitor object retention
- Check for unclosed connections
- Review event listener cleanup

**Slow query performance**
- Analyze query execution plans
- Check for missing indexes
- Consider query rewriting

**Dashboard not updating**
- Check monitor configuration
- Verify metrics are being collected
- Review browser console for errors

## Contributing

Contributions are welcome! Please see our [Contributing Guide](https://github.com/srnarasim/DataPrism/blob/main/CONTRIBUTING.md) for details.

## License

MIT License. See [LICENSE](https://github.com/srnarasim/DataPrism/blob/main/LICENSE) for details.
