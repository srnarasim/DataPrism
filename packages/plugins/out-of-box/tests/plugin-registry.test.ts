import { describe, it, expect, beforeEach } from 'vitest';
import {
  PLUGIN_REGISTRY,
  PLUGIN_METADATA,
  getAvailablePlugins,
  getPluginsByCategory,
  validatePlugin,
  validateAllPlugins,
  createVisualizationPlugin,
  createIntegrationPlugin,
  createProcessingPlugin,
  createUtilityPlugin
} from '../src/index.js';

describe('Plugin Registry', () => {
  it('should expose all expected plugins', () => {
    const expectedPlugins = [
      'observable-charts',
      'csv-importer', 
      'semantic-clustering',
      'performance-monitor'
    ];
    
    const availablePlugins = getAvailablePlugins();
    expect(availablePlugins).toEqual(expect.arrayContaining(expectedPlugins));
    expect(availablePlugins).toHaveLength(expectedPlugins.length);
  });

  it('should categorize plugins correctly', () => {
    const visualizationPlugins = getPluginsByCategory('visualization');
    const integrationPlugins = getPluginsByCategory('integration');
    const processingPlugins = getPluginsByCategory('processing');
    const utilityPlugins = getPluginsByCategory('utility');

    expect(visualizationPlugins).toContain('observable-charts');
    expect(integrationPlugins).toContain('csv-importer');
    expect(processingPlugins).toContain('semantic-clustering');
    expect(utilityPlugins).toContain('performance-monitor');
  });

  it('should have consistent metadata for all plugins', () => {
    const availablePlugins = getAvailablePlugins();
    
    for (const pluginId of availablePlugins) {
      const metadata = PLUGIN_METADATA[pluginId as keyof typeof PLUGIN_METADATA];
      
      expect(metadata).toBeDefined();
      expect(metadata.name).toBeTruthy();
      expect(metadata.category).toBeTruthy();
      expect(metadata.description).toBeTruthy();
      expect(metadata.version).toBeTruthy();
      expect(Array.isArray(metadata.tags)).toBe(true);
    }
  });

  describe('Plugin Creation', () => {
    it('should create visualization plugins', async () => {
      const plugin = await createVisualizationPlugin('observable-charts');
      
      expect(plugin).toBeDefined();
      expect(plugin.getName()).toBe('ObservableCharts');
      expect(plugin.getVersion()).toBeTruthy();
      expect(plugin.getDescription()).toBeTruthy();
    });

    it('should create integration plugins', async () => {
      const plugin = await createIntegrationPlugin('csv-importer');
      
      expect(plugin).toBeDefined();
      expect(plugin.getName()).toBe('CSVImporter');
      expect(plugin.getVersion()).toBeTruthy();
      expect(plugin.getDescription()).toBeTruthy();
    });

    it('should create processing plugins', async () => {
      const plugin = await createProcessingPlugin('semantic-clustering');
      
      expect(plugin).toBeDefined();
      expect(plugin.getName()).toBe('SemanticClustering');
      expect(plugin.getVersion()).toBeTruthy();
      expect(plugin.getDescription()).toBeTruthy();
    });

    it('should create utility plugins', async () => {
      const plugin = await createUtilityPlugin('performance-monitor');
      
      expect(plugin).toBeDefined();
      expect(plugin.getName()).toBe('PerformanceMonitor');
      expect(plugin.getVersion()).toBeTruthy();
      expect(plugin.getDescription()).toBeTruthy();
    });
  });

  describe('Plugin Validation', () => {
    it('should validate existing plugins', async () => {
      const result = await validatePlugin('observable-charts');
      expect(result).toBe(true);
    });

    it('should reject non-existent plugins', async () => {
      const result = await validatePlugin('non-existent-plugin');
      expect(result).toBe(false);
    });

    it('should validate all plugins in bulk', async () => {
      const results = await validateAllPlugins();
      
      expect(results['observable-charts']).toBe(true);
      expect(results['csv-importer']).toBe(true);
      expect(results['semantic-clustering']).toBe(true);
      expect(results['performance-monitor']).toBe(true);
    });
  });
});