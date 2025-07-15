# Core Engine API

Complete API reference for the DataPrism Core engine. This is the main entry point for all DataPrism functionality.

## DataPrismEngine

The primary class for interacting with DataPrism Core.

### Constructor

```typescript
const engine = new DataPrismEngine(options?: EngineOptions);
```

#### EngineOptions

```typescript
interface EngineOptions {
  // WebAssembly configuration
  wasmOptions?: {
    memoryInitial?: number;     // Initial memory in MB (default: 64)
    memoryMaximum?: number;     // Maximum memory in MB (default: 1024)
    enableThreads?: boolean;    // Enable threading (default: true)
    enableSIMD?: boolean;       // Enable SIMD (default: true)
  };
  
  // DuckDB configuration
  duckdbOptions?: {
    accessMode?: "READ_ONLY" | "READ_WRITE";  // Default: READ_WRITE
    checkpointWalAuto?: boolean;              // Default: true
    useTemporaryDirectory?: boolean;          // Default: true
    maxMemory?: string;                       // Default: "1GB"
    threadsCount?: number;                    // Default: navigator.hardwareConcurrency
  };
  
  // Logging configuration
  logLevel?: "debug" | "info" | "warn" | "error";  // Default: "info"
  enableProfiling?: boolean;                       // Default: false
  
  // Performance configuration
  queryTimeout?: number;        // Query timeout in ms (default: 30000)
  maxConcurrentQueries?: number; // Default: 10
  enableQueryCache?: boolean;   // Default: true
  
  // Plugin configuration
  enablePlugins?: boolean;      // Default: true
  pluginTimeout?: number;       // Plugin execution timeout (default: 60000)
}
```

### Initialization

#### initialize()

Initialize the DataPrism engine.

```typescript
await engine.initialize();
```

**Returns:** `Promise<void>`

**Example:**
```typescript
const engine = new DataPrismEngine({
  duckdbOptions: {
    maxMemory: "2GB",
    threadsCount: 4
  },
  logLevel: "debug"
});

await engine.initialize();
console.log("Engine initialized successfully");
```

#### shutdown()

Shutdown the engine and cleanup resources.

```typescript
await engine.shutdown();
```

**Returns:** `Promise<void>`

### Data Loading

#### loadData()

Load data into a table.

```typescript
await engine.loadData(data, tableName, options?);
```

**Parameters:**
- `data: any[]` - Array of objects to load
- `tableName: string` - Name of the table to create
- `options?: LoadDataOptions` - Optional loading options

**Returns:** `Promise<LoadDataResult>`

```typescript
interface LoadDataOptions {
  replaceTable?: boolean;        // Replace existing table (default: false)
  primaryKey?: string[];         // Primary key columns
  columnTypes?: { [key: string]: string }; // Override column types
  createIndexes?: IndexDefinition[]; // Indexes to create
  batchSize?: number;            // Batch size for loading (default: 1000)
  onProgress?: (progress: LoadProgress) => void; // Progress callback
}

interface LoadDataResult {
  tableName: string;
  rowCount: number;
  columnCount: number;
  loadTime: number;
  tableSchema: TableSchema;
}

interface LoadProgress {
  loaded: number;
  total: number;
  percentage: number;
}
```

**Example:**
```typescript
const salesData = [
  { id: 1, product: "Widget A", amount: 1500, date: "2024-01-01" },
  { id: 2, product: "Widget B", amount: 2300, date: "2024-01-02" }
];

const result = await engine.loadData(salesData, "sales", {
  primaryKey: ["id"],
  columnTypes: {
    "amount": "DECIMAL",
    "date": "DATE"
  },
  createIndexes: [
    { name: "idx_product", columns: ["product"] },
    { name: "idx_date", columns: ["date"] }
  ]
});

console.log(`Loaded ${result.rowCount} rows into ${result.tableName}`);
```

#### loadCSV()

Load data from a CSV string.

