# Plugin API Reference

Complete API reference for DataPrism plugin development. This document covers all interfaces, types, and methods available to plugin developers.

## Core Interfaces

### DataPrismPlugin

The main plugin interface that all plugins must implement.

```typescript
interface DataPrismPlugin {
  // Plugin metadata
  name: string;
  version: string;
  description: string;
  capabilities: PluginCapability[];
  
  // Plugin lifecycle
  initialize(context: PluginContext): Promise<void>;
  execute(action: string, params: any): Promise<any>;
  dispose(): Promise<void>;
  
  // Optional methods
  configure?(config: any): Promise<void>;
  validate?(params: any): ValidationResult;
  getSchema?(): PluginSchema;
}
```

### PluginContext

Provides access to DataPrism's core functionality and services.

```typescript
interface PluginContext {
  // Configuration management
  getConfig(key: string): any;
  setConfig(key: string, value: any): void;
  getPluginConfig(pluginName: string): any;
  
  // Data access and manipulation
  getTableData(tableName: string): Promise<any[]>;
  getTableSchema(tableName: string): Promise<TableSchema>;
  updateTable(tableName: string, data: any[]): Promise<void>;
  createTable(tableName: string, schema: TableSchema): Promise<void>;
  dropTable(tableName: string): Promise<void>;
  executeQuery(sql: string, params?: any[]): Promise<QueryResult>;
  
  // Registration methods
  registerAction(name: string, handler: ActionHandler): void;
  registerSQLFunction(name: string, handler: SQLFunctionHandler): void;
  registerAggregateFunction(name: string, handler: AggregateFunctionHandler): void;
  registerChartType(name: string, handler: ChartTypeHandler): void;
  registerDataSource(name: string, handler: DataSourceHandler): void;
  registerTransformer(name: string, handler: TransformerHandler): void;
  registerValidator(name: string, handler: ValidatorHandler): void;
  
  // Event system
  on(event: string, handler: EventHandler): void;
  off(event: string, handler: EventHandler): void;
  emit(event: string, data: any): void;
  
  // Logging
  log(message: string, level?: LogLevel): void;
  debug(message: string, data?: any): void;
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, error?: Error): void;
  
  // Storage
  getStorage(key: string): Promise<any>;
  setStorage(key: string, value: any): Promise<void>;
  removeStorage(key: string): Promise<void>;
  clearStorage(): Promise<void>;
  
  // Utility methods
  getEngineVersion(): string;
  getPluginList(): PluginInfo[];
  getPluginInstance(name: string): DataPrismPlugin | null;
  
  // Performance monitoring
  startTimer(name: string): Timer;
  recordMetric(name: string, value: number): void;
  
  // Security
  hasPermission(permission: string): boolean;
  requirePermission(permission: string): void;
}
```

## Plugin Types and Capabilities

### PluginCapability

Defines what a plugin can do:

```typescript
type PluginCapability = 
  | "data_processing"    // Data transformation and processing
  | "visualization"      // Chart and visualization creation
  | "data_source"        // External data source integration
  | "data_export"        // Data export functionality
  | "query_extension"    // SQL query extensions
  | "utility"            // Utility functions
  | "monitoring"         // Performance and monitoring
  | "security"           // Security and authentication
  | "ai_ml"              // AI and machine learning
  | "streaming"          // Real-time data streaming
  | "custom";            // Custom capabilities
```

### PluginInfo

Metadata about a plugin:

```typescript
interface PluginInfo {
  name: string;
  version: string;
  description: string;
  capabilities: PluginCapability[];
  author?: string;
  homepage?: string;
  repository?: string;
  license?: string;
  dependencies?: string[];
  status: "loaded" | "initialized" | "error";
  error?: string;
}
```

### PluginSchema

Describes plugin configuration and parameters:

```typescript
interface PluginSchema {
  configuration?: JSONSchema;
  actions?: {
    [actionName: string]: {
      description: string;
      parameters: JSONSchema;
      returns: JSONSchema;
      examples?: any[];
    };
  };
  permissions?: string[];
  dependencies?: string[];
}
```

## Data Types

### TableSchema

Describes the structure of a data table:

```typescript
interface TableSchema {
  name: string;
  columns: ColumnDefinition[];
  primaryKey?: string[];
  indexes?: IndexDefinition[];
}

interface ColumnDefinition {
  name: string;
  type: DataType;
  nullable?: boolean;
  defaultValue?: any;
  constraints?: ColumnConstraint[];
}

type DataType = 
  | "INTEGER"
  | "BIGINT"
  | "DECIMAL"
  | "REAL"
  | "VARCHAR"
  | "TEXT"
  | "BOOLEAN"
  | "DATE"
  | "TIME"
  | "TIMESTAMP"
  | "BLOB"
  | "JSON";

interface ColumnConstraint {
  type: "UNIQUE" | "CHECK" | "FOREIGN_KEY";
  definition: string;
}

interface IndexDefinition {
  name: string;
  columns: string[];
  unique?: boolean;
  type?: "BTREE" | "HASH";
}
```

### QueryResult

