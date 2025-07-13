# DataPrism Plugin Examples

This directory contains comprehensive examples of plugins for the DataPrism Core Plugin System. These examples demonstrate how to implement plugins for each category and showcase the full capabilities of the plugin framework.

## 📁 Directory Structure

```
examples/
├── data-processor/          # Data processing plugin examples
│   └── csv-processor.ts     # Advanced CSV data processing
├── visualization/           # Visualization plugin examples
│   └── chart-renderer.ts    # Interactive chart rendering
├── integration/             # Integration plugin examples
│   └── llm-integration.ts   # LLM and AI integration
├── utility/                 # Utility plugin examples
│   └── performance-monitor.ts # Performance monitoring and security
└── usage-examples/          # Usage examples and tutorials
    ├── basic-usage.ts       # Basic plugin usage
    ├── advanced-patterns.ts # Advanced implementation patterns
    └── integration-guide.ts # Integration with DataPrism Core
```

## 🚀 Quick Start

### 1. Basic Plugin Usage

```typescript
import { DataPrismPluginSystem } from "@dataprism/plugins";

// Initialize the plugin system
const pluginSystem = await DataPrismPluginSystem.create();

// Register a plugin
await pluginSystem.getPluginManager().registerPlugin(manifest);

// Load and activate a plugin
await pluginSystem.getPluginManager().loadPlugin("csv-processor");
await pluginSystem.getPluginManager().activatePlugin("csv-processor");

// Execute plugin operations
const result = await pluginSystem
  .getPluginManager()
  .executePlugin("csv-processor", "process", {
    dataset: myData,
    options: { validation: true },
  });
```

### 2. Using the Example Plugins

Each example plugin can be used as a starting point for your own plugin development:

```typescript
// Import example plugins
import CSVProcessorPlugin from "./data-processor/csv-processor.js";
import ChartRendererPlugin from "./visualization/chart-renderer.js";
import LLMIntegrationPlugin from "./integration/llm-integration.js";
import PerformanceMonitorPlugin from "./utility/performance-monitor.js";

// Use them directly or extend them
class MyCustomProcessor extends CSVProcessorPlugin {
  // Add custom functionality
}
```

## 📊 Data Processing Plugin Example

The **CSV Processor Plugin** demonstrates advanced data processing capabilities:

### Features

- ✅ CSV parsing with configurable delimiters
- ✅ Data validation and quality checks
- ✅ Statistical transformations
- ✅ Batch and streaming processing
- ✅ Error handling and metrics

### Usage Example

```typescript
const processor = new CSVProcessorPlugin();
await processor.initialize(context);
await processor.activate();

// Process CSV data
const result = await processor.process(dataset, {
  validation: true,
  mode: "async",
});

// Apply transformations
const transformed = await processor.transform(dataset, [
  { field: "name", operation: "uppercase", parameters: {} },
  { field: "price", operation: "multiply", parameters: { factor: 1.1 } },
]);
```

## 📈 Visualization Plugin Example

The **Chart Renderer Plugin** shows how to create interactive visualizations:

### Features

- ✅ Multiple chart types (bar, line, pie, scatter, heatmap)
- ✅ Interactive features (tooltips, zoom, pan)
- ✅ Export capabilities (SVG, PNG, PDF, HTML)
- ✅ Responsive design and theming
- ✅ Real-time updates

### Usage Example

```typescript
const renderer = new ChartRendererPlugin();
await renderer.initialize(context);
await renderer.activate();

// Render a chart
await renderer.render(containerElement, dataset, {
  chartType: "bar",
  theme: "dark",
  responsive: true,
  animation: true,
});

// Export chart
const svgBlob = await renderer.export("svg");
```

## 🔗 Integration Plugin Example

The **LLM Integration Plugin** demonstrates external service integration:

### Features

- ✅ Multiple LLM provider support (OpenAI, Anthropic, Local)
- ✅ Intelligent caching and rate limiting
- ✅ Data analysis and insight generation
- ✅ Natural language query processing
- ✅ Error handling and fallbacks

### Usage Example

```typescript
const llmPlugin = new LLMIntegrationPlugin();
await llmPlugin.initialize(context);
await llmPlugin.activate();

// Generate insights from data
const analysis = await llmPlugin.analyzeDataset(dataset, {
  provider: "openai",
  focus: "trends and patterns",
});

// Process natural language queries
const queryResult = await llmPlugin.processNaturalLanguageQuery(
  "What are the top selling products this month?",
  dataset,
);
```

## 🔧 Utility Plugin Example

The **Performance Monitor Plugin** shows system monitoring capabilities:

### Features

- ✅ Real-time performance monitoring
- ✅ Health checks and diagnostics
- ✅ Security scanning and vulnerability detection
- ✅ Intelligent alerting
- ✅ Performance optimization

### Usage Example

