# Getting Started with Plugins

Learn how to use and develop plugins for DataPrism.

## Quick Start

### Using Existing Plugins

```javascript
import { DataPrismEngine } from '@dataprism/core';
import { createVisualizationPlugin } from '@dataprism/plugins';

// Initialize engine
const engine = new DataPrismEngine();
await engine.initialize();

// Load a visualization plugin
const chartsPlugin = await createVisualizationPlugin('observable-charts');
await engine.loadPlugin(chartsPlugin);

// Use the plugin
const chart = await engine.createChart({
    type: 'bar',
    data: salesData,
    x: 'month',
    y: 'revenue'
});
```

### Plugin Discovery

```javascript
// List available plugins
const availablePlugins = await engine.getAvailablePlugins();
console.log('Available plugins:', availablePlugins);

// Get plugin information
const pluginInfo = await engine.getPluginInfo('observable-charts');
console.log('Plugin details:', pluginInfo);

// Search for plugins
const searchResults = await engine.searchPlugins('visualization');
```

## Plugin Categories

### Visualization Plugins

Create interactive charts and visualizations:

```javascript
// Bar charts
const barChart = await engine.createChart({
    type: 'bar',
    data: salesData,
    x: 'category',
    y: 'sales',
    color: 'region'
});

// Line charts
const lineChart = await engine.createChart({
    type: 'line',
    data: timeSeriesData,
    x: 'date',
    y: 'value',
    title: 'Sales Trend'
});

// Scatter plots
const scatterPlot = await engine.createChart({
    type: 'scatter',
    data: customerData,
    x: 'age',
    y: 'spending',
    size: 'orders'
});
```

### Data Processing Plugins

Transform and analyze your data:

```javascript
// Load processing plugin
const processingPlugin = await createProcessingPlugin('data-cleaner');
await engine.loadPlugin(processingPlugin);

// Clean data
const cleanedData = await engine.cleanData(rawData, {
    removeNulls: true,
    standardizeFormats: true,
    detectOutliers: true
});

// Statistical analysis
const stats = await engine.analyzeData(cleanedData, {
    descriptiveStats: true,
    correlations: true,
    distributions: true
});
```

### Integration Plugins

Connect to external data sources:

```javascript
// Load CSV importer
const csvPlugin = await createIntegrationPlugin('csv-importer');
await engine.loadPlugin(csvPlugin);

// Import CSV data
const data = await engine.importCSV('/path/to/data.csv', {
    delimiter: ',',
    headers: true,
    inferTypes: true
});

// Connect to API
const apiPlugin = await createIntegrationPlugin('rest-api');
await engine.loadPlugin(apiPlugin);

const apiData = await engine.fetchData('https://api.example.com/data', {
    method: 'GET',
    headers: { 'Authorization': 'Bearer token' }
});
```

## Plugin Configuration

### Basic Configuration

```javascript
// Plugin with custom configuration
const plugin = await createVisualizationPlugin('d3-charts', {
    theme: 'dark',
    animations: true,
    responsive: true,
    exportFormats: ['png', 'svg', 'pdf']
});

await engine.loadPlugin(plugin);
```

### Advanced Configuration

```javascript
// Complex plugin configuration
const mlPlugin = await createProcessingPlugin('machine-learning', {
    algorithms: {
        clustering: {
            method: 'kmeans',
            clusters: 5
        },
        classification: {
            method: 'random-forest',
            trees: 100
        }
    },
    preprocessing: {
        scaling: 'standard',
        encoding: 'one-hot'
    },
    validation: {
        method: 'cross-validation',
        folds: 5
    }
});
```

## Plugin Development

### Creating Your First Plugin

```javascript
// Define plugin metadata
const pluginMetadata = {
    id: 'my-first-plugin',
    name: 'My First Plugin',
    version: '1.0.0',
    description: 'A simple example plugin',
    author: 'Your Name',
    category: 'utility',
    dependencies: [],
    permissions: ['dom-access']
};

// Create plugin class
class MyFirstPlugin extends BasePlugin {
    constructor() {
        super(pluginMetadata);
    }
    
    async initialize() {
        console.log('Plugin initialized');
    }
    
    getCapabilities() {
        return ['greet', 'calculate'];
    }
    
    async execute(operation, params) {
        switch (operation) {
            case 'greet':
                return `Hello, ${params.name}!`;
            case 'calculate':
                return params.a + params.b;
            default:
                throw new Error(`Unknown operation: ${operation}`);
        }
    }
}

// Register plugin
engine.registerPlugin(MyFirstPlugin);
```

### Plugin Structure

```
my-plugin/
├── package.json
├── src/
│   ├── index.js          # Main plugin entry point
│   ├── plugin.js         # Plugin implementation
│   └── utils/
│       └── helpers.js    # Helper functions
├── tests/
│   └── plugin.test.js    # Unit tests
├── docs/
│   └── README.md         # Plugin documentation
└── examples/
    └── basic-usage.html  # Usage examples
```

### Plugin Package.json

```json
{
  "name": "@dataprism/my-plugin",
  "version": "1.0.0",
  "description": "My DataPrism plugin",
  "main": "src/index.js",
  "keywords": ["dataprism", "plugin", "analytics"],
  "author": "Your Name",
  "license": "MIT",
  "peerDependencies": {
    "@dataprism/core": "^1.0.0"
  },
  "dataprism": {
    "plugin": {
      "id": "my-plugin",
      "category": "utility",
      "permissions": ["dom-access"],
      "api": "1.0"
    }
  }
}
```

