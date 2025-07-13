# API Reference

DataPrism Core provides a comprehensive set of APIs for building high-performance analytics applications. This reference covers all public APIs, their parameters, return values, and usage examples.

## Core Classes

### DataPrismEngine

The main class for interacting with the DataPrism analytics engine.

```typescript
import { DataPrismEngine } from "@dataprism/core";

const engine = new DataPrismEngine(options);
```

#### Constructor Options

```typescript
interface DataPrismEngineOptions {
  memoryLimit?: string; // Default: '512MB'
  enableOptimizations?: boolean; // Default: true
  debug?: boolean; // Default: false
  wasmUrl?: string; // Custom WASM binary URL
}
```

#### Methods

##### `initialize(): Promise<void>`

Initializes the WebAssembly runtime and sets up the DuckDB engine.

```typescript
await engine.initialize();
```

**Throws:**

- `DataPrismError` - If WebAssembly is not supported or initialization fails

---

##### `query(sql: string): Promise<QueryResult>`

Executes a SQL query and returns the results.

```typescript
const result = await engine.query("SELECT * FROM sales LIMIT 10");
console.log(result.data); // Array of row objects
```

**Parameters:**

- `sql` (string) - The SQL query to execute

**Returns:**

```typescript
interface QueryResult {
  data: any[]; // Query result rows
  metadata: QueryMetadata; // Query execution metadata
  executionTime: number; // Query execution time in milliseconds
}

interface QueryMetadata {
  rowCount: number; // Number of rows returned
  columnCount: number; // Number of columns
  columns: ColumnInfo[]; // Column information
}

interface ColumnInfo {
  name: string; // Column name
  type: string; // Column data type
  nullable: boolean; // Whether column allows NULL values
}
```

**Throws:**

- `QueryError` - If the SQL query is invalid or execution fails

---

##### `loadData(data: any[], tableName: string): Promise<void>`

Loads an array of objects into a DuckDB table.

```typescript
const salesData = [
  { date: "2024-01-01", product: "Widget A", revenue: 1500 },
  { date: "2024-01-01", product: "Widget B", revenue: 2300 },
];

await engine.loadData(salesData, "sales");
```

**Parameters:**

- `data` (any[]) - Array of objects to load
- `tableName` (string) - Name of the table to create

**Throws:**

- `DataLoadError` - If data loading fails

---

##### `loadCSV(csvData: string, tableName: string, options?: CSVOptions): Promise<void>`

Loads CSV data into a DuckDB table.

```typescript
const csvData = `date,product,revenue
2024-01-01,Widget A,1500
2024-01-01,Widget B,2300`;

await engine.loadCSV(csvData, "sales", {
  delimiter: ",",
  header: true,
  skipRows: 0,
});
```

**Parameters:**

- `csvData` (string) - CSV data as a string
- `tableName` (string) - Name of the table to create
- `options` (CSVOptions, optional) - CSV parsing options

```typescript
interface CSVOptions {
  delimiter?: string; // Default: ','
  header?: boolean; // Default: true
  skipRows?: number; // Default: 0
  maxRows?: number; // Default: unlimited
  encoding?: string; // Default: 'utf-8'
}
```

---

##### `listTables(): Promise<string[]>`

Returns a list of all tables in the database.

```typescript
const tables = await engine.listTables();
console.log(tables); // ['sales', 'products', 'customers']
```

---

##### `getTableSchema(tableName: string): Promise<TableSchema>`

Returns the schema information for a specific table.

```typescript
const schema = await engine.getTableSchema("sales");
console.log(schema.columns);
```

**Returns:**

```typescript
interface TableSchema {
  name: string;
  columns: ColumnInfo[];
  rowCount: number;
  estimatedSize: number; // Size in bytes
}
```

---

##### `dropTable(tableName: string): Promise<void>`

Drops a table from the database.

```typescript
await engine.dropTable("temp_table");
```

---

##### `getMetrics(): Promise<EngineMetrics>`

Returns performance and usage metrics.

```typescript
const metrics = await engine.getMetrics();
console.log(`Memory usage: ${metrics.memoryUsage}MB`);
```

**Returns:**

```typescript
interface EngineMetrics {
  memoryUsage: number; // Current memory usage in MB
  maxMemoryUsage: number; // Peak memory usage in MB
  queryCount: number; // Total queries executed
  avgQueryTime: number; // Average query time in milliseconds
  cacheHitRate: number; // Query cache hit rate (0-1)
  uptime: number; // Engine uptime in milliseconds
}
```

---

### DataPrismOrchestrator

High-level orchestration layer for complex analytics workflows.

```typescript
import { DataPrismOrchestrator } from "@dataprism/orchestration";

const orchestrator = new DataPrismOrchestrator(engine, options);
```

#### Constructor Options

```typescript
interface OrchestratorOptions {
  enableCaching?: boolean; // Default: true
  cacheSize?: number; // Default: 100 (max cached queries)
  enableMetrics?: boolean; // Default: true
  parallelQueries?: number; // Default: 4 (max parallel queries)
}
```

#### Methods

##### `initialize(): Promise<void>`

Initializes the orchestrator with the provided engine.

```typescript
await orchestrator.initialize();
```

---

##### `createDataPipeline(steps: PipelineStep[]): Promise<DataPipeline>`

Creates a data processing pipeline.

