/**
 * Basic Plugin Usage Examples
 * 
 * This file demonstrates the fundamental patterns for using the DataPrism Plugin System.
 * These examples show how to initialize the system, register plugins, and perform basic operations.
 */

import { 
  DataPrismPluginSystem, 
  PluginUtils,
  IPlugin,
  Dataset 
} from '@dataprism/plugins';

// Example plugins
import CSVProcessorPlugin from '../data-processor/csv-processor.js';
import ChartRendererPlugin from '../visualization/chart-renderer.js';
import LLMIntegrationPlugin from '../integration/llm-integration.js';
import PerformanceMonitorPlugin from '../utility/performance-monitor.js';

/**
 * Example 1: Basic Plugin System Setup
 */
export async function basicSetup() {
  console.log('🚀 Basic Plugin System Setup');
  
  // Create and initialize the plugin system
  const pluginSystem = await DataPrismPluginSystem.create({
    maxPlugins: 10,
    securityLevel: 'moderate',
    enableHotReload: true,
    auditLogging: true
  });
  
  console.log('✅ Plugin system initialized');
  
  // Get the plugin manager
  const manager = pluginSystem.getPluginManager();
  
  // Check system status
  const status = await manager.getSystemStatus();
  console.log('📊 System Status:', {
    initialized: status.initialized,
    totalRegistered: status.totalRegistered,
    totalActive: status.totalActive
  });
  
  return pluginSystem;
}

/**
 * Example 2: Plugin Registration and Loading
 */
export async function registerAndLoadPlugins() {
  console.log('\n📦 Plugin Registration and Loading');
  
  const pluginSystem = await basicSetup();
  const manager = pluginSystem.getPluginManager();
  
  // Create plugin instances
  const csvProcessor = new CSVProcessorPlugin();
  const chartRenderer = new ChartRendererPlugin();
  
  // Register plugins using their manifests
  await manager.registerPlugin(csvProcessor.getManifest());
  await manager.registerPlugin(chartRenderer.getManifest());
  
  console.log('✅ Plugins registered');
  
  // Load plugins (this initializes them)
  await manager.loadPlugin('csv-processor');
  await manager.loadPlugin('chart-renderer');
  
  console.log('✅ Plugins loaded');
  
  // Activate plugins (this makes them ready for use)
  await manager.activatePlugin('csv-processor');
  await manager.activatePlugin('chart-renderer');
  
  console.log('✅ Plugins activated');
  
  // List active plugins
  const activePlugins = manager.getActivePlugins();
  console.log('🔍 Active plugins:', activePlugins);
  
  return { pluginSystem, manager };
}

/**
 * Example 3: Working with Data Processing Plugins
 */
export async function dataProcessingExample() {
  console.log('\n📊 Data Processing Example');
  
  const { manager } = await registerAndLoadPlugins();
  
  // Sample CSV data
  const csvData = `name,age,city,salary
John Doe,30,New York,50000
Jane Smith,25,Los Angeles,60000
Bob Johnson,35,Chicago,55000
Alice Brown,28,Houston,52000`;
  
  // Parse CSV data
  const dataset = await manager.executePlugin('csv-processor', 'parse', {
    data: csvData,
    options: { hasHeader: true, delimiter: ',' }
  });
  
  console.log('✅ CSV parsed:', {
    name: dataset.name,
    rows: dataset.data.length,
    columns: Object.keys(dataset.data[0] || {}).length
  });
  
  // Validate the dataset
  const validation = await manager.executePlugin('csv-processor', 'validate', {
    dataset
  });
  
  console.log('🔍 Validation result:', {
    isValid: validation.isValid,
    errors: validation.errors.length,
    warnings: validation.warnings.length
  });
  
  // Transform the data
  const transformedDataset = await manager.executePlugin('csv-processor', 'transform', {
    dataset,
    rules: [
      { field: 'name', operation: 'uppercase', parameters: {} },
      { field: 'salary', operation: 'multiply', parameters: { factor: 1.1 } }
    ]
  });
  
  console.log('🔄 Data transformed');
  console.log('📋 Sample transformed data:', transformedDataset.data.slice(0, 2));
  
  return { dataset, transformedDataset };
}

/**
 * Example 4: Working with Visualization Plugins
 */
export async function visualizationExample() {
  console.log('\n📈 Visualization Example');
  
  const { manager } = await registerAndLoadPlugins();
  const { dataset } = await dataProcessingExample();
  
  // Create a container element (in a real app, this would be a DOM element)
  const mockContainer = {
    innerHTML: '',
    appendChild: (child: any) => console.log('📊 Chart rendered to container'),
    clientWidth: 800,
    clientHeight: 600
  } as any;
  
  // Render a bar chart
  await manager.executePlugin('chart-renderer', 'render', {
    container: mockContainer,
    data: dataset,
    config: {
      chartType: 'bar',
      theme: 'light',
      responsive: true,
      animation: true
    }
  });
  
  console.log('✅ Chart rendered');
  
  // Get available chart types
  const chartTypes = await manager.executePlugin('chart-renderer', 'getTypes');
  console.log('📋 Available chart types:', chartTypes.map((t: any) => t.name));
  
  // Export the chart
  const exportedChart = await manager.executePlugin('chart-renderer', 'export', {
    format: 'svg'
  });
  
  console.log('💾 Chart exported as SVG:', exportedChart.type);
  
  return { dataset, chartTypes };
}