## Plugin Testing

### Unit Testing

```javascript
// Test plugin functionality
describe('MyFirstPlugin', () => {
    let plugin;
    
    beforeEach(() => {
        plugin = new MyFirstPlugin();
    });
    
    test('should greet user', async () => {
        const result = await plugin.execute('greet', { name: 'Alice' });
        expect(result).toBe('Hello, Alice!');
    });
    
    test('should calculate sum', async () => {
        const result = await plugin.execute('calculate', { a: 2, b: 3 });
        expect(result).toBe(5);
    });
    
    test('should throw error for unknown operation', async () => {
        await expect(plugin.execute('unknown', {}))
            .rejects.toThrow('Unknown operation: unknown');
    });
});
```

### Integration Testing

```javascript
// Test plugin integration with DataPrism
describe('Plugin Integration', () => {
    let engine;
    
    beforeEach(async () => {
        engine = new DataPrismEngine();
        await engine.initialize();
    });
    
    test('should load plugin successfully', async () => {
        const plugin = new MyFirstPlugin();
        await engine.loadPlugin(plugin);
        
        const loadedPlugins = engine.getLoadedPlugins();
        expect(loadedPlugins).toContain('my-first-plugin');
    });
    
    test('should execute plugin operation', async () => {
        const plugin = new MyFirstPlugin();
        await engine.loadPlugin(plugin);
        
        const result = await engine.executePlugin('my-first-plugin', 'greet', { name: 'Bob' });
        expect(result).toBe('Hello, Bob!');
    });
});
```

## Plugin Distribution

### Publishing to npm

```bash
# Build plugin
npm run build

# Test plugin
npm test

# Publish to npm
npm publish
```

### Plugin Registry

```javascript
// Register plugin in DataPrism registry
const registry = engine.getPluginRegistry();
await registry.register({
    id: 'my-plugin',
    name: 'My Plugin',
    version: '1.0.0',
    source: 'https://cdn.jsdelivr.net/npm/@dataprism/my-plugin@1.0.0/dist/plugin.js',
    integrity: 'sha384-...',
    category: 'utility',
    author: 'Your Name',
    description: 'A useful plugin for DataPrism'
});
```

## Best Practices

### Development

1. **Follow naming conventions**: Use descriptive names for plugins and operations
2. **Handle errors gracefully**: Implement comprehensive error handling
3. **Document your API**: Provide clear documentation for plugin usage
4. **Version carefully**: Use semantic versioning for plugin releases
5. **Test thoroughly**: Write comprehensive unit and integration tests

### Performance

1. **Lazy loading**: Load resources only when needed
2. **Memory management**: Clean up resources in destroy method
3. **Async operations**: Use async/await for non-blocking operations
4. **Caching**: Cache expensive computations
5. **Optimization**: Profile and optimize critical paths

### Security

1. **Minimal permissions**: Request only necessary permissions
2. **Input validation**: Validate all inputs and sanitize outputs
3. **Secure dependencies**: Use trusted, up-to-date dependencies
4. **Code review**: Have code reviewed by security experts
5. **Regular updates**: Keep plugins updated with security patches

## Examples

### Simple Utility Plugin

```javascript
class TextProcessorPlugin extends BasePlugin {
    constructor() {
        super({
            id: 'text-processor',
            name: 'Text Processor',
            version: '1.0.0',
            category: 'utility'
        });
    }
    
    getCapabilities() {
        return ['uppercase', 'lowercase', 'reverse', 'wordCount'];
    }
    
    async execute(operation, params) {
        const { text } = params;
        
        switch (operation) {
            case 'uppercase':
                return text.toUpperCase();
            case 'lowercase':
                return text.toLowerCase();
            case 'reverse':
                return text.split('').reverse().join('');
            case 'wordCount':
                return text.split(/\s+/).length;
            default:
                throw new Error(`Unknown operation: ${operation}`);
        }
    }
}
```

### Data Visualization Plugin

```javascript
class SimpleChartsPlugin extends BasePlugin {
    constructor() {
        super({
            id: 'simple-charts',
            name: 'Simple Charts',
            version: '1.0.0',
            category: 'visualization',
            permissions: ['dom-access']
        });
    }
    
    getCapabilities() {
        return ['bar', 'line', 'pie'];
    }
    
    async execute(operation, params) {
        const { data, config } = params;
        
        switch (operation) {
            case 'bar':
                return await this.createBarChart(data, config);
            case 'line':
                return await this.createLineChart(data, config);
            case 'pie':
                return await this.createPieChart(data, config);
            default:
                throw new Error(`Unknown chart type: ${operation}`);
        }
    }
    
    async createBarChart(data, config) {
        // Implementation for bar chart
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Draw chart logic here
        this.drawBars(ctx, data, config);
        
        return canvas;
    }
}
```

## Next Steps

- [Plugin Architecture](/plugins/architecture)
- [Plugin Development Guide](/plugins/development)
- [Plugin API Reference](/plugins/api)
- [Out-of-Box Plugins](/plugins/out-of-box/)