# DataPrism Plugin Architecture - Customer Guide

## Overview

DataPrism Core features a comprehensive plugin system that enables customers to extend functionality with minimal effort. The system provides ready-to-use plugins and a powerful framework for creating custom plugins.

## 🚀 Quick Start for Customers

### Using Out-of-the-Box Plugins

The fastest way to get started is with our pre-built plugin collection:

```bash
# Install the plugin collection
npm install @dataprism/plugins-out-of-box

# Use in your application
import { createVisualizationPlugin } from "@dataprism/plugins-out-of-box";

const chartsPlugin = await createVisualizationPlugin("observable-charts");
await chartsPlugin.initialize(context);
await chartsPlugin.render(container, dataset, { theme: "dark" });
```

### Available Ready-to-Use Plugins

| Plugin | Category | Description | Bundle Size |
|--------|----------|-------------|-------------|
| **Observable Charts** | Visualization | Interactive D3-based charts with 5 chart types | ~25KB |
| **CSV Importer** | Integration | High-performance CSV import with streaming | ~20KB |
| **Semantic Clustering** | Processing | Advanced clustering with embeddings | ~35KB |
| **Performance Monitor** | Utility | Real-time system monitoring and alerts | ~15KB |

## 📖 Customer Documentation Links

### For Plugin Users
- **[Out-of-Box Plugins Guide](../packages/plugins/out-of-box/README.md)** - Complete guide to ready-made plugins
- **[Plugin Examples](../packages/plugins/examples/README.md)** - Hands-on tutorials and code examples
- **[Demo Application](../apps/demo-analytics/src/pages/PluginsDemoPage.tsx)** - Interactive plugin showcase

### For Plugin Developers
- **[Plugin System Specification](../PRPs/plugin-system.md)** - Technical architecture and implementation details
- **[Plugin Development Examples](../packages/plugins/examples/)** - Reference implementations for each plugin type
- **[Plugin Framework API](../packages/plugins/src/interfaces/)** - TypeScript interfaces and contracts

## 🎯 Customer Use Cases

### 1. **Business Intelligence Dashboards**
```typescript
// Create interactive dashboards with minimal code
const chartsPlugin = await createVisualizationPlugin("observable-charts");
const monitorPlugin = await createUtilityPlugin("performance-monitor");

// Import data
const csvPlugin = await createIntegrationPlugin("csv-importer");
const dataset = await csvPlugin.execute("import", { 
  file: salesData, 
  onProgress: (p) => console.log(`${p.percentage}% complete`) 
});

// Visualize results
await chartsPlugin.render(container, dataset, {
  chartSpec: { type: "bar", x: "region", y: "sales" }
});
```

### 2. **Data Analysis Workflows**
```typescript
// Complete analysis pipeline
const clusteringPlugin = await createProcessingPlugin("semantic-clustering");

// Analyze customer feedback
const clusters = await clusteringPlugin.execute("cluster", {
  data: customerFeedback,
  config: { algorithm: "kmeans", numClusters: 5 }
});

// Generate insights
const llmPlugin = await createIntegrationPlugin("llm-integration");
const insights = await llmPlugin.analyzeDataset(clusters, {
  focus: "customer satisfaction trends"
});
```

### 3. **Real-time Monitoring**
```typescript
// Set up performance monitoring
const monitor = await createUtilityPlugin("performance-monitor");
await monitor.execute("show", { mode: "overlay" });

// Configure alerts
await monitor.configure({
  thresholds: { memory: 1000, fps: 30, cpu: 80 },
  alerts: { email: "admin@company.com" }
});
```

## 🛠️ Creating Custom Plugins

### Plugin Development Process

1. **Choose Plugin Category**
   - `data-processing` - Transform and analyze data
   - `visualization` - Create charts and visual components
   - `integration` - Connect to external services
   - `utility` - System monitoring and tools

2. **Implement Plugin Interface**
```typescript
import { IDataProcessorPlugin } from "@dataprism/plugins";

export class MyCustomPlugin implements IDataProcessorPlugin {
  getName() { return "my-custom-plugin"; }
  getVersion() { return "1.0.0"; }
  
  async initialize(context: PluginContext) {
    // Setup plugin
  }
  
  async process(data: Dataset, options?: ProcessingOptions) {
    // Your custom logic here
    return transformedData;
  }
  
  // ... other required methods
}
```