/**
 * Example 5: Working with Integration Plugins
 */
export async function integrationExample() {
  console.log('\n🔗 Integration Example');
  
  const pluginSystem = await basicSetup();
  const manager = pluginSystem.getPluginManager();
  
  // Register and activate LLM integration plugin
  const llmPlugin = new LLMIntegrationPlugin();
  await manager.registerPlugin(llmPlugin.getManifest());
  await manager.loadPlugin('llm-integration');
  await manager.activatePlugin('llm-integration');
  
  // Get available LLM providers
  const providers = await manager.executePlugin('llm-integration', 'providers');
  console.log('🤖 Available LLM providers:', providers.map((p: any) => p.name));
  
  // Generate a completion
  const completion = await manager.executePlugin('llm-integration', 'completion', {
    prompt: 'Explain the benefits of data visualization in 2 sentences.',
    options: {
      provider: 'openai',
      maxTokens: 100
    }
  });
  
  console.log('💬 LLM Completion:', completion.text);
  
  // Analyze a dataset (using sample data)
  const sampleDataset: Dataset = {
    id: 'sample_sales',
    name: 'Sales Data',
    schema: { fields: [] },
    data: [
      { product: 'Laptop', category: 'Electronics', sales: 1200, month: 'Jan' },
      { product: 'Phone', category: 'Electronics', sales: 800, month: 'Jan' },
      { product: 'Desk', category: 'Furniture', sales: 300, month: 'Jan' }
    ],
    metadata: { source: 'sales_system', createdAt: new Date().toISOString() }
  };
  
  const analysis = await manager.executePlugin('llm-integration', 'analyze', {
    dataset: sampleDataset,
    options: {
      focus: 'sales trends and patterns'
    }
  });
  
  console.log('📊 Dataset Analysis:', analysis.insights);
  
  return { providers, completion, analysis };
}

/**
 * Example 6: Working with Utility Plugins
 */
export async function utilityExample() {
  console.log('\n🔧 Utility Example');
  
  const pluginSystem = await basicSetup();
  const manager = pluginSystem.getPluginManager();
  
  // Register and activate performance monitor
  const perfMonitor = new PerformanceMonitorPlugin();
  await manager.registerPlugin(perfMonitor.getManifest());
  await manager.loadPlugin('performance-monitor');
  await manager.activatePlugin('performance-monitor');
  
  // Get system status
  const systemStatus = await manager.executePlugin('performance-monitor', 'getStatus');
  console.log('💻 System Status:', {
    overall: systemStatus.overall,
    memory: `${systemStatus.components.memory.usage.toFixed(1)}%`,
    cpu: `${systemStatus.components.cpu.usage.toFixed(1)}%`
  });
  
  // Perform health check
  const healthCheck = await manager.executePlugin('performance-monitor', 'healthCheck');
  console.log('🏥 Health Check:', {
    overall: healthCheck.overall,
    score: `${healthCheck.score.toFixed(1)}%`,
    checks: healthCheck.checks.length
  });
  
  // Run security scan
  const securityScan = await manager.executePlugin('performance-monitor', 'securityScan', {
    options: { type: 'quick' }
  });
  console.log('🔒 Security Scan:', {
    status: securityScan.status,
    findings: securityScan.findings.length
  });
  
  return { systemStatus, healthCheck, securityScan };
}

/**
 * Example 7: Plugin Event Handling
 */
export async function eventHandlingExample() {
  console.log('\n📡 Event Handling Example');
  
  const pluginSystem = await basicSetup();
  const manager = pluginSystem.getPluginManager();
  
  // Get the event bus from the plugin manager (in a real implementation)
  // For this example, we'll simulate event handling
  
  console.log('📡 Setting up event listeners...');
  
  // Simulate plugin events
  const events = [
    'plugin:csv-processor:processing:complete',
    'plugin:chart-renderer:chart:rendered',
    'plugin:llm-integration:completion:generated',
    'plugin:performance-monitor:alert:created'
  ];
  
  console.log('🎯 Monitoring events:', events);
  
  // In a real implementation, you would subscribe to these events:
  /*
  events.forEach(eventName => {
    manager.eventBus.subscribe(eventName, (data) => {
      console.log(`📨 Event received: ${eventName}`, data);
    });
  });
  */
  
  return { events };
}

