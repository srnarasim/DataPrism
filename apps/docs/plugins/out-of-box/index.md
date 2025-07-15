# Out-of-Box Plugins

DataPrism comes with 4 production-ready plugins that you can use immediately. These plugins are optimized, tested, and ready for production use.

## 🚀 Quick Start

```javascript
import { DataPrismEngine } from "https://srnarasim.github.io/DataPrism/dataprism.min.js";
import { 
  createVisualizationPlugin,
  createIntegrationPlugin,
  createProcessingPlugin,
  createUtilityPlugin
} from "https://srnarasim.github.io/DataPrism/dataprism-plugins.min.js";

// Use ready-made plugins
const chartsPlugin = await createVisualizationPlugin("observable-charts");
const csvPlugin = await createIntegrationPlugin("csv-importer");
const clusteringPlugin = await createProcessingPlugin("semantic-clustering");
const monitorPlugin = await createUtilityPlugin("performance-monitor");
```

## 📊 1. Observable Charts Plugin

Create interactive, responsive visualizations with D3.js power.

### Features
- **5 Chart Types**: Bar, Line, Area, Scatter, Histogram
- **Interactive Tooltips**: Hover effects and data exploration
- **Responsive Design**: Automatically adapts to container size
- **Export Options**: Save as SVG, PNG, or PDF
- **Theming Support**: Dark/light themes and custom colors

### Usage

```javascript
const chartsPlugin = await createVisualizationPlugin("observable-charts");
await chartsPlugin.initialize(context);

// Create a bar chart
await chartsPlugin.render(document.getElementById("chart"), dataset, {
  chartSpec: {
    type: "bar",
    x: "category",
    y: "sales",
    color: "region"
  },
  theme: "dark",
  responsive: true
});
```

### Configuration Options

```javascript
await chartsPlugin.configure({
  theme: "dark",
  colors: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#f7b731", "#5f27cd"],
  animation: {
    duration: 300,
    easing: "ease-in-out"
  },
  responsive: true,
  exportOptions: {
    formats: ["svg", "png", "pdf"]
  }
});
```

### Chart Types

#### Bar Charts
```javascript
await chartsPlugin.render(container, data, {
  chartSpec: {
    type: "bar",
    x: "category",
    y: "value",
    color: "series"
  }
});
```

#### Line Charts
```javascript
await chartsPlugin.render(container, data, {
  chartSpec: {
    type: "line",
    x: "date",
    y: "value",
    color: "series"
  }
});
```

#### Scatter Plots
```javascript
await chartsPlugin.render(container, data, {
  chartSpec: {
    type: "scatter",
    x: "height",
    y: "weight",
    size: "age",
    color: "gender"
  }
});
```

### Advanced Features

#### Interactive Events
```javascript
await chartsPlugin.render(container, data, {
  chartSpec: { /* ... */ },
  events: {
    onClick: (event, data) => {
      console.log("Clicked:", data);
    },
    onHover: (event, data) => {
      showTooltip(data);
    }
  }
});
```

#### Custom Styling
```javascript
await chartsPlugin.render(container, data, {
  chartSpec: { /* ... */ },
  style: {
    backgroundColor: "#f8f9fa",
    fontFamily: "Inter, sans-serif",
    fontSize: 14,
    gridColor: "#e9ecef"
  }
});
```

---

## 📁 2. CSV Importer Plugin

High-performance CSV import with streaming support for large files.

### Features
- **Large File Support**: Handles files up to 4GB
- **Streaming Import**: Memory-efficient processing
- **Auto-Type Detection**: Automatically detects column types
- **Progress Tracking**: Real-time import progress
- **Error Handling**: Detailed error reporting and recovery

### Usage

```javascript
const csvPlugin = await createIntegrationPlugin("csv-importer");
await csvPlugin.initialize(context);

// Import CSV file
const dataset = await csvPlugin.execute("import", {
  file: csvFile,
  onProgress: (progress) => {
    console.log(`${progress.percentage}% complete`);
    console.log(`Processed ${progress.rowsProcessed} rows`);
  },
  onError: (error) => {
    console.error("Import error:", error);
  }
});
```

### Configuration Options

```javascript
await csvPlugin.configure({
  delimiter: ",",
  encoding: "UTF-8",
  chunkSize: 10000,
  autoDetectTypes: true,
  headers: true,
  skipEmptyLines: true,
  trimWhitespace: true
});
```

### Advanced Import Options

#### Custom Delimiter Detection
```javascript
const dataset = await csvPlugin.execute("import", {
  file: csvFile,
  options: {
    delimiter: "auto", // Auto-detect delimiter
    fallbackDelimiter: ",",
    customDelimiters: ["|", "\t", ";"]
  }
});
```