3. **Create Plugin Manifest**
```typescript
export const manifest: PluginManifest = {
  name: "my-custom-plugin",
  version: "1.0.0",
  description: "Custom data processing plugin",
  category: "data-processing",
  entryPoint: "./my-custom-plugin.js",
  permissions: [
    { resource: "data", access: "read" },
    { resource: "data", access: "write" }
  ],
  compatibility: {
    minCoreVersion: "1.0.0",
    browsers: ["chrome", "firefox", "safari", "edge"]
  }
};
```

4. **Test and Deploy**
```bash
# Create plugin template
npx @dataprism/cli plugin create my-plugin --type data-processing

# Test plugin
npm run test:plugin my-plugin

# Package for distribution
npm run build:plugin my-plugin
```

## 📊 Performance Guidelines

### Plugin Performance Targets
- **Load Time**: <500ms for standard plugins
- **Memory Usage**: <25MB per plugin
- **Bundle Size**: <50KB (gzipped)
- **Execution Time**: <100ms for typical operations

### Best Practices
1. **Lazy Loading**: Load plugins only when needed
2. **Resource Cleanup**: Properly dispose of resources in `cleanup()`
3. **Error Handling**: Implement robust error boundaries
4. **Security**: Follow principle of least privilege for permissions

## 🔒 Security Considerations

### Plugin Sandboxing
- All plugins run in isolated environments
- Capability-based permission system
- Resource quotas enforced (CPU, memory)
- Network access controls

### Permission System
```typescript
// Request minimal permissions
permissions: [
  { resource: "data", access: "read", scope: "user-data" },
  { resource: "ui", access: "write", scope: "visualization" }
]
```

## 🎨 Customization Options

### Theme and Styling
```typescript
// All visualization plugins support theming
await chartsPlugin.configure({
  theme: "dark",
  colors: ["#ff6b6b", "#4ecdc4", "#45b7d1"],
  fonts: { family: "Inter", size: "14px" }
});
```

### Plugin Configuration
```typescript
// Each plugin supports extensive configuration
await csvPlugin.configure({
  chunkSize: 50000,
  autoDetectTypes: true,
  delimiter: ",",
  encoding: "UTF-8"
});
```

## 📈 Integration with DataPrism Core

### Seamless Integration
```typescript
import { DataPrismEngine } from "@dataprism/core";
import { CoreIntegration } from "@dataprism/plugins";

const engine = new DataPrismEngine();
await engine.initialize();

const plugins = new CoreIntegration(engine);
await plugins.initialize();

// Plugins can now access core engine features
const result = await plugins.executePluginOperation(
  "my-plugin", 
  "process", 
  { data: dataset }
);
```

### Event-Driven Architecture
```typescript
// Listen to core engine events
plugins.eventBus.subscribe("core:query:complete", (data) => {
  // Update visualizations automatically
  chartsPlugin.update(data);
});
```

## 🤝 Community and Support

### Getting Help
- **[GitHub Issues](https://github.com/srnarasim/DataPrism/issues)** - Bug reports and feature requests
- **[GitHub Discussions](https://github.com/srnarasim/DataPrism/discussions)** - Community support
- **[Plugin Examples](../packages/plugins/examples/)** - Reference implementations

### Contributing Plugins
1. Follow the [Plugin Development Guide](../packages/plugins/examples/README.md)
2. Submit plugins via pull requests
3. Include comprehensive tests and documentation
4. Follow security and performance guidelines

## 🔧 Troubleshooting

### Common Issues
1. **Plugin Not Loading**
   - Check manifest validity
   - Verify compatibility requirements
   - Review security permissions

2. **Performance Issues**
   - Check resource usage
   - Optimize data processing
   - Use streaming for large datasets

3. **Integration Problems**
   - Verify plugin interfaces
   - Check event subscriptions
   - Review service proxy usage

### Debug Tools
```typescript
// Enable plugin debugging
const pluginManager = plugins.getPluginManager();
const info = pluginManager.getPluginInfo("my-plugin");
console.log(info.status, info.resourceUsage);
```

---

This guide provides customers with everything they need to leverage DataPrism's plugin architecture, from using ready-made plugins to developing custom solutions.