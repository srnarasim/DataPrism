# Plugin Framework API

The DataPrism Plugin Framework provides a comprehensive API for creating, managing, and integrating plugins with the DataPrism ecosystem.

## Overview

The Plugin Framework enables:
- Extensible architecture for custom functionality
- Type-safe plugin development
- Automatic dependency resolution
- Lifecycle management
- Security sandboxing
- Performance monitoring

## Core Interfaces

### DataPrismPlugin

The base interface that all plugins must implement.

```typescript
interface DataPrismPlugin {
  // Plugin metadata
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly author?: string;
  readonly capabilities: PluginCapability[];
  
  // Plugin lifecycle
  initialize(context: PluginContext): Promise<void>;
  execute(action: string, params: any): Promise<any>;
  dispose(): Promise<void>;
  
  // Optional methods
  configure?(config: PluginConfig): Promise<void>;
  validate?(params: any): ValidationResult;
  getSchema?(): PluginSchema;
  getActions?(): ActionDefinition[];
}
```

### PluginContext

Provides access to DataPrism's core functionality.

```typescript
interface PluginContext {
  // Engine access
  readonly engine: DataPrismEngine;
  readonly orchestrator: DataPrismOrchestrator;
  
  // Configuration
  getConfig(key: string): any;
  setConfig(key: string, value: any): void;
  
  // Data access
  getData(tableName: string): Promise<any[]>;
  setData(tableName: string, data: any[]): Promise<void>;
  executeQuery(sql: string, params?: any[]): Promise<QueryResult>;
  
  // Plugin registry
  getPlugin(name: string): DataPrismPlugin | null;
  listPlugins(): PluginInfo[];
  
  // Event system
  emit(event: string, data?: any): void;
  on(event: string, handler: EventHandler): void;
  off(event: string, handler: EventHandler): void;
  
  // Logging
  log(level: LogLevel, message: string, data?: any): void;
  
  // Resource management
  allocateResource(type: string, size: number): Promise<ResourceHandle>;
  freeResource(handle: ResourceHandle): Promise<void>;
  
  // Security
  hasPermission(permission: string): boolean;
  requirePermission(permission: string): void;
  
  // Utilities
  generateId(): string;
  createTimer(name: string): Timer;
  recordMetric(name: string, value: number): void;
}
```

## Plugin Types

### DataProcessorPlugin

For data transformation and processing.

```typescript
interface DataProcessorPlugin extends DataPrismPlugin {
  capabilities: ['data_processing'];
  
  process(data: any[], options: ProcessingOptions): Promise<ProcessingResult>;
  getProcessingSchema(): ProcessingSchema;
  validateInput(data: any[]): ValidationResult;
}

interface ProcessingOptions {
  batchSize?: number;
  parallelism?: number;
  transformations?: Transformation[];
  filters?: Filter[];
  aggregations?: Aggregation[];
}

interface ProcessingResult {
  data: any[];
  metadata: ProcessingMetadata;
  statistics: ProcessingStatistics;
}
```

### VisualizationPlugin

For creating charts and visualizations.

```typescript
interface VisualizationPlugin extends DataPrismPlugin {
  capabilities: ['visualization'];
  
  createVisualization(data: any[], config: VisualizationConfig): Promise<HTMLElement>;
  updateVisualization(element: HTMLElement, data: any[]): Promise<void>;
  destroyVisualization(element: HTMLElement): Promise<void>;
  getSupportedTypes(): VisualizationType[];
}

interface VisualizationConfig {
  type: VisualizationType;
  width?: number;
  height?: number;
  theme?: string;
  interactive?: boolean;
  animations?: boolean;
  customOptions?: any;
}
```

### DataSourcePlugin

For connecting to external data sources.

```typescript
interface DataSourcePlugin extends DataPrismPlugin {
  capabilities: ['data_source'];
  
  connect(config: ConnectionConfig): Promise<DataConnection>;
  disconnect(connection: DataConnection): Promise<void>;
  query(connection: DataConnection, query: string): Promise<any[]>;
  getSchema(connection: DataConnection): Promise<DataSchema>;
  testConnection(config: ConnectionConfig): Promise<boolean>;
}

interface ConnectionConfig {
  type: 'database' | 'api' | 'file' | 'stream';
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  options?: any;
}
```

### ExportPlugin

For exporting data to different formats.

```typescript
interface ExportPlugin extends DataPrismPlugin {
  capabilities: ['data_export'];
  
  export(data: any[], format: ExportFormat, options: ExportOptions): Promise<ExportResult>;
  getSupportedFormats(): ExportFormat[];
  getFormatOptions(format: ExportFormat): ExportFormatOptions;
  validateExportData(data: any[]): ValidationResult;
}

interface ExportOptions {
  filename?: string;
  includeHeaders?: boolean;
  dateFormat?: string;
  encoding?: string;
  compression?: 'none' | 'gzip' | 'zip';
}

interface ExportResult {
  data: Uint8Array | string;
  mimeType: string;
  filename: string;
  size: number;
}
```

## Plugin Development

### Creating a Plugin