Result of a SQL query execution:

```typescript
interface QueryResult {
  data: any[];
  columns: ColumnInfo[];
  rowCount: number;
  executionTime: number;
  metadata?: QueryMetadata;
}

interface ColumnInfo {
  name: string;
  type: DataType;
  nullable: boolean;
}

interface QueryMetadata {
  planningTime: number;
  executionTime: number;
  memoryUsage: number;
  plan?: QueryPlan;
}

interface QueryPlan {
  nodeType: string;
  totalCost: number;
  planRows: number;
  planWidth: number;
  children?: QueryPlan[];
}
```

## Handler Types

### ActionHandler

Handler for plugin actions:

```typescript
type ActionHandler = (params: any) => Promise<any> | any;
```

### SQLFunctionHandler

Handler for custom SQL functions:

```typescript
type SQLFunctionHandler = (...args: any[]) => any;
```

### AggregateFunctionHandler

Handler for custom aggregate functions:

```typescript
interface AggregateFunctionHandler {
  initialize(): any;
  step(accumulator: any, value: any): any;
  finalize(accumulator: any): any;
}
```

### ChartTypeHandler

Handler for custom chart types:

```typescript
type ChartTypeHandler = (container: HTMLElement, data: any[], config: any) => Promise<HTMLElement>;
```

### DataSourceHandler

Handler for external data sources:

```typescript
type DataSourceHandler = (config: any) => Promise<any[]>;
```

### TransformerHandler

Handler for data transformations:

```typescript
type TransformerHandler = (data: any[], config: any) => Promise<any[]> | any[];
```

### ValidatorHandler

Handler for data validation:

```typescript
type ValidatorHandler = (data: any, config: any) => ValidationResult;

interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
  warnings?: ValidationWarning[];
}

interface ValidationError {
  field?: string;
  message: string;
  code?: string;
  value?: any;
}

interface ValidationWarning {
  field?: string;
  message: string;
  code?: string;
  value?: any;
}
```

### EventHandler

Handler for events:

```typescript
type EventHandler = (data: any) => void;
```

## Utility Types

### LogLevel

Logging levels:

```typescript
type LogLevel = "debug" | "info" | "warn" | "error";
```

### Timer

Performance timer:

```typescript
interface Timer {
  name: string;
  start(): void;
  stop(): number;
  elapsed(): number;
}
```

### PluginError

Standardized plugin error:

```typescript
class PluginError extends Error {
  constructor(
    message: string,
    public code?: string,
    public plugin?: string,
    public action?: string,
    public cause?: Error
  ) {
    super(message);
    this.name = "PluginError";
  }
}
```

## Event Types

### System Events

Events emitted by the DataPrism engine:

```typescript
interface SystemEvents {
  "engine:initialized": { version: string; timestamp: number };
  "engine:shutdown": { timestamp: number };
  "table:created": { tableName: string; schema: TableSchema };
  "table:dropped": { tableName: string };
  "query:started": { sql: string; params?: any[]; queryId: string };
  "query:completed": { queryId: string; result: QueryResult };
  "query:error": { queryId: string; error: Error };
  "plugin:loaded": { plugin: PluginInfo };
  "plugin:initialized": { plugin: PluginInfo };
  "plugin:error": { plugin: string; error: Error };
  "data:changed": { tableName: string; changeType: "insert" | "update" | "delete" };
}
```

### Custom Events

Plugins can emit custom events:

```typescript
// Example custom events
interface CustomEvents {
  "visualization:created": { chartId: string; type: string; data: any[] };
  "data:processed": { tableName: string; rowCount: number; processingTime: number };
  "export:completed": { format: string; size: number; url: string };
  "alert:triggered": { rule: string; value: any; severity: string };
}
```

## Advanced Features

### Streaming Data

For real-time data processing:

```typescript
interface DataStream {
  subscribe(handler: (data: any) => void): void;
  unsubscribe(handler: (data: any) => void): void;
  pipe(transformer: (data: any) => any): DataStream;
  close(): void;
}

interface StreamingPlugin extends DataPrismPlugin {
  createStream(config: any): Promise<DataStream>;
  processStream(stream: DataStream, processor: (data: any) => any): Promise<void>;
}
```

### Background Tasks

For long-running operations:

```typescript
interface BackgroundTask {
  id: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  result?: any;
  error?: Error;
  cancel(): void;
}

interface TaskManager {
  createTask(name: string, handler: () => Promise<any>): BackgroundTask;
  getTask(id: string): BackgroundTask | null;
  listTasks(): BackgroundTask[];
  cancelTask(id: string): void;
}
```

### Caching

For performance optimization:

```typescript
interface Cache {
  get(key: string): Promise<any>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  has(key: string): Promise<boolean>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  size(): Promise<number>;
}

interface CacheManager {
  getCache(name: string): Cache;
  createCache(name: string, options?: CacheOptions): Cache;
  deleteCache(name: string): Promise<void>;
}

interface CacheOptions {
  maxSize?: number;
  ttl?: number;
  evictionPolicy?: "lru" | "fifo" | "ttl";
}
```