```typescript
const pipeline = await orchestrator.createDataPipeline([
  {
    type: "load",
    source: { type: "csv", data: csvData },
    target: "raw_data",
  },
  {
    type: "transform",
    sql: "SELECT *, revenue * 1.1 as adjusted_revenue FROM raw_data",
    target: "processed_data",
  },
  {
    type: "aggregate",
    sql: "SELECT product, SUM(adjusted_revenue) as total FROM processed_data GROUP BY product",
    target: "summary",
  },
]);

const results = await pipeline.execute();
```

---

##### `executeParallel(queries: string[]): Promise<QueryResult[]>`

Executes multiple queries in parallel.

```typescript
const queries = [
  "SELECT COUNT(*) FROM sales",
  "SELECT SUM(revenue) FROM sales",
  "SELECT AVG(revenue) FROM sales",
];

const results = await orchestrator.executeParallel(queries);
```

---

## Plugin Framework

### PluginBase

Base class for creating custom plugins.

```typescript
import { PluginBase, PluginMetadata } from "@dataprism/plugin-framework";

class MyPlugin extends PluginBase {
  static metadata: PluginMetadata = {
    name: "my-plugin",
    version: "1.0.0",
    description: "My custom plugin",
    type: "data-processor",
  };

  async process(data: any, context: PluginContext): Promise<any> {
    // Plugin implementation
  }
}
```

#### Plugin Metadata

```typescript
interface PluginMetadata {
  name: string;
  version: string;
  description: string;
  author?: string;
  type: "data-processor" | "visualization" | "integration" | "utility";
  tags?: string[];
  requiresContext?: boolean;
}
```

#### Plugin Context

```typescript
interface PluginContext {
  engine: DataPrismEngine;
  logger: Logger;
  config: Record<string, any>;
  cache: CacheManager;
}
```

---

## Error Handling

DataPrism Core uses specific error classes for different types of failures:

```typescript
import {
  DataPrismError,
  QueryError,
  DataLoadError,
  MemoryError,
  InitializationError,
} from "@dataprism/core";

try {
  await engine.query("INVALID SQL");
} catch (error) {
  if (error instanceof QueryError) {
    console.error("SQL Error:", error.message);
    console.error("Query:", error.query);
    console.error("Line:", error.line);
  }
}
```

### Error Types

#### `DataPrismError`

Base error class for all DataPrism-related errors.

#### `QueryError`

Thrown when SQL query execution fails.

```typescript
interface QueryError extends DataPrismError {
  query: string; // The failed query
  line?: number; // Line number of error (if available)
  column?: number; // Column number of error (if available)
}
```

#### `DataLoadError`

Thrown when data loading operations fail.

```typescript
interface DataLoadError extends DataPrismError {
  tableName: string; // Target table name
  rowCount?: number; // Number of rows processed before error
}
```

#### `MemoryError`

Thrown when memory limits are exceeded.

```typescript
interface MemoryError extends DataPrismError {
  currentUsage: number; // Current memory usage in MB
  limit: number; // Memory limit in MB
}
```

#### `InitializationError`

Thrown when engine initialization fails.

```typescript
interface InitializationError extends DataPrismError {
  reason: "wasm_not_supported" | "wasm_load_failed" | "engine_init_failed";
}
```

---

## Type Definitions

### Data Types

DataPrism Core supports the following data types:

```typescript
type DataPrismValue = string | number | boolean | Date | null | undefined;

interface DataPrismRow {
  [columnName: string]: DataPrismValue;
}
```

### SQL Data Types

| DataPrism Type | SQL Type  | JavaScript Type |
| -------------- | --------- | --------------- |
| INTEGER        | INTEGER   | number          |
| DOUBLE         | DOUBLE    | number          |
| VARCHAR        | VARCHAR   | string          |
| BOOLEAN        | BOOLEAN   | boolean         |
| DATE           | DATE      | Date            |
| TIMESTAMP      | TIMESTAMP | Date            |
| BLOB           | BLOB      | Uint8Array      |

---

## Configuration

### Engine Configuration

```typescript
const engine = new DataPrismEngine({
  // Memory limit (supports 'MB', 'GB' suffixes)
  memoryLimit: "1GB",

  // Enable query optimizations
  enableOptimizations: true,

  // Enable debug logging
  debug: process.env.NODE_ENV === "development",

  // Custom WASM binary URL
  wasmUrl: "https://cdn.example.com/dataprism-core.wasm",

  // Query timeout in milliseconds
  queryTimeout: 30000,

  // Maximum number of concurrent queries
  maxConcurrentQueries: 4,
});
```

### Global Configuration

```typescript
import { setGlobalConfig } from "@dataprism/core";

setGlobalConfig({
  // Default memory limit for new engines
  defaultMemoryLimit: "512MB",

  // Global debug mode
  debug: false,

  // CDN base URL for WASM files
  cdnBaseUrl: "https://cdn.dataprism.dev/v1.0.0/",

  // Default query timeout
  defaultQueryTimeout: 30000,
});
```

---

## Next Steps

- **[Examples](/examples/)** - See real-world usage examples
- **[Plugin Development](/plugins/)** - Learn to build custom plugins
- **[Performance Guide](/guide/performance)** - Optimize your applications
- **[GitHub Issues](https://github.com/dataprism/core/issues)** - Report bugs or request features