```typescript
import { DataPrismPlugin, PluginContext } from '@dataprism/plugin-framework';

export class MyCustomPlugin implements DataPrismPlugin {
  readonly name = 'my-custom-plugin';
  readonly version = '1.0.0';
  readonly description = 'A custom plugin for DataPrism';
  readonly capabilities = ['data_processing'];
  
  private context: PluginContext;
  
  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    
    // Setup plugin resources
    await this.setupResources();
    
    // Register event handlers
    this.context.on('data:changed', this.handleDataChange.bind(this));
    
    // Log initialization
    this.context.log('info', 'Plugin initialized successfully');
  }
  
  async execute(action: string, params: any): Promise<any> {
    switch (action) {
      case 'process_data':
        return this.processData(params);
      case 'get_status':
        return this.getStatus();
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }
  
  async dispose(): Promise<void> {
    // Cleanup resources
    await this.cleanupResources();
    
    // Remove event handlers
    this.context.off('data:changed', this.handleDataChange);
    
    this.context.log('info', 'Plugin disposed successfully');
  }
  
  private async processData(params: any): Promise<any> {
    const { data, options } = params;
    
    // Validate input
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array');
    }
    
    // Process data
    const processed = data.map(item => ({
      ...item,
      processed: true,
      timestamp: Date.now()
    }));
    
    return {
      data: processed,
      count: processed.length,
      processingTime: Date.now()
    };
  }
  
  private async setupResources(): Promise<void> {
    // Setup plugin-specific resources
  }
  
  private async cleanupResources(): Promise<void> {
    // Cleanup plugin-specific resources
  }
  
  private handleDataChange(event: any): void {
    this.context.log('debug', 'Data changed', event);
  }
  
  private getStatus(): any {
    return {
      name: this.name,
      version: this.version,
      status: 'active',
      uptime: Date.now()
    };
  }
}
```

### Plugin Registration

```typescript
import { DataPrismOrchestrator } from '@dataprism/orchestration';
import { MyCustomPlugin } from './my-custom-plugin';

async function registerPlugin() {
  const orchestrator = new DataPrismOrchestrator();
  await orchestrator.initialize();
  
  const plugin = new MyCustomPlugin();
  const registry = orchestrator.getPluginRegistry();
  
  await registry.register(plugin);
  
  console.log('Plugin registered successfully');
}
```

## Security Model

### Permission System

```typescript
interface PluginPermissions {
  // Data access permissions
  'data:read': string[];      // Table names
  'data:write': string[];     // Table names
  'data:delete': string[];    // Table names
  
  // System permissions
  'system:execute': boolean;   // Execute system commands
  'system:network': boolean;   // Network access
  'system:filesystem': boolean; // File system access
  
  // Plugin permissions
  'plugin:install': boolean;   // Install other plugins
  'plugin:uninstall': boolean; // Uninstall plugins
  'plugin:configure': boolean; // Configure plugins
}
```

### Security Context

```typescript
interface SecurityContext {
  // Plugin identity
  pluginName: string;
  pluginVersion: string;
  pluginHash: string;
  
  // Permissions
  permissions: PluginPermissions;
  
  // Sandboxing
  sandboxed: boolean;
  allowedOrigins: string[];
  
  // Resource limits
  maxMemory: number;
  maxCpuTime: number;
  maxNetworkRequests: number;
}
```

## Advanced Features

### Plugin Communication

```typescript
// Plugin-to-plugin communication
interface PluginMessaging {
  sendMessage(targetPlugin: string, message: any): Promise<any>;
  broadcastMessage(message: any): Promise<void>;
  onMessage(handler: MessageHandler): void;
}

// Message types
interface PluginMessage {
  from: string;
  to: string;
  type: string;
  data: any;
  timestamp: number;
}
```

### Hot Reloading

```typescript
interface HotReloadSupport {
  // Reload plugin without restart
  reload(): Promise<void>;
  
  // Check if plugin supports hot reload
  supportsHotReload(): boolean;
  
  // Get reload configuration
  getReloadConfig(): ReloadConfig;
}

interface ReloadConfig {
  watchFiles: string[];
  preserveState: boolean;
  restartDependents: boolean;
}
```

### Plugin Dependencies

```typescript
interface PluginDependency {
  name: string;
  version: string;
  optional: boolean;
  reason?: string;
}

interface DependencyResolver {
  resolve(dependencies: PluginDependency[]): Promise<ResolvedDependency[]>;
  checkConflicts(plugins: DataPrismPlugin[]): ConflictReport[];
  createInstallPlan(plugin: DataPrismPlugin): InstallPlan;
}
```

## Testing Framework

### Plugin Testing

```typescript
import { PluginTestFramework } from '@dataprism/plugin-testing';

describe('MyCustomPlugin', () => {
  let testFramework: PluginTestFramework;
  let plugin: MyCustomPlugin;
  
  beforeEach(async () => {
    testFramework = new PluginTestFramework();
    plugin = new MyCustomPlugin();
    
    await testFramework.setup();
    await testFramework.registerPlugin(plugin);
  });
  
  afterEach(async () => {
    await testFramework.cleanup();
  });
  
  it('should process data correctly', async () => {
    const testData = [
      { id: 1, value: 'test1' },
      { id: 2, value: 'test2' }
    ];
    
    const result = await plugin.execute('process_data', {
      data: testData,
      options: {}
    });
    
    expect(result.data).toHaveLength(2);
    expect(result.data[0].processed).toBe(true);
  });
});
```