```typescript
await engine.loadCSV(csvData, tableName, options?);
```

**Parameters:**
- `csvData: string` - CSV data as string
- `tableName: string` - Name of the table to create
- `options?: CSVLoadOptions` - Optional CSV loading options

**Returns:** `Promise<LoadDataResult>`

```typescript
interface CSVLoadOptions extends LoadDataOptions {
  delimiter?: string;           // Column delimiter (default: ",")
  hasHeader?: boolean;          // First row contains headers (default: true)
  quote?: string;              // Quote character (default: '"')
  escape?: string;             // Escape character (default: '"')
  encoding?: string;           // Text encoding (default: "utf-8")
  skipRows?: number;           // Rows to skip (default: 0)
  maxRows?: number;            // Maximum rows to load
  nullValue?: string;          // Null value representation (default: "")
  autoDetectTypes?: boolean;   // Auto-detect column types (default: true)
}
```

**Example:**
```typescript
const csvData = `id,name,age,city
1,John,25,New York
2,Jane,30,San Francisco
3,Bob,35,Chicago`;

const result = await engine.loadCSV(csvData, "users", {
  delimiter: ",",
  hasHeader: true,
  autoDetectTypes: true
});

console.log(`Loaded ${result.rowCount} users`);
```

#### loadFile()

Load data from a file.

```typescript
await engine.loadFile(file, tableName, options?);
```

**Parameters:**
- `file: File` - File object to load
- `tableName: string` - Name of the table to create
- `options?: FileLoadOptions` - Optional file loading options

**Returns:** `Promise<LoadDataResult>`

```typescript
interface FileLoadOptions extends CSVLoadOptions {
  format?: "csv" | "json" | "parquet" | "auto"; // File format (default: "auto")
  jsonPath?: string;                           // JSON path for nested data
  compression?: "none" | "gzip" | "auto";     // Compression type (default: "auto")
}
```

**Example:**
```typescript
const fileInput = document.getElementById("file-input") as HTMLInputElement;
const file = fileInput.files[0];

const result = await engine.loadFile(file, "uploaded_data", {
  format: "csv",
  hasHeader: true,
  onProgress: (progress) => {
    console.log(`Loading: ${progress.percentage}%`);
  }
});

console.log(`Loaded ${result.rowCount} rows from file`);
```

### Querying

#### query()

Execute a SQL query.

```typescript
const result = await engine.query(sql, params?, options?);
```

**Parameters:**
- `sql: string` - SQL query to execute
- `params?: any[]` - Query parameters
- `options?: QueryOptions` - Optional query options

**Returns:** `Promise<QueryResult>`

```typescript
interface QueryOptions {
  timeout?: number;              // Query timeout in ms
  maxRows?: number;             // Maximum rows to return
  enableProfiling?: boolean;    // Enable query profiling
  cacheResult?: boolean;        // Cache query result
  cacheKey?: string;           // Custom cache key
  streaming?: boolean;          // Enable streaming results
  onProgress?: (progress: QueryProgress) => void; // Progress callback
}

interface QueryResult {
  data: any[];                 // Query result data
  columns: ColumnInfo[];       // Column information
  rowCount: number;            // Number of rows returned
  executionTime: number;       // Query execution time in ms
  planningTime: number;        // Query planning time in ms
  memoryUsage: number;         // Memory used in bytes
  profile?: QueryProfile;      // Query profile (if enabled)
}

interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  precision?: number;
  scale?: number;
}

interface QueryProfile {
  executionPlan: ExecutionPlan;
  statistics: QueryStatistics;
  timing: QueryTiming;
}

interface QueryProgress {
  phase: "planning" | "executing" | "fetching";
  percentage: number;
  rowsProcessed: number;
}
```

