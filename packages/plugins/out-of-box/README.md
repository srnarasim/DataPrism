# DataPrism Core Out-of-the-Box Plugins

A comprehensive collection of production-ready plugins for DataPrism Core that provide essential functionality across visualization, integration, data processing, and utility categories.

## 🚀 Quick Start

```bash
npm install @dataprism/plugins-out-of-box
```

```typescript
import { 
  createVisualizationPlugin,
  createIntegrationPlugin,
  createProcessingPlugin,
  createUtilityPlugin
} from '@dataprism/plugins-out-of-box';

// Create and use plugins
const chartsPlugin = await createVisualizationPlugin('observable-charts');
const csvPlugin = await createIntegrationPlugin('csv-importer');
const clusteringPlugin = await createProcessingPlugin('semantic-clustering');
const monitorPlugin = await createUtilityPlugin('performance-monitor');
```

## 📦 Plugin Collection

### 🎨 Visualization Plugins

#### Observable Charts Plugin
High-performance interactive charts built with D3 and Observable Framework patterns.

**Features:**
- 5 chart types: Bar, Line, Area, Scatter, Histogram
- Interactive tooltips, zoom, pan, and selection
- Responsive design with automatic resizing
- Multiple export formats (SVG, PNG, JSON)
- Configurable themes and styling

**Usage:**
```typescript
const plugin = await createVisualizationPlugin('observable-charts');
await plugin.initialize(context);
await plugin.render(container, dataset, {
  theme: 'dark',
  responsive: true,
  animation: true
});
```

**Performance:**
- Handles 50K+ data points at 30+ FPS
- Bundle size: ~25KB gzipped
- Load time: <200ms

### 📁 Integration Plugins

#### CSV Importer Plugin
Stream large CSV/TSV files with automatic type inference and progress tracking.

**Features:**
- Supports files up to 4GB
- Automatic delimiter and encoding detection
- Schema preview with type inference
- Streaming import with progress callbacks
- Data quality validation and error reporting

**Usage:**
```typescript
const plugin = await createIntegrationPlugin('csv-importer');
const preview = await plugin.execute('preview', { file, config });
const dataset = await plugin.execute('import', { 
  file, 
  config, 
  onProgress: (progress) => console.log(`${progress.percentage}% complete`)
});
```

**Performance:**
- 8+ MB/s parsing throughput
- Memory overhead: <1.2x file size
- Web Worker-based for non-blocking operation

### 🧠 Processing Plugins

#### Semantic Clustering Plugin
Advanced clustering with embeddings and interactive visualization.

**Features:**
- K-means and DBSCAN algorithms
- Local TF-IDF embeddings for text data
- Interactive 2D cluster visualization
- Quality metrics (silhouette score, Davies-Bouldin index)
- Export cluster labels and results

**Usage:**
```typescript
const plugin = await createProcessingPlugin('semantic-clustering');
const result = await plugin.execute('cluster', {
  data: dataset,
  config: {
    algorithm: 'kmeans',
    numClusters: 5,
    features: ['text_column'],
    normalize: true
  }
});
```

**Performance:**
- 100K vectors clustered in <60 seconds
- Supports up to 384-dimensional embeddings
- Quality metrics computed automatically

### 📊 Utility Plugins

#### Performance Monitor Plugin
Real-time performance monitoring with live dashboard and alerts.

**Features:**
- FPS, memory, CPU, and WASM heap monitoring
- Configurable overlay, detached, or embedded modes
- Live charts and historical data
- Threshold-based alerts
- Export performance logs

**Usage:**
```typescript
const plugin = await createUtilityPlugin('performance-monitor');
await plugin.execute('show', { mode: 'overlay' });
await plugin.configure({
  thresholds: {
    memory: 1000, // MB
    fps: 30,
    cpu: 80 // %
  }
});
```

**Performance:**
- <2% CPU overhead in idle
- <25MB memory footprint
- Real-time updates every 1000ms

## 🛠️ Development

### Building

```bash
npm run build              # Build all plugins
npm run build:visualization # Build visualization plugins only
npm run build:integration  # Build integration plugins only
npm run build:processing   # Build processing plugins only
npm run build:utility      # Build utility plugins only
```

### Testing

```bash
npm test                   # Run unit tests
npm run test:integration   # Run integration tests
npm run test:performance   # Run performance tests
npm run test:browser       # Run browser compatibility tests
```

### Type Checking

```bash
npm run type-check         # TypeScript type checking
npm run lint              # ESLint code quality
npm run format            # Prettier code formatting
```

### Bundle Analysis

```bash
npm run analyze-bundle     # Analyze bundle size and dependencies
npm run size-check        # Validate bundle size limits
```

## 📊 Performance Specifications

### Bundle Sizes
- **Total Collection**: <100KB ES module, <60KB CommonJS
- **Individual Plugins**: <25KB each (gzipped)
- **Lazy Loading**: Plugins loaded on-demand

### Runtime Performance
- **Load Time**: <300ms per plugin
- **Memory Usage**: <25MB total overhead
- **Query Performance**: Maintains <2s response time
- **Concurrency**: 5+ simultaneous operations

### Browser Support
- Chrome 90+ ✅
- Firefox 88+ ✅  
- Safari 14+ ✅
- Edge 90+ ✅

## 🔧 Configuration

### Global Configuration

