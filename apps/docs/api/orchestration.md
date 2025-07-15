# DataPrism Orchestration API

The DataPrism Orchestration layer provides high-level coordination between the WebAssembly core, plugins, and application logic.

## Overview

The orchestration layer handles:
- Cross-platform communication between WebAssembly and JavaScript
- Plugin lifecycle management
- Event coordination and data flow
- Resource allocation and cleanup
- Error handling and recovery

## DataPrismOrchestrator

The main orchestrator class that coordinates all components.

### Constructor

```typescript
const orchestrator = new DataPrismOrchestrator(options?: OrchestratorOptions);
```

#### OrchestratorOptions

```typescript
interface OrchestratorOptions {
  // Engine configuration
  engineOptions?: EngineOptions;
  
  // Plugin configuration
  pluginRegistry?: PluginRegistry;
  enablePlugins?: boolean;
  
  // Performance settings
  maxConcurrency?: number;
  memoryLimit?: number;
  timeoutMs?: number;
  
  // Event handling
  eventBus?: EventBus;
  enableEventLogging?: boolean;
  
  // Error handling
  errorHandler?: ErrorHandler;
  enableErrorRecovery?: boolean;
}
```

### Initialization

#### initialize()

Initialize the orchestrator and all components.

```typescript
await orchestrator.initialize();
```

**Returns:** `Promise<void>`

**Example:**
```typescript
const orchestrator = new DataPrismOrchestrator({
  maxConcurrency: 4,
  memoryLimit: 1024 * 1024 * 1024, // 1GB
  enablePlugins: true
});

await orchestrator.initialize();
console.log('Orchestrator initialized');
```

### Component Management

#### getEngine()

Get the underlying DataPrism engine instance.

```typescript
const engine = orchestrator.getEngine();
```

**Returns:** `DataPrismEngine`

#### getPluginRegistry()

Get the plugin registry for managing plugins.

```typescript
const registry = orchestrator.getPluginRegistry();
```

**Returns:** `PluginRegistry`

#### getEventBus()

Get the event bus for inter-component communication.

```typescript
const eventBus = orchestrator.getEventBus();
```

**Returns:** `EventBus`

## Event System

### EventBus

Handles communication between components.

```typescript
interface EventBus {
  // Subscribe to events
  on(event: string, handler: EventHandler): void;
  off(event: string, handler: EventHandler): void;
  once(event: string, handler: EventHandler): void;
  
  // Emit events
  emit(event: string, data?: any): void;
  
  // Event management
  listEvents(): string[];
  hasListeners(event: string): boolean;
  removeAllListeners(event?: string): void;
}
```

### System Events

```typescript
interface SystemEvents {
  'orchestrator:initialized': { timestamp: number };
  'orchestrator:shutdown': { timestamp: number };
  'engine:ready': { version: string };
  'plugin:loaded': { name: string; version: string };
  'plugin:error': { name: string; error: Error };
  'resource:allocated': { type: string; size: number };
  'resource:freed': { type: string; size: number };
  'error:recovered': { error: Error; recovery: string };
}
```

## Plugin Registry

### PluginRegistry

Manages plugin lifecycle and dependencies.

```typescript
interface PluginRegistry {
  // Plugin management
  register(plugin: DataPrismPlugin): Promise<void>;
  unregister(name: string): Promise<void>;
  get(name: string): DataPrismPlugin | null;
  list(): PluginInfo[];
  
  // Dependency management
  resolveDependencies(plugin: DataPrismPlugin): Promise<void>;
  checkConflicts(plugin: DataPrismPlugin): ValidationResult;
  
  // Lifecycle management
  initializeAll(): Promise<void>;
  shutdownAll(): Promise<void>;
}
```

### Plugin Lifecycle

```typescript
interface PluginLifecycle {
  'loading': { name: string };
  'loaded': { name: string };
  'initializing': { name: string };
  'initialized': { name: string };
  'executing': { name: string; action: string };
  'executed': { name: string; action: string; result: any };
  'disposing': { name: string };
  'disposed': { name: string };
  'error': { name: string; phase: string; error: Error };
}
```

## Resource Management

### ResourceManager

Handles memory and resource allocation.

```typescript
interface ResourceManager {
  // Memory management
  allocate(size: number, type: string): Promise<ResourceHandle>;
  free(handle: ResourceHandle): Promise<void>;
  getUsage(): ResourceUsage;
  
  // Cleanup
  cleanup(): Promise<void>;
  
  // Monitoring
  monitor(): ResourceMonitor;
}

interface ResourceUsage {
  allocated: number;
  free: number;
  total: number;
  fragmentation: number;
}
```

## Error Handling

### ErrorHandler

Centralized error handling and recovery.

```typescript
interface ErrorHandler {
  // Error processing
  handle(error: Error, context?: ErrorContext): Promise<void>;
  
  // Recovery strategies
  recover(error: Error): Promise<RecoveryResult>;
  
  // Error categorization
  categorize(error: Error): ErrorCategory;
  
  // Reporting
  report(error: Error): void;
}

interface ErrorContext {
  component: string;
  operation: string;
  timestamp: number;
  metadata?: any;
}

interface RecoveryResult {
  success: boolean;
  strategy: string;
  message: string;
  recovered?: any;
}
```

## Performance Monitoring

### PerformanceMonitor

Tracks and reports performance metrics.

```typescript
interface PerformanceMonitor {
  // Metrics collection
  startTimer(name: string): Timer;
  recordMetric(name: string, value: number): void;
  incrementCounter(name: string): void;
  
  // Reporting
  getMetrics(): PerformanceMetrics;
  generateReport(): PerformanceReport;
  
  // Thresholds
  setThreshold(metric: string, threshold: number): void;
  checkThresholds(): ThresholdViolation[];
}

interface PerformanceMetrics {
  timers: { [name: string]: TimerStats };
  counters: { [name: string]: number };
  gauges: { [name: string]: number };
  histograms: { [name: string]: HistogramStats };
}
```