### Mock Context

```typescript
class MockPluginContext implements PluginContext {
  private mockData = new Map<string, any[]>();
  private mockConfig = new Map<string, any>();
  
  async getData(tableName: string): Promise<any[]> {
    return this.mockData.get(tableName) || [];
  }
  
  async setData(tableName: string, data: any[]): Promise<void> {
    this.mockData.set(tableName, data);
  }
  
  getConfig(key: string): any {
    return this.mockConfig.get(key);
  }
  
  setConfig(key: string, value: any): void {
    this.mockConfig.set(key, value);
  }
  
  // ... other mock implementations
}
```

## Performance Optimization

### Resource Management

```typescript
interface ResourceOptimization {
  // Memory optimization
  useMemoryPool: boolean;
  batchSize: number;
  memoryLimit: number;
  
  // CPU optimization
  workerThreads: number;
  enableSIMD: boolean;
  
  // I/O optimization
  cacheSize: number;
  compressionLevel: number;
}
```

### Profiling

```typescript
interface PluginProfiler {
  startProfiling(plugin: string): void;
  stopProfiling(plugin: string): ProfilingResult;
  getProfile(plugin: string): ProfilingData;
  exportProfile(plugin: string, format: string): string;
}

interface ProfilingResult {
  executionTime: number;
  memoryUsage: number;
  cpuUsage: number;
  ioOperations: number;
  hotSpots: HotSpot[];
}
```

## Examples

### Data Processing Plugin

```typescript
export class CSVProcessorPlugin implements DataProcessorPlugin {
  readonly name = 'csv-processor';
  readonly version = '1.0.0';
  readonly description = 'CSV data processing plugin';
  readonly capabilities = ['data_processing'];
  
  async process(data: any[], options: ProcessingOptions): Promise<ProcessingResult> {
    // Parse CSV data
    const parsed = data.map(row => this.parseCSVRow(row));
    
    // Apply transformations
    const transformed = await this.applyTransformations(parsed, options.transformations);
    
    // Apply filters
    const filtered = this.applyFilters(transformed, options.filters);
    
    return {
      data: filtered,
      metadata: {
        originalRows: data.length,
        processedRows: filtered.length,
        transformations: options.transformations?.length || 0
      },
      statistics: {
        processingTime: Date.now(),
        memoryUsage: process.memoryUsage().heapUsed
      }
    };
  }
  
  private parseCSVRow(row: string): any {
    // CSV parsing logic
    return row.split(',').reduce((obj, value, index) => {
      obj[`col_${index}`] = value.trim();
      return obj;
    }, {});
  }
  
  private async applyTransformations(data: any[], transformations: Transformation[]): Promise<any[]> {
    // Apply transformations
    return data; // Simplified
  }
  
  private applyFilters(data: any[], filters: Filter[]): any[] {
    // Apply filters
    return data; // Simplified
  }
}
```

### Visualization Plugin

```typescript
export class ChartPlugin implements VisualizationPlugin {
  readonly name = 'chart-plugin';
  readonly version = '1.0.0';
  readonly description = 'Chart visualization plugin';
  readonly capabilities = ['visualization'];
  
  async createVisualization(data: any[], config: VisualizationConfig): Promise<HTMLElement> {
    const container = document.createElement('div');
    container.className = 'chart-container';
    
    // Create chart based on config
    switch (config.type) {
      case 'bar':
        return this.createBarChart(container, data, config);
      case 'line':
        return this.createLineChart(container, data, config);
      case 'pie':
        return this.createPieChart(container, data, config);
      default:
        throw new Error(`Unsupported chart type: ${config.type}`);
    }
  }
  
  private createBarChart(container: HTMLElement, data: any[], config: VisualizationConfig): HTMLElement {
    // Bar chart implementation
    return container;
  }
  
  private createLineChart(container: HTMLElement, data: any[], config: VisualizationConfig): HTMLElement {
    // Line chart implementation
    return container;
  }
  
  private createPieChart(container: HTMLElement, data: any[], config: VisualizationConfig): HTMLElement {
    // Pie chart implementation
    return container;
  }
}
```

## Best Practices

1. **Error Handling**: Always implement proper error handling and recovery
2. **Resource Management**: Clean up resources in the dispose method
3. **Security**: Request only necessary permissions
4. **Performance**: Optimize for large datasets
5. **Testing**: Write comprehensive tests for all functionality
6. **Documentation**: Document all public APIs and usage examples

## Contributing

Contributions are welcome! Please see our [Contributing Guide](https://github.com/srnarasim/DataPrism/blob/main/CONTRIBUTING.md) for details.

## License

MIT License. See [LICENSE](https://github.com/srnarasim/DataPrism/blob/main/LICENSE) for details.