```typescript
import { PLUGIN_REGISTRY } from '@dataprism/plugins-out-of-box';

// Configure all plugins
for (const category of Object.keys(PLUGIN_REGISTRY)) {
  for (const pluginId of Object.keys(PLUGIN_REGISTRY[category])) {
    const plugin = await PLUGIN_REGISTRY[category][pluginId]();
    await plugin.configure({
      // Global settings
      theme: 'dark',
      performance: {
        maxMemoryMB: 1000,
        enableOptimizations: true
      }
    });
  }
}
```

### Individual Plugin Configuration

Each plugin supports extensive configuration through its `configure()` method:

```typescript
// Observable Charts
await chartsPlugin.configure({
  chartSpec: {
    type: 'bar',
    x: 'category',
    y: 'value',
    title: 'Sales by Region'
  },
  responsive: true,
  maxDataPoints: 10000
});

// CSV Importer
await csvPlugin.configure({
  chunkSize: 50000,
  autoDetectTypes: true,
  strictParsing: false,
  encoding: 'UTF-8'
});

// Semantic Clustering
await clusteringPlugin.configure({
  algorithm: 'dbscan',
  eps: 0.5,
  minPoints: 5,
  normalize: true,
  embeddings: {
    provider: 'local',
    dimensions: 384
  }
});

// Performance Monitor
await monitorPlugin.configure({
  mode: 'overlay',
  position: 'top-right',
  updateInterval: 1000,
  enableAlerts: true,
  thresholds: {
    memory: 1000,
    fps: 30,
    cpu: 80
  }
});
```

## 🔌 Plugin Discovery

### List Available Plugins

```typescript
import { 
  getAvailablePlugins, 
  getPluginsByCategory,
  PLUGIN_METADATA 
} from '@dataprism/plugins-out-of-box';

// Get all plugins
const allPlugins = getAvailablePlugins();
console.log(allPlugins); // ['observable-charts', 'csv-importer', ...]

// Get plugins by category
const vizPlugins = getPluginsByCategory('visualization');
const integrationPlugins = getPluginsByCategory('integration');

// Get plugin metadata
const metadata = PLUGIN_METADATA['observable-charts'];
console.log(metadata.description, metadata.tags);
```

### Plugin Validation

```typescript
import { validatePlugin, validateAllPlugins } from '@dataprism/plugins-out-of-box';

// Validate single plugin
const isValid = await validatePlugin('observable-charts');

// Validate all plugins
const validationResults = await validateAllPlugins();
console.log(validationResults);
// { 'observable-charts': true, 'csv-importer': true, ... }
```

## 🧪 Examples

### Complete Workflow Example

```typescript
import { 
  createIntegrationPlugin,
  createProcessingPlugin,
  createVisualizationPlugin,
  createUtilityPlugin
} from '@dataprism/plugins-out-of-box';

async function completeAnalysisWorkflow(csvFile: File) {
  // 1. Start performance monitoring
  const monitor = await createUtilityPlugin('performance-monitor');
  await monitor.initialize(context);
  await monitor.execute('show', { mode: 'overlay' });

  // 2. Import CSV data
  const importer = await createIntegrationPlugin('csv-importer');
  await importer.initialize(context);
  
  const dataset = await importer.execute('import', {
    file: csvFile,
    config: { autoDetectTypes: true },
    onProgress: (progress) => {
      console.log(`Import: ${progress.percentage}% complete`);
    }
  });

  // 3. Perform clustering analysis
  const clustering = await createProcessingPlugin('semantic-clustering');
  await clustering.initialize(context);
  
  const clusterResult = await clustering.execute('cluster', {
    data: dataset,
    config: {
      algorithm: 'kmeans',
      numClusters: 5,
      features: ['numeric_column_1', 'numeric_column_2'],
      normalize: true
    }
  });

  // 4. Visualize results
  const charts = await createVisualizationPlugin('observable-charts');
  await charts.initialize(context);
  
  await charts.render(document.getElementById('chart-container'), dataset, {
    chartSpec: {
      type: 'scatter',
      x: 'numeric_column_1',
      y: 'numeric_column_2',
      color: 'cluster_id'
    }
  });

  // 5. Export results
  const chartBlob = await charts.export('png');
  const clusterLabels = await clustering.exportClusterLabels('csv');
  const performanceLog = await monitor.export('csv');

  return {
    dataset,
    clusterResult,
    exports: {
      chart: chartBlob,
      clusters: clusterLabels,
      performance: performanceLog
    }
  };
}
```

## 🤝 Contributing

### Plugin Development Guidelines

1. **Follow Interface Contracts**: Implement all required plugin interface methods
2. **Performance First**: Target <300ms load time, <150KB bundle size
3. **Error Handling**: Robust error management with user-friendly messages
4. **Testing**: >90% test coverage with unit, integration, and performance tests
5. **Documentation**: Comprehensive TSDoc comments and usage examples

### Adding New Plugins

1. Create plugin class implementing appropriate interface
2. Add to plugin registry in `src/index.ts`
3. Add metadata to `PLUGIN_METADATA`
4. Create comprehensive tests
5. Update documentation

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🔗 Links

- [DataPrism Core Documentation](https://docs.dataprism.dev)
- [Plugin Development Guide](https://docs.dataprism.dev/plugins)
- [API Reference](https://api.dataprism.dev/plugins)
- [GitHub Repository](https://github.com/dataprism/core)