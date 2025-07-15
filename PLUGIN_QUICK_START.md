# DataPrism Plugins - Quick Start Guide

## 🚀 Ready-to-Use Plugins (No Development Required)

DataPrism comes with 4 production-ready plugins that you can use immediately:

### 1. 📊 **Observable Charts Plugin**
Create interactive visualizations with just a few lines of code:

```typescript
import { createVisualizationPlugin } from "@dataprism/plugins-out-of-box";

const chartsPlugin = await createVisualizationPlugin("observable-charts");
await chartsPlugin.initialize(context);

// Create a chart
await chartsPlugin.render(document.getElementById("chart"), dataset, {
  chartSpec: { type: "bar", x: "category", y: "sales" },
  theme: "dark",
  responsive: true
});
```

**Features:** Bar, Line, Area, Scatter, Histogram charts • Interactive tooltips • Export to SVG/PNG • Responsive design

### 2. 📁 **CSV Importer Plugin**
Import large CSV files with progress tracking:

```typescript
import { createIntegrationPlugin } from "@dataprism/plugins-out-of-box";

const csvPlugin = await createIntegrationPlugin("csv-importer");
await csvPlugin.initialize(context);

// Import CSV file
const dataset = await csvPlugin.execute("import", {
  file: csvFile,
  onProgress: (progress) => console.log(`${progress.percentage}% complete`)
});
```

**Features:** Handles 4GB+ files • Auto-detects delimiters • Type inference • Progress tracking • Error reporting

### 3. 🧠 **Semantic Clustering Plugin**
Analyze and cluster your data automatically:

```typescript
import { createProcessingPlugin } from "@dataprism/plugins-out-of-box";

const clusteringPlugin = await createProcessingPlugin("semantic-clustering");
await clusteringPlugin.initialize(context);

// Cluster data
const clusters = await clusteringPlugin.execute("cluster", {
  data: dataset,
  config: { algorithm: "kmeans", numClusters: 5 }
});
```

**Features:** K-means & DBSCAN algorithms • Text embeddings • Interactive visualization • Quality metrics

### 4. 📈 **Performance Monitor Plugin**
Monitor your application in real-time:

```typescript
import { createUtilityPlugin } from "@dataprism/plugins-out-of-box";

const monitor = await createUtilityPlugin("performance-monitor");
await monitor.initialize(context);

// Show performance overlay
await monitor.execute("show", { mode: "overlay" });

// Set up alerts
await monitor.configure({
  thresholds: { memory: 1000, fps: 30, cpu: 80 }
});
```

**Features:** Real-time monitoring • Memory/CPU/FPS tracking • Configurable alerts • Export logs

## 🎨 Complete Example: Sales Dashboard

Here's a complete example showing how to use multiple plugins together:

```typescript
import {
  createIntegrationPlugin,
  createProcessingPlugin,
  createVisualizationPlugin,
  createUtilityPlugin
} from "@dataprism/plugins-out-of-box";

async function createSalesDashboard(csvFile) {
  // 1. Start performance monitoring
  const monitor = await createUtilityPlugin("performance-monitor");
  await monitor.initialize(context);
  await monitor.execute("show", { mode: "overlay" });

  // 2. Import sales data
  const csvPlugin = await createIntegrationPlugin("csv-importer");
  await csvPlugin.initialize(context);
  
  const salesData = await csvPlugin.execute("import", {
    file: csvFile,
    onProgress: (p) => console.log(`Loading: ${p.percentage}%`)
  });

  // 3. Analyze customer segments
  const clustering = await createProcessingPlugin("semantic-clustering");
  await clustering.initialize(context);
  
  const customerSegments = await clustering.execute("cluster", {
    data: salesData,
    config: { algorithm: "kmeans", numClusters: 3 }
  });

  // 4. Create visualizations
  const charts = await createVisualizationPlugin("observable-charts");
  await charts.initialize(context);

  // Sales by region
  await charts.render(document.getElementById("sales-chart"), salesData, {
    chartSpec: { type: "bar", x: "region", y: "sales" }
  });

  // Customer segments
  await charts.render(document.getElementById("segments-chart"), customerSegments, {
    chartSpec: { type: "scatter", x: "value", y: "frequency", color: "cluster" }
  });

  return { salesData, customerSegments };
}

// Usage
const dashboard = await createSalesDashboard(mySalesFile);
```

## 📦 Installation

```bash
# Install the plugin collection
npm install @dataprism/plugins-out-of-box

# Or install specific plugins
npm install @dataprism/observable-charts-plugin
npm install @dataprism/csv-importer-plugin
npm install @dataprism/clustering-plugin
npm install @dataprism/performance-monitor-plugin
```

## 🔧 Configuration Examples

### Chart Customization
```typescript
await chartsPlugin.configure({
  theme: "dark",
  colors: ["#ff6b6b", "#4ecdc4", "#45b7d1"],
  animation: { duration: 300, easing: "ease-in-out" },
  responsive: true
});
```

### CSV Import Settings
```typescript
await csvPlugin.configure({
  delimiter: ",",
  encoding: "UTF-8",
  chunkSize: 10000,
  autoDetectTypes: true
});
```

### Clustering Parameters
```typescript
await clusteringPlugin.configure({
  algorithm: "dbscan",
  eps: 0.5,
  minPoints: 10,
  features: ["price", "quantity", "rating"]
});
```

## 🛠️ Creating Custom Plugins

If you need custom functionality, you can create your own plugins:

### 1. Use the CLI Generator
```bash
# Generate a plugin template
npx @dataprism/cli plugin create my-custom-plugin --type data-processing

# This creates:
# - Plugin class with all required methods
# - Manifest file with metadata
# - Test files
# - Documentation template
```

### 2. Plugin Structure
```typescript
export class MyCustomPlugin implements IDataProcessorPlugin {
  getName() { return "my-custom-plugin"; }
  getVersion() { return "1.0.0"; }
  
  async initialize(context: PluginContext) {
    // Setup your plugin
  }
  
  async process(data: Dataset, options?: ProcessingOptions) {
    // Your custom logic
    return processedData;
  }
}
```

### 3. Test and Deploy
```bash
# Test your plugin
npm run test:plugin my-custom-plugin

# Build for distribution
npm run build:plugin my-custom-plugin
```

## 📚 More Information

- **[Complete Plugin Guide](./docs/PLUGIN_ARCHITECTURE_GUIDE.md)** - Detailed documentation
- **[Out-of-Box Plugins](./packages/plugins/out-of-box/README.md)** - Full API reference
- **[Plugin Examples](./packages/plugins/examples/README.md)** - Code examples and tutorials
- **[Demo Application](./apps/demo-analytics/)** - Interactive plugin showcase

## 🤝 Support

- **[GitHub Issues](https://github.com/srnarasim/DataPrism/issues)** - Bug reports and feature requests
- **[GitHub Discussions](https://github.com/srnarasim/DataPrism/discussions)** - Community support
- **[Plugin Examples](./packages/plugins/examples/)** - Reference implementations

---

**Get started in minutes with ready-to-use plugins, or create custom solutions with our comprehensive plugin framework!**