**Example:**
```typescript
// Simple query
const result = await engine.query("SELECT * FROM sales WHERE amount > 1000");
console.log(`Found ${result.rowCount} high-value sales`);

// Parameterized query
const salesByProduct = await engine.query(
  "SELECT product, SUM(amount) as total FROM sales WHERE date >= ? GROUP BY product",
  ["2024-01-01"]
);

// Query with options
const topProducts = await engine.query(
  "SELECT product, SUM(amount) as total FROM sales GROUP BY product ORDER BY total DESC",
  [],
  {
    maxRows: 10,
    enableProfiling: true,
    cacheResult: true
  }
);

if (topProducts.profile) {
  console.log("Query execution plan:", topProducts.profile.executionPlan);
}
```

#### queryStream()

Execute a query and return a stream of results.

```typescript
const stream = await engine.queryStream(sql, params?, options?);
```

**Parameters:**
- `sql: string` - SQL query to execute
- `params?: any[]` - Query parameters
- `options?: StreamQueryOptions` - Optional streaming options

**Returns:** `Promise<QueryStream>`

```typescript
interface StreamQueryOptions extends QueryOptions {
  batchSize?: number;           // Batch size for streaming (default: 1000)
  highWaterMark?: number;       // Stream buffer size (default: 16)
}

interface QueryStream {
  on(event: "data", listener: (batch: any[]) => void): void;
  on(event: "end", listener: () => void): void;
  on(event: "error", listener: (error: Error) => void): void;
  pause(): void;
  resume(): void;
  destroy(): void;
  readonly readable: boolean;
}
```

**Example:**
```typescript
const stream = await engine.queryStream("SELECT * FROM large_table", [], {
  batchSize: 5000
});

let totalRows = 0;

stream.on("data", (batch) => {
  totalRows += batch.length;
  console.log(`Processed ${totalRows} rows`);
  
  // Process batch
  batch.forEach(row => {
    // Handle each row
  });
});

stream.on("end", () => {
  console.log(`Finished processing ${totalRows} rows`);
});

stream.on("error", (error) => {
  console.error("Stream error:", error);
});
```

### Schema Management

#### getTableSchema()

Get the schema of a table.

```typescript
const schema = await engine.getTableSchema(tableName);
```

**Parameters:**
- `tableName: string` - Name of the table

**Returns:** `Promise<TableSchema>`

```typescript
interface TableSchema {
  name: string;
  columns: ColumnDefinition[];
  primaryKey?: string[];
  foreignKeys?: ForeignKeyDefinition[];
  indexes?: IndexDefinition[];
  checkConstraints?: CheckConstraintDefinition[];
  rowCount: number;
  diskSize: number;
  created: Date;
  lastModified: Date;
}

interface ColumnDefinition {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: any;
  precision?: number;
  scale?: number;
  collation?: string;
  comment?: string;
}

interface ForeignKeyDefinition {
  name: string;
  columns: string[];
  referencedTable: string;
  referencedColumns: string[];
  onDelete?: "CASCADE" | "SET NULL" | "RESTRICT";
  onUpdate?: "CASCADE" | "SET NULL" | "RESTRICT";
}

interface IndexDefinition {
  name: string;
  columns: string[];
  unique: boolean;
  type: "BTREE" | "HASH";
  partial?: string;
}

interface CheckConstraintDefinition {
  name: string;
  expression: string;
}
```

**Example:**
```typescript
const schema = await engine.getTableSchema("sales");

console.log(`Table: ${schema.name}`);
console.log(`Columns: ${schema.columns.length}`);
console.log(`Rows: ${schema.rowCount}`);
console.log(`Size: ${schema.diskSize} bytes`);

schema.columns.forEach(col => {
  console.log(`- ${col.name}: ${col.type} ${col.nullable ? "NULL" : "NOT NULL"}`);
});
```

#### listTables()

List all tables in the database.

```typescript
const tables = await engine.listTables();
```

**Returns:** `Promise<TableInfo[]>`