#### Type Conversion
```javascript
const dataset = await csvPlugin.execute("import", {
  file: csvFile,
  options: {
    typeConversion: {
      "date_column": "date",
      "price_column": "number",
      "category_column": "string"
    }
  }
});
```

#### Data Validation
```javascript
const dataset = await csvPlugin.execute("import", {
  file: csvFile,
  options: {
    validation: {
      required: ["id", "name"],
      constraints: {
        "age": { min: 0, max: 120 },
        "email": { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
      }
    }
  }
});
```

### Error Handling

```javascript
try {
  const dataset = await csvPlugin.execute("import", {
    file: csvFile,
    onError: (error, context) => {
      console.error(`Error at row ${context.row}:`, error.message);
      // Optionally skip or fix the error
      return { action: "skip" };
    }
  });
} catch (error) {
  console.error("Import failed:", error);
}
```

---

## 🧠 3. Semantic Clustering Plugin

Advanced clustering with machine learning algorithms and embeddings.

### Features
- **Multiple Algorithms**: K-means, DBSCAN, hierarchical clustering
- **Text Embeddings**: Semantic similarity for text data
- **Interactive Visualization**: Explore clusters visually
- **Quality Metrics**: Silhouette score, inertia, and more
- **Scalable**: Optimized for large datasets

### Usage

```javascript
const clusteringPlugin = await createProcessingPlugin("semantic-clustering");
await clusteringPlugin.initialize(context);

// Cluster numerical data
const clusters = await clusteringPlugin.execute("cluster", {
  data: dataset,
  config: {
    algorithm: "kmeans",
    numClusters: 5,
    features: ["price", "rating", "reviews"]
  }
});
```

### Clustering Algorithms

#### K-means Clustering
```javascript
const clusters = await clusteringPlugin.execute("cluster", {
  data: dataset,
  config: {
    algorithm: "kmeans",
    numClusters: 5,
    maxIterations: 100,
    tolerance: 0.001
  }
});
```

#### DBSCAN Clustering
```javascript
const clusters = await clusteringPlugin.execute("cluster", {
  data: dataset,
  config: {
    algorithm: "dbscan",
    eps: 0.5,
    minPoints: 5
  }
});
```

#### Hierarchical Clustering
```javascript
const clusters = await clusteringPlugin.execute("cluster", {
  data: dataset,
  config: {
    algorithm: "hierarchical",
    linkage: "ward",
    numClusters: 3
  }
});
```

### Text Clustering

```javascript
const textClusters = await clusteringPlugin.execute("cluster", {
  data: textDataset,
  config: {
    algorithm: "kmeans",
    numClusters: 5,
    features: ["description"],
    textOptions: {
      embeddings: "sentence-transformers",
      maxLength: 512,
      language: "en"
    }
  }
});
```

### Visualization

```javascript
// Visualize clusters
await clusteringPlugin.execute("visualize", {
  clusters: clusters,
  config: {
    type: "scatter",
    dimensions: 2,
    colorBy: "cluster",
    labels: true
  }
});
```

### Quality Metrics

```javascript
const metrics = await clusteringPlugin.execute("evaluate", {
  data: dataset,
  clusters: clusters,
  config: {
    metrics: ["silhouette", "inertia", "davies_bouldin"]
  }
});

console.log("Silhouette Score:", metrics.silhouette);
console.log("Inertia:", metrics.inertia);
```

---

## 🔧 4. Performance Monitor Plugin

Real-time system monitoring with alerts and logging.

### Features
- **Real-time Monitoring**: Live FPS, memory, and CPU tracking
- **Configurable Alerts**: Set custom performance thresholds
- **Visual Dashboard**: Overlay or standalone monitoring interface
- **Export Logs**: Save performance data for analysis
- **Integration Ready**: Works with existing monitoring systems

### Usage

```javascript
const monitorPlugin = await createUtilityPlugin("performance-monitor");
await monitorPlugin.initialize(context);

// Show performance overlay
await monitorPlugin.execute("show", {
  mode: "overlay",
  position: "top-right"
});

// Configure alerts
await monitorPlugin.configure({
  thresholds: {
    memory: 1000, // MB
    fps: 30,
    cpu: 80 // %
  },
  alerts: {
    email: "admin@company.com",
    webhook: "https://api.company.com/alerts"
  }
});
```

### Monitoring Modes

#### Overlay Mode
```javascript
await monitorPlugin.execute("show", {
  mode: "overlay",
  position: "top-right",
  opacity: 0.8,
  draggable: true
});
```

#### Dashboard Mode
```javascript
await monitorPlugin.execute("show", {
  mode: "dashboard",
  container: document.getElementById("monitor-dashboard"),
  layout: "grid"
});
```