## Plugin Lifecycle

### Initialization Sequence

1. **Plugin Registration**: Plugin is registered with the engine
2. **Configuration Loading**: Plugin configuration is loaded
3. **Dependency Resolution**: Plugin dependencies are resolved
4. **Initialization**: Plugin's `initialize()` method is called
5. **Action Registration**: Plugin registers its actions and handlers
6. **Ready State**: Plugin is ready to accept requests

### Shutdown Sequence

1. **Shutdown Signal**: Engine begins shutdown process
2. **Active Tasks**: Wait for active tasks to complete
3. **Cleanup**: Plugin's `dispose()` method is called
4. **Resource Cleanup**: Resources are released
5. **Unregistration**: Plugin is unregistered from the engine

## Error Handling

### Error Types

```typescript
class PluginInitializationError extends PluginError {
  constructor(message: string, plugin: string, cause?: Error) {
    super(message, "INITIALIZATION_ERROR", plugin, undefined, cause);
  }
}

class PluginExecutionError extends PluginError {
  constructor(message: string, plugin: string, action: string, cause?: Error) {
    super(message, "EXECUTION_ERROR", plugin, action, cause);
  }
}

class PluginValidationError extends PluginError {
  constructor(message: string, plugin: string, action: string, validation: ValidationResult) {
    super(message, "VALIDATION_ERROR", plugin, action);
    this.validation = validation;
  }
  
  validation: ValidationResult;
}
```

### Error Handling Best Practices

```typescript
export class RobustPlugin implements DataPrismPlugin {
  async execute(action: string, params: any): Promise<any> {
    try {
      // Validate parameters
      const validation = this.validate(params);
      if (!validation.valid) {
        throw new PluginValidationError(
          "Parameter validation failed",
          this.name,
          action,
          validation
        );
      }
      
      // Execute action
      return await this.performAction(action, params);
    } catch (error) {
      // Log error
      this.context.error(`Action ${action} failed`, error);
      
      // Emit error event
      this.context.emit("plugin:error", {
        plugin: this.name,
        action,
        error: error.message,
        timestamp: Date.now()
      });
      
      // Re-throw as plugin error
      if (error instanceof PluginError) {
        throw error;
      } else {
        throw new PluginExecutionError(
          `Action ${action} failed: ${error.message}`,
          this.name,
          action,
          error
        );
      }
    }
  }
}
```

## Testing Utilities

### MockPluginContext

For unit testing:

```typescript
class MockPluginContext implements PluginContext {
  private config = new Map<string, any>();
  private storage = new Map<string, any>();
  private tables = new Map<string, any[]>();
  private handlers = new Map<string, Function>();
  
  getConfig(key: string): any {
    return this.config.get(key);
  }
  
  setConfig(key: string, value: any): void {
    this.config.set(key, value);
  }
  
  async getTableData(tableName: string): Promise<any[]> {
    return this.tables.get(tableName) || [];
  }
  
  async updateTable(tableName: string, data: any[]): Promise<void> {
    this.tables.set(tableName, data);
  }
  
  registerAction(name: string, handler: Function): void {
    this.handlers.set(name, handler);
  }
  
  // ... other methods
}
```

### Test Helpers

```typescript
export class PluginTestHelper {
  static async createTestEnvironment(): Promise<{
    engine: DataPrismEngine;
    context: MockPluginContext;
  }> {
    const engine = new DataPrismEngine();
    const context = new MockPluginContext();
    
    await engine.initialize();
    
    return { engine, context };
  }
  
  static async loadTestData(context: PluginContext, tableName: string, data: any[]): Promise<void> {
    await context.updateTable(tableName, data);
  }
  
  static createMockPlugin(name: string, capabilities: PluginCapability[]): DataPrismPlugin {
    return {
      name,
      version: "1.0.0",
      description: "Mock plugin for testing",
      capabilities,
      async initialize() {},
      async execute() { return {}; },
      async dispose() {}
    };
  }
}
```

## Migration Guide

### Version Compatibility

```typescript
interface PluginCompatibility {
  minEngineVersion: string;
  maxEngineVersion?: string;
  deprecated?: boolean;
  migrationGuide?: string;
}

interface PluginMigration {
  fromVersion: string;
  toVersion: string;
  migrate(oldConfig: any): any;
  breaking: boolean;
  notes?: string;
}
```

### Breaking Changes

When DataPrism Core introduces breaking changes, plugins may need to be updated. The migration guide will provide:

- **API Changes**: Modified interfaces and method signatures
- **Configuration Changes**: Updated configuration schemas
- **Behavior Changes**: Modified functionality and defaults
- **Migration Scripts**: Automated migration tools

## Examples

See the [Plugin Examples](/examples/plugins) page for complete working examples of different plugin types.

## Contributing

Contributions to the plugin API are welcome! Please see our [Contributing Guide](https://github.com/srnarasim/DataPrism/blob/main/CONTRIBUTING.md) for details.

## License

MIT License. See [LICENSE](https://github.com/srnarasim/DataPrism/blob/main/LICENSE) for details.