```typescript
interface TableInfo {
  name: string;
  type: "TABLE" | "VIEW" | "TEMPORARY";
  rowCount: number;
  columnCount: number;
  diskSize: number;
  created: Date;
  lastModified: Date;
}
```

**Example:**
```typescript
const tables = await engine.listTables();

console.log("Available tables:");
tables.forEach(table => {
  console.log(`- ${table.name} (${table.rowCount} rows, ${table.columnCount} columns)`);
});
```

#### createTable()

Create a new table with specified schema.

```typescript
await engine.createTable(tableName, schema);
```

**Parameters:**
- `tableName: string` - Name of the table to create
- `schema: CreateTableSchema` - Table schema definition

**Returns:** `Promise<void>`

```typescript
interface CreateTableSchema {
  columns: ColumnDefinition[];
  primaryKey?: string[];
  foreignKeys?: ForeignKeyDefinition[];
  indexes?: IndexDefinition[];
  checkConstraints?: CheckConstraintDefinition[];
  temporary?: boolean;
  ifNotExists?: boolean;
}
```

**Example:**
```typescript
await engine.createTable("products", {
  columns: [
    { name: "id", type: "INTEGER", nullable: false },
    { name: "name", type: "VARCHAR(255)", nullable: false },
    { name: "price", type: "DECIMAL(10,2)", nullable: false },
    { name: "category", type: "VARCHAR(100)", nullable: true },
    { name: "created_at", type: "TIMESTAMP", nullable: false, defaultValue: "CURRENT_TIMESTAMP" }
  ],
  primaryKey: ["id"],
  indexes: [
    { name: "idx_name", columns: ["name"], unique: true, type: "BTREE" },
    { name: "idx_category", columns: ["category"], unique: false, type: "BTREE" }
  ],
  checkConstraints: [
    { name: "price_positive", expression: "price > 0" }
  ]
});
```

#### dropTable()

Drop a table.

```typescript
await engine.dropTable(tableName, options?);
```

**Parameters:**
- `tableName: string` - Name of the table to drop
- `options?: DropTableOptions` - Optional drop options

**Returns:** `Promise<void>`

```typescript
interface DropTableOptions {
  ifExists?: boolean;          // Don't error if table doesn't exist
  cascade?: boolean;           // Drop dependent objects
}
```

**Example:**
```typescript
await engine.dropTable("old_table", {
  ifExists: true,
  cascade: true
});
```

### Transactions

#### beginTransaction()

Begin a new transaction.

```typescript
const transaction = await engine.beginTransaction();
```

**Returns:** `Promise<Transaction>`

```typescript
interface Transaction {
  id: string;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  query(sql: string, params?: any[]): Promise<QueryResult>;
  savepoint(name: string): Promise<void>;
  rollbackTo(name: string): Promise<void>;
  readonly isActive: boolean;
}
```

**Example:**
```typescript
const transaction = await engine.beginTransaction();

try {
  await transaction.query("INSERT INTO accounts (id, balance) VALUES (1, 1000)");
  await transaction.query("INSERT INTO accounts (id, balance) VALUES (2, 500)");
  
  // Transfer money
  await transaction.query("UPDATE accounts SET balance = balance - 100 WHERE id = 1");
  await transaction.query("UPDATE accounts SET balance = balance + 100 WHERE id = 2");
  
  await transaction.commit();
  console.log("Transaction committed successfully");
} catch (error) {
  await transaction.rollback();
  console.error("Transaction rolled back:", error);
}
```

#### withTransaction()

Execute a function within a transaction.

```typescript
const result = await engine.withTransaction(async (transaction) => {
  // Transaction operations
  return result;
});
```

**Parameters:**
- `fn: (transaction: Transaction) => Promise<T>` - Function to execute in transaction

**Returns:** `Promise<T>`