```typescript
const monitor = new PerformanceMonitorPlugin();
await monitor.initialize(context);
await monitor.activate();

// Get system status
const status = await monitor.getSystemStatus();

// Perform health check
const health = await monitor.performHealthCheck();

// Run security scan
const securityScan = await monitor.performSecurityScan();

// Optimize performance
const optimization = await monitor.optimizePerformance();
```

## 🛠 Development Patterns

### Plugin Base Class Usage

All example plugins demonstrate the use of proper plugin architecture:

```typescript
export class MyPlugin implements IDataProcessorPlugin {
  private context: PluginContext | null = null;
  private initialized = false;
  private active = false;

  // Implement required interface methods
  getName(): string {
    return "my-plugin";
  }
  getVersion(): string {
    return "1.0.0";
  }
  // ... other required methods

  // Lifecycle management
  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    this.initialized = true;
  }

  async activate(): Promise<void> {
    if (!this.initialized) {
      throw new Error("Plugin must be initialized before activation");
    }
    this.active = true;
  }

  // Core operations
  async execute(operation: string, params: any): Promise<any> {
    if (!this.active) {
      throw new Error("Plugin is not active");
    }
    // Implementation
  }
}
```

### Error Handling Pattern

```typescript
try {
  const result = await this.performOperation(params);
  this.emit("operation:success", { result });
  return result;
} catch (error) {
  this.log("error", "Operation failed", error);
  this.emit("operation:error", { error: String(error) });
  throw error;
}
```

### Event-Driven Communication

```typescript
// Emit events
this.emit("data:processed", { dataset: result });

// Listen to events
this.context?.eventBus.subscribe(
  "data:updated",
  this.handleDataUpdate.bind(this),
);
```

### Configuration Management

```typescript
async configure(settings: any): Promise<void> {
  this.log('info', 'Updating configuration', settings);

  // Validate settings
  this.validateConfiguration(settings);

  // Apply settings
  Object.assign(this.config, settings);

  // Notify about changes
  this.emit('config:changed', this.config);
}
```

## 📋 Plugin Manifest Examples

Each plugin includes a comprehensive manifest:

```typescript
export const manifest: PluginManifest = {
  name: "example-plugin",
  version: "1.0.0",
  description: "Example plugin demonstrating best practices",
  author: "DataPrism Team",
  license: "MIT",
  keywords: ["example", "tutorial"],
  category: "data-processing",
  entryPoint: "./example-plugin.js",
  dependencies: [],
  permissions: [
    { resource: "data", access: "read" },
    { resource: "data", access: "write" },
  ],
  configuration: {
    option1: {
      type: "string",
      default: "default-value",
      description: "Configuration option description",
    },
  },
  compatibility: {
    minCoreVersion: "0.1.0",
    browsers: ["chrome", "firefox", "safari", "edge"],
  },
};
```

## 🧪 Testing Your Plugins

Example test structure for plugins:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { MyPlugin } from "./my-plugin.js";

describe("MyPlugin", () => {
  let plugin: MyPlugin;
  let mockContext: PluginContext;

  beforeEach(async () => {
    plugin = new MyPlugin();
    mockContext = createMockContext();
    await plugin.initialize(mockContext);
    await plugin.activate();
  });

  it("should process data correctly", async () => {
    const result = await plugin.execute("process", { data: testData });
    expect(result).toBeDefined();
  });
});
```

## 🚀 Performance Considerations

### Memory Management

```typescript
// Clean up resources in cleanup method
async cleanup(): Promise<void> {
  this.clearCaches();
  this.closeConnections();
  this.removeEventListeners();
  this.context = null;
}
```

### Efficient Data Processing

```typescript
// Use streaming for large datasets
async stream(dataStream: ReadableStream<Dataset>): Promise<ReadableStream<Dataset>> {
  return new ReadableStream({
    start(controller) {
      // Implement streaming logic
    }
  });
}
```

### Caching Strategies

```typescript
// Implement intelligent caching
private cache = new Map<string, CachedResult>();

private getCacheKey(operation: string, params: any): string {
  return `${operation}:${JSON.stringify(params)}`;
}
```

## 📚 Additional Resources

- [Plugin Development Guide](../docs/plugin-development.md)
- [API Reference](../docs/api-reference.md)
- [Best Practices](../docs/best-practices.md)
- [Security Guidelines](../docs/security.md)
- [Performance Optimization](../docs/performance.md)

## 🤝 Contributing

To contribute new example plugins:

1. Follow the established patterns in existing examples
2. Include comprehensive documentation and comments
3. Add proper error handling and logging
4. Include unit tests
5. Update this README with your example

## 📄 License

All examples are provided under the MIT License and can be used as starting points for your own plugin development.

---

These examples demonstrate the full capabilities of the DataPrism Plugin System and provide practical starting points for developing your own plugins. Each example showcases different aspects of the plugin architecture and can be used independently or as inspiration for custom implementations.