/**
 * Example 8: Plugin Configuration Management
 */
export async function configurationExample() {
  console.log('\n⚙️ Configuration Management Example');
  
  const { manager } = await registerAndLoadPlugins();
  
  // Configure CSV processor
  await manager.executePlugin('csv-processor', 'configure', {
    delimiter: ';',
    hasHeader: true,
    validateData: true,
    maxRows: 10000
  });
  
  console.log('✅ CSV processor configured');
  
  // Configure chart renderer
  await manager.executePlugin('chart-renderer', 'setConfig', {
    config: {
      chartType: 'line',
      theme: 'dark',
      responsive: true,
      animation: true
    }
  });
  
  console.log('✅ Chart renderer configured');
  
  // Get current configuration
  const chartConfig = await manager.executePlugin('chart-renderer', 'getConfig');
  console.log('🔍 Current chart config:', chartConfig);
  
  return { chartConfig };
}

/**
 * Example 9: Error Handling and Recovery
 */
export async function errorHandlingExample() {
  console.log('\n🚨 Error Handling Example');
  
  const { manager } = await registerAndLoadPlugins();
  
  try {
    // Attempt an invalid operation
    await manager.executePlugin('csv-processor', 'invalidOperation', {});
  } catch (error) {
    console.log('❌ Expected error caught:', (error as Error).message);
  }
  
  try {
    // Attempt to execute on non-existent plugin
    await manager.executePlugin('non-existent-plugin', 'test', {});
  } catch (error) {
    console.log('❌ Expected error caught:', (error as Error).message);
  }
  
  // Check plugin status after errors
  const activePlugins = manager.getActivePlugins();
  console.log('✅ System still functional, active plugins:', activePlugins.length);
  
  return { activePlugins };
}

/**
 * Example 10: Plugin Lifecycle Management
 */
export async function lifecycleExample() {
  console.log('\n🔄 Plugin Lifecycle Example');
  
  const pluginSystem = await basicSetup();
  const manager = pluginSystem.getPluginManager();
  
  // Register a plugin
  const csvProcessor = new CSVProcessorPlugin();
  await manager.registerPlugin(csvProcessor.getManifest());
  console.log('1️⃣ Plugin registered');
  
  // Load the plugin
  await manager.loadPlugin('csv-processor');
  console.log('2️⃣ Plugin loaded');
  
  // Activate the plugin
  await manager.activatePlugin('csv-processor');
  console.log('3️⃣ Plugin activated');
  
  // Use the plugin
  const pluginInfo = manager.getPluginInfo('csv-processor');
  console.log('4️⃣ Plugin info:', pluginInfo?.name, pluginInfo?.status);
  
  // Deactivate the plugin
  await manager.deactivatePlugin('csv-processor');
  console.log('5️⃣ Plugin deactivated');
  
  // Unload the plugin
  await manager.unloadPlugin('csv-processor');
  console.log('6️⃣ Plugin unloaded');
  
  // Clean up the plugin system
  await DataPrismPluginSystem.destroy();
  console.log('7️⃣ Plugin system destroyed');
  
  return { completed: true };
}

/**
 * Main function to run all examples
 */
export async function runAllExamples() {
  console.log('🎯 Running DataPrism Plugin System Examples\n');
  
  try {
    await basicSetup();
    await registerAndLoadPlugins();
    await dataProcessingExample();
    await visualizationExample();
    await integrationExample();
    await utilityExample();
    await eventHandlingExample();
    await configurationExample();
    await errorHandlingExample();
    await lifecycleExample();
    
    console.log('\n🎉 All examples completed successfully!');
  } catch (error) {
    console.error('\n❌ Example failed:', error);
  }
}

// Helper function to create mock plugin context for testing
export function createMockContext(): any {
  return {
    pluginName: 'test-plugin',
    coreVersion: '0.1.0',
    services: {
      call: async (service: string, method: string, ...args: any[]) => ({ success: true }),
      hasPermission: () => true
    },
    eventBus: {
      publish: (event: string, data: any) => console.log(`📡 Event: ${event}`),
      subscribe: (event: string, handler: any) => ({ unsubscribe: () => {} })
    },
    logger: {
      debug: (...args: any[]) => console.debug(...args),
      info: (...args: any[]) => console.info(...args),
      warn: (...args: any[]) => console.warn(...args),
      error: (...args: any[]) => console.error(...args)
    },
    config: {},
    resources: {
      maxMemoryMB: 50,
      maxCpuPercent: 10,
      maxExecutionTime: 30000
    }
  };
}

// Export all examples for individual use
export {
  basicSetup,
  registerAndLoadPlugins,
  dataProcessingExample,
  visualizationExample,
  integrationExample,
  utilityExample,
  eventHandlingExample,
  configurationExample,
  errorHandlingExample,
  lifecycleExample
};

// Run examples if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runAllExamples().catch(console.error);
}