**Example:**
```typescript
const transferResult = await engine.withTransaction(async (transaction) => {
  const fromAccount = await transaction.query(
    "SELECT balance FROM accounts WHERE id = ?",
    [fromId]
  );
  
  if (fromAccount.data[0].balance < amount) {
    throw new Error("Insufficient funds");
  }
  
  await transaction.query(
    "UPDATE accounts SET balance = balance - ? WHERE id = ?",
    [amount, fromId]
  );
  
  await transaction.query(
    "UPDATE accounts SET balance = balance + ? WHERE id = ?",
    [amount, toId]
  );
  
  return { success: true, transferred: amount };
});
```

### Performance and Monitoring

#### getMetrics()

Get engine performance metrics.

```typescript
const metrics = await engine.getMetrics();
```

**Returns:** `Promise<EngineMetrics>`

```typescript
interface EngineMetrics {
  uptime: number;
  memoryUsage: {
    total: number;
    used: number;
    free: number;
    heap: number;
    external: number;
  };
  queryStats: {
    totalQueries: number;
    successfulQueries: number;
    failedQueries: number;
    averageExecutionTime: number;
    slowestQuery: number;
  };
  tableStats: {
    totalTables: number;
    totalRows: number;
    totalSize: number;
  };
  cacheStats: {
    hits: number;
    misses: number;
    size: number;
    hitRate: number;
  };
}
```

**Example:**
```typescript
const metrics = await engine.getMetrics();

console.log(`Uptime: ${metrics.uptime}ms`);
console.log(`Memory usage: ${metrics.memoryUsage.used} / ${metrics.memoryUsage.total} bytes`);
console.log(`Total queries: ${metrics.queryStats.totalQueries}`);
console.log(`Average execution time: ${metrics.queryStats.averageExecutionTime}ms`);
console.log(`Cache hit rate: ${metrics.cacheStats.hitRate * 100}%`);
```

#### explain()

Explain query execution plan.

```typescript
const plan = await engine.explain(sql, params?, options?);
```

**Parameters:**
- `sql: string` - SQL query to explain
- `params?: any[]` - Query parameters
- `options?: ExplainOptions` - Explain options

**Returns:** `Promise<QueryPlan>`

```typescript
interface ExplainOptions {
  format?: "text" | "json" | "xml";  // Output format
  analyze?: boolean;                 // Include actual execution statistics
  verbose?: boolean;                 // Include detailed information
  costs?: boolean;                   // Include cost information
  timing?: boolean;                  // Include timing information
}

interface QueryPlan {
  plan: ExecutionPlan;
  totalCost: number;
  planningTime: number;
  executionTime?: number;
  actualRows?: number;
  actualLoops?: number;
}

interface ExecutionPlan {
  nodeType: string;
  relation?: string;
  alias?: string;
  startupCost: number;
  totalCost: number;
  planRows: number;
  planWidth: number;
  actualStartupTime?: number;
  actualTotalTime?: number;
  actualRows?: number;
  actualLoops?: number;
  output?: string[];
  filter?: string;
  joinType?: string;
  joinCondition?: string;
  indexName?: string;
  indexCondition?: string;
  children?: ExecutionPlan[];
}
```

**Example:**
```typescript
const plan = await engine.explain(
  "SELECT * FROM sales s JOIN products p ON s.product_id = p.id WHERE s.amount > 1000",
  [],
  {
    format: "json",
    analyze: true,
    timing: true
  }
);

console.log("Query plan:", JSON.stringify(plan.plan, null, 2));
console.log(`Total cost: ${plan.totalCost}`);
console.log(`Planning time: ${plan.planningTime}ms`);
if (plan.executionTime) {
  console.log(`Execution time: ${plan.executionTime}ms`);
}
```

### Events

#### on()

Listen to engine events.

```typescript
engine.on(event, listener);
```

**Parameters:**
- `event: string` - Event name
- `listener: (...args: any[]) => void` - Event listener