#### Headless Mode
```javascript
await monitorPlugin.execute("start", {
  mode: "headless",
  interval: 1000, // ms
  onUpdate: (metrics) => {
    console.log("Performance:", metrics);
  }
});
```

### Performance Metrics

```javascript
const metrics = await monitorPlugin.execute("getMetrics");
console.log(metrics);
// Output:
// {
//   fps: 60,
//   memory: { used: 245, total: 1024 },
//   cpu: 23.5,
//   gpu: { usage: 45, memory: 512 },
//   network: { bytesIn: 1024, bytesOut: 512 }
// }
```

### Custom Alerts

```javascript
await monitorPlugin.configure({
  customAlerts: [
    {
      name: "High Memory Usage",
      condition: (metrics) => metrics.memory.used > 800,
      action: (metrics) => {
        console.warn("Memory usage high:", metrics.memory.used, "MB");
      }
    },
    {
      name: "Low FPS",
      condition: (metrics) => metrics.fps < 30,
      action: (metrics) => {
        console.warn("FPS dropped to:", metrics.fps);
      }
    }
  ]
});
```

### Export Performance Logs

```javascript
const logs = await monitorPlugin.execute("exportLogs", {
  format: "json",
  timeRange: {
    start: Date.now() - 3600000, // 1 hour ago
    end: Date.now()
  }
});

// Save logs
const blob = new Blob([JSON.stringify(logs)], { type: "application/json" });
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = "performance-logs.json";
a.click();
```

---

## 🔄 Complete Workflow Example

Here's a complete example using all four plugins together:

```javascript
import { DataPrismEngine } from "https://srnarasim.github.io/DataPrism/dataprism.min.js";
import { 
  createVisualizationPlugin,
  createIntegrationPlugin,
  createProcessingPlugin,
  createUtilityPlugin
} from "https://srnarasim.github.io/DataPrism/dataprism-plugins.min.js";

async function createAnalyticsDashboard(csvFile) {
  // Initialize engine
  const engine = new DataPrismEngine();
  await engine.initialize();
  
  // Start performance monitoring
  const monitor = await createUtilityPlugin("performance-monitor");
  await monitor.initialize(context);
  await monitor.execute("show", { mode: "overlay" });
  
  // Import data
  const csvPlugin = await createIntegrationPlugin("csv-importer");
  await csvPlugin.initialize(context);
  
  const dataset = await csvPlugin.execute("import", {
    file: csvFile,
    onProgress: (p) => console.log(`Loading: ${p.percentage}%`)
  });
  
  // Analyze data with clustering
  const clustering = await createProcessingPlugin("semantic-clustering");
  await clustering.initialize(context);
  
  const clusters = await clustering.execute("cluster", {
    data: dataset,
    config: { algorithm: "kmeans", numClusters: 5 }
  });
  
  // Visualize results
  const charts = await createVisualizationPlugin("observable-charts");
  await charts.initialize(context);
  
  // Original data visualization
  await charts.render(document.getElementById("main-chart"), dataset, {
    chartSpec: { type: "scatter", x: "x", y: "y", color: "category" }
  });
  
  // Clustered data visualization
  await charts.render(document.getElementById("cluster-chart"), clusters, {
    chartSpec: { type: "scatter", x: "x", y: "y", color: "cluster" }
  });
  
  return { dataset, clusters };
}

// Usage
const dashboard = await createAnalyticsDashboard(myFile);
```

## 📋 Plugin Comparison

| Plugin | Category | Size | Use Case | Complexity |
|--------|----------|------|----------|------------|
| **Observable Charts** | Visualization | ~25KB | Interactive charts and graphs | Easy |
| **CSV Importer** | Integration | ~20KB | Data import and processing | Easy |
| **Semantic Clustering** | Processing | ~35KB | Data analysis and ML | Medium |
| **Performance Monitor** | Utility | ~15KB | System monitoring | Easy |

## 🎯 Next Steps

1. **Try the plugins** - Copy the examples above and start experimenting
2. **Customize configuration** - Adjust settings for your specific needs
3. **Build workflows** - Combine multiple plugins for powerful analytics
4. **Create custom plugins** - Use our [AI Plugin Generator](../ai-generator/) for custom functionality

## 🆘 Need Help?

- **[Plugin Examples](../examples/)** - More detailed code examples
- **[Configuration Guide](../configuration/)** - Complete configuration reference
- **[Troubleshooting](../troubleshooting/)** - Common issues and solutions
- **[GitHub Issues](https://github.com/srnarasim/DataPrism/issues)** - Report bugs or request features

---

**Ready to dive deeper? Check out our [Plugin Development Guide](../development/) or try the [AI Plugin Generator](../ai-generator/) to create your own custom plugins!**