## Configuration Management

### ConfigManager

Handles configuration for all components.

```typescript
interface ConfigManager {
  // Configuration access
  get(key: string, defaultValue?: any): any;
  set(key: string, value: any): void;
  has(key: string): boolean;
  
  // Configuration loading
  load(source: ConfigSource): Promise<void>;
  save(target: ConfigTarget): Promise<void>;
  
  // Validation
  validate(): ValidationResult;
  schema(): ConfigSchema;
}

interface ConfigSource {
  type: 'file' | 'url' | 'env' | 'object';
  source: string | object;
  format?: 'json' | 'yaml' | 'ini';
}
```

## Examples

### Basic Orchestration

```typescript
import { DataPrismOrchestrator } from '@dataprism/orchestration';

async function setupOrchestrator() {
  const orchestrator = new DataPrismOrchestrator({
    maxConcurrency: 4,
    memoryLimit: 1024 * 1024 * 1024, // 1GB
    enablePlugins: true,
    enableEventLogging: true
  });
  
  // Initialize all components
  await orchestrator.initialize();
  
  // Get components
  const engine = orchestrator.getEngine();
  const registry = orchestrator.getPluginRegistry();
  const eventBus = orchestrator.getEventBus();
  
  // Set up event handlers
  eventBus.on('plugin:loaded', (event) => {
    console.log(`Plugin loaded: ${event.name} v${event.version}`);
  });
  
  eventBus.on('error:recovered', (event) => {
    console.log(`Recovered from error: ${event.recovery}`);
  });
  
  return orchestrator;
}
```

### Plugin Integration

```typescript
import { createVisualizationPlugin } from '@dataprism/plugins';

async function setupWithPlugins() {
  const orchestrator = await setupOrchestrator();
  const registry = orchestrator.getPluginRegistry();
  
  // Register plugins
  const vizPlugin = createVisualizationPlugin();
  await registry.register(vizPlugin);
  
  // Initialize plugins
  await registry.initializeAll();
  
  // Use plugin through orchestrator
  const engine = orchestrator.getEngine();
  const result = await engine.executePlugin('visualization', 'create_chart', {
    type: 'bar',
    data: salesData
  });
  
  return result;
}
```

### Error Recovery

```typescript
async function setupWithErrorRecovery() {
  const orchestrator = new DataPrismOrchestrator({
    enableErrorRecovery: true,
    errorHandler: {
      handle: async (error, context) => {
        console.error(`Error in ${context.component}: ${error.message}`);
        
        // Custom error handling logic
        if (error.name === 'MemoryError') {
          await orchestrator.getResourceManager().cleanup();
        }
      },
      
      recover: async (error) => {
        // Attempt recovery
        if (error.name === 'PluginError') {
          // Restart plugin
          return { success: true, strategy: 'plugin_restart' };
        }
        
        return { success: false, strategy: 'none' };
      }
    }
  });
  
  await orchestrator.initialize();
  return orchestrator;
}
```

### Performance Monitoring

```typescript
async function setupWithMonitoring() {
  const orchestrator = await setupOrchestrator();
  const monitor = orchestrator.getPerformanceMonitor();
  
  // Set performance thresholds
  monitor.setThreshold('query_time', 2000); // 2 seconds
  monitor.setThreshold('memory_usage', 500 * 1024 * 1024); // 500MB
  
  // Monitor operations
  const timer = monitor.startTimer('data_processing');
  
  try {
    // Perform operations
    const engine = orchestrator.getEngine();
    await engine.loadData(largeDataset, 'analysis');
    
    timer.stop();
    
    // Check for threshold violations
    const violations = monitor.checkThresholds();
    if (violations.length > 0) {
      console.warn('Performance thresholds violated:', violations);
    }
    
  } catch (error) {
    timer.stop();
    throw error;
  }
}
```

## Best Practices

### Resource Management

```typescript
// Always cleanup resources
async function processData(data: any[]) {
  const orchestrator = await setupOrchestrator();
  
  try {
    const engine = orchestrator.getEngine();
    return await engine.processData(data);
  } finally {
    await orchestrator.shutdown();
  }
}
```

### Error Handling

```typescript
// Implement proper error boundaries
const orchestrator = new DataPrismOrchestrator({
  errorHandler: {
    handle: async (error, context) => {
      // Log error
      console.error('Orchestrator error:', error);
      
      // Report to monitoring service
      await reportError(error, context);
      
      // Attempt recovery
      if (context.component === 'engine') {
        await restartEngine();
      }
    }
  }
});
```

### Plugin Management

```typescript
// Load plugins conditionally
async function loadPlugins(orchestrator: DataPrismOrchestrator) {
  const registry = orchestrator.getPluginRegistry();
  
  // Check feature flags
  if (features.visualization) {
    await registry.register(createVisualizationPlugin());
  }
  
  if (features.analytics) {
    await registry.register(createAnalyticsPlugin());
  }
  
  // Initialize all loaded plugins
  await registry.initializeAll();
}
```

## API Reference

For detailed API documentation, see the [Core Engine API](/api/core).

## Examples

See the [Examples](/examples/) section for complete working examples.

## Contributing

Contributions are welcome! Please see our [Contributing Guide](https://github.com/srnarasim/DataPrism/blob/main/CONTRIBUTING.md) for details.

## License

MIT License. See [LICENSE](https://github.com/srnarasim/DataPrism/blob/main/LICENSE) for details.