**Events:**
- `initialized` - Engine initialized
- `shutdown` - Engine shutdown
- `query:start` - Query started
- `query:complete` - Query completed
- `query:error` - Query error
- `table:created` - Table created
- `table:dropped` - Table dropped
- `data:loaded` - Data loaded
- `transaction:begin` - Transaction started
- `transaction:commit` - Transaction committed
- `transaction:rollback` - Transaction rolled back
- `error` - General error

**Example:**
```typescript
engine.on("query:start", (queryId, sql) => {
  console.log(`Query started: ${queryId}`);
  console.log(`SQL: ${sql}`);
});

engine.on("query:complete", (queryId, result) => {
  console.log(`Query completed: ${queryId}`);
  console.log(`Rows: ${result.rowCount}, Time: ${result.executionTime}ms`);
});

engine.on("query:error", (queryId, error) => {
  console.error(`Query error: ${queryId}`);
  console.error(`Error: ${error.message}`);
});

engine.on("error", (error) => {
  console.error("Engine error:", error);
});
```

### Plugin Management

#### registerPlugin()

Register a plugin with the engine.

```typescript
await engine.registerPlugin(plugin);
```

**Parameters:**
- `plugin: DataPrismPlugin` - Plugin instance to register

**Returns:** `Promise<void>`

**Example:**
```typescript
import { createVisualizationPlugin } from "@dataprism/plugin-visualization";

const vizPlugin = createVisualizationPlugin();
await engine.registerPlugin(vizPlugin);

console.log("Visualization plugin registered");
```

#### executePlugin()

Execute a plugin action.

```typescript
const result = await engine.executePlugin(pluginName, action, params);
```

**Parameters:**
- `pluginName: string` - Name of the plugin
- `action: string` - Action to execute
- `params: any` - Parameters for the action

**Returns:** `Promise<any>`

**Example:**
```typescript
const chart = await engine.executePlugin("visualization", "create_chart", {
  type: "bar",
  data: salesData,
  x: "product",
  y: "amount",
  title: "Sales by Product"
});

document.getElementById("chart-container").appendChild(chart);
```

#### listPlugins()

List all registered plugins.

```typescript
const plugins = engine.listPlugins();
```

**Returns:** `PluginInfo[]`

**Example:**
```typescript
const plugins = engine.listPlugins();

console.log("Registered plugins:");
plugins.forEach(plugin => {
  console.log(`- ${plugin.name} v${plugin.version}: ${plugin.description}`);
});
```

### Utilities

#### version

Get the DataPrism Core version.

```typescript
const version = engine.version;
```

**Returns:** `string`

#### isInitialized

Check if the engine is initialized.

```typescript
const initialized = engine.isInitialized;
```

**Returns:** `boolean`

#### generateId()

Generate a unique ID.

```typescript
const id = engine.generateId();
```

**Returns:** `string`

## Error Handling

### DataPrismError

Base error class for DataPrism errors.

```typescript
class DataPrismError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = "DataPrismError";
  }
}
```

### Error Types

- `InitializationError` - Engine initialization failed
- `QueryError` - Query execution failed
- `SchemaError` - Schema operation failed
- `TransactionError` - Transaction operation failed
- `PluginError` - Plugin operation failed
- `ValidationError` - Data validation failed
- `TimeoutError` - Operation timed out
- `MemoryError` - Out of memory

**Example:**
```typescript
try {
  await engine.query("SELECT * FROM nonexistent_table");
} catch (error) {
  if (error instanceof DataPrismError) {
    console.error(`DataPrism error [${error.code}]: ${error.message}`);
    console.error("Details:", error.details);
  } else {
    console.error("Unexpected error:", error);
  }
}
```

## Examples

See the [Examples](/examples/) section for complete working examples.

## Contributing

Contributions are welcome! Please see our [Contributing Guide](https://github.com/srnarasim/DataPrism/blob/main/CONTRIBUTING.md) for details.

## License

MIT License. See [LICENSE](https://github.com/srnarasim/DataPrism/blob/main/LICENSE) for details.
