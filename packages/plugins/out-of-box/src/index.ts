// DataPrism Core Out-of-the-Box Plugins Collection
// Production-ready plugins for immediate use

// Shared utilities
export * from './shared/index.js';

// Visualization plugins
export * from './plugins/visualization/index.js';

// Integration plugins  
export * from './plugins/integration/index.js';

// Processing plugins
export * from './plugins/processing/index.js';

// Utility plugins
export * from './plugins/utility/index.js';

// Plugin registry for easy discovery and instantiation
export const PLUGIN_REGISTRY = {
  visualization: {
    'observable-charts': () => import('./plugins/visualization/observable-charts.js').then(m => new m.ObservableChartsPlugin())
  },
  integration: {
    'csv-importer': () => import('./plugins/integration/csv-importer.js').then(m => new m.CSVImporterPlugin())
  },
  processing: {
    'semantic-clustering': () => import('./plugins/processing/semantic-clustering.js').then(m => new m.SemanticClusteringPlugin())
  },
  utility: {
    'performance-monitor': () => import('./plugins/utility/performance-monitor.js').then(m => new m.PerformanceMonitorPlugin())
  }
} as const;

// Plugin metadata for discovery
export const PLUGIN_METADATA = {
  'observable-charts': {
    name: 'Observable Charts',
    category: 'visualization',
    description: 'High-performance reactive charts built with Observable Framework and D3',
    version: '1.0.0',
    tags: ['charts', 'd3', 'interactive', 'responsive']
  },
  'csv-importer': {
    name: 'CSV Importer',
    category: 'integration',
    description: 'Stream large CSV/TSV files directly into DuckDB-WASM with automatic type inference',
    version: '1.0.0',
    tags: ['import', 'csv', 'streaming', 'type-inference']
  },
  'semantic-clustering': {
    name: 'Semantic Clustering',
    category: 'processing',
    description: 'Generate embeddings, run K-means/DBSCAN, and surface interactive cluster views',
    version: '1.0.0',
    tags: ['clustering', 'ml', 'embeddings', 'visualization']
  },
  'performance-monitor': {
    name: 'Performance Monitor',
    category: 'utility',
    description: 'Live dashboard of FPS, memory, DuckDB query timings & WebAssembly heap usage',
    version: '1.0.0',
    tags: ['monitoring', 'performance', 'metrics', 'dashboard']
  }
} as const;

// Convenience functions for plugin instantiation
export async function createVisualizationPlugin(type: keyof typeof PLUGIN_REGISTRY.visualization) {
  return await PLUGIN_REGISTRY.visualization[type]();
}

export async function createIntegrationPlugin(type: keyof typeof PLUGIN_REGISTRY.integration) {
  return await PLUGIN_REGISTRY.integration[type]();
}

export async function createProcessingPlugin(type: keyof typeof PLUGIN_REGISTRY.processing) {
  return await PLUGIN_REGISTRY.processing[type]();
}

export async function createUtilityPlugin(type: keyof typeof PLUGIN_REGISTRY.utility) {
  return await PLUGIN_REGISTRY.utility[type]();
}

// Get all available plugins
export function getAvailablePlugins() {
  return Object.keys(PLUGIN_METADATA);
}

// Get plugins by category
export function getPluginsByCategory(category: 'visualization' | 'integration' | 'processing' | 'utility') {
  return Object.entries(PLUGIN_METADATA)
    .filter(([, metadata]) => metadata.category === category)
    .map(([id]) => id);
}

// Plugin validation and health check
export async function validatePlugin(pluginId: string): Promise<boolean> {
  try {
    const metadata = PLUGIN_METADATA[pluginId as keyof typeof PLUGIN_METADATA];
    if (!metadata) return false;

    // Try to instantiate the plugin
    const category = metadata.category as keyof typeof PLUGIN_REGISTRY;
    const pluginFactory = PLUGIN_REGISTRY[category][pluginId as any];
    
    if (!pluginFactory) return false;

    const plugin = await pluginFactory();
    
    // Basic validation checks
    return !!(
      plugin.getName() &&
      plugin.getVersion() &&
      plugin.getDescription() &&
      plugin.getManifest() &&
      plugin.getCapabilities()
    );
  } catch (error) {
    console.error(`Plugin validation failed for ${pluginId}:`, error);
    return false;
  }
}

// Bulk plugin health check
export async function validateAllPlugins(): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {};
  const pluginIds = getAvailablePlugins();
  
  for (const pluginId of pluginIds) {
    results[pluginId] = await validatePlugin(pluginId);
  }
  
  return results;
}