/**
 * Advanced Plugin Patterns and Examples
 * 
 * This file demonstrates advanced patterns for plugin development and usage,
 * including custom plugin creation, complex integrations, and performance optimization.
 */

import { 
  DataPrismPluginSystem,
  BasePlugin,
  IPlugin,
  IDataProcessorPlugin,
  Dataset,
  PluginContext,
  PluginCapability,
  PluginManifest,
  PluginDependency
} from '@dataprism/plugins';

/**
 * Example 1: Creating a Custom Plugin Using BasePlugin
 */
export class CustomAnalyticsPlugin extends BasePlugin {
  private analytics: Map<string, any> = new Map();
  private models: any[] = [];

  getName(): string {
    return 'custom-analytics';
  }

  getVersion(): string {
    return '1.0.0';
  }

  getDescription(): string {
    return 'Custom analytics plugin with machine learning capabilities';
  }

  getAuthor(): string {
    return 'Custom Developer';
  }

  getCapabilities(): PluginCapability[] {
    return [
      {
        name: 'predictive-analytics',
        description: 'Perform predictive analytics on datasets',
        type: 'processing',
        version: '1.0.0',
        async: true,
        inputTypes: ['application/json'],
        outputTypes: ['application/json']
      },
      {
        name: 'anomaly-detection',
        description: 'Detect anomalies in data patterns',
        type: 'processing',
        version: '1.0.0',
        async: true,
        inputTypes: ['application/json'],
        outputTypes: ['application/json']
      }
    ];
  }

  async execute(operation: string, params: any): Promise<any> {
    switch (operation) {
      case 'train':
        return this.trainModel(params.dataset, params.options);
      case 'predict':
        return this.predict(params.data, params.modelId);
      case 'detectAnomalies':
        return this.detectAnomalies(params.dataset, params.threshold);
      case 'getModels':
        return this.getModels();
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  private async trainModel(dataset: Dataset, options: any): Promise<any> {
    this.log('info', `Training model on dataset: ${dataset.name}`);
    
    // Simulate model training
    const modelId = `model_${Date.now()}`;
    const model = {
      id: modelId,
      type: options.type || 'regression',
      dataset: dataset.name,
      features: options.features || [],
      accuracy: 0.85 + Math.random() * 0.1, // Mock accuracy
      trainedAt: new Date(),
      parameters: options.parameters || {}
    };
    
    this.models.push(model);
    this.emit('model:trained', { modelId, accuracy: model.accuracy });
    
    return model;
  }

  private async predict(data: any[], modelId: string): Promise<any> {
    const model = this.models.find(m => m.id === modelId);
    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }

    this.log('info', `Making predictions with model: ${modelId}`);
    
    // Simulate predictions
    const predictions = data.map((item, index) => ({
      input: item,
      prediction: Math.random() * 100, // Mock prediction
      confidence: 0.7 + Math.random() * 0.3
    }));

    return {
      modelId,
      predictions,
      metadata: {
        predictedAt: new Date(),
        sampleSize: data.length
      }
    };
  }

  private async detectAnomalies(dataset: Dataset, threshold: number = 0.05): Promise<any> {
    this.log('info', `Detecting anomalies in dataset: ${dataset.name}`);
    
    // Simulate anomaly detection
    const anomalies = dataset.data
      .map((row, index) => ({ row, index, score: Math.random() }))
      .filter(item => item.score < threshold)
      .map(item => ({
        index: item.index,
        data: item.row,
        anomalyScore: item.score,
        reasons: ['statistical_outlier', 'pattern_deviation']
      }));

    return {
      dataset: dataset.name,
      anomalies,
      summary: {
        total: dataset.data.length,
        anomalies: anomalies.length,
        percentage: (anomalies.length / dataset.data.length) * 100
      },
      threshold,
      detectedAt: new Date()
    };
  }

  private getModels(): any[] {
    return [...this.models];
  }
}

/**
 * Example 2: Plugin Composition and Chaining
 */
export class DataPipelinePlugin extends BasePlugin {
  private pipeline: Array<{ plugin: string; operation: string; params: any }> = [];
  private results: Map<string, any> = new Map();

  getName(): string {
    return 'data-pipeline';
  }

  getVersion(): string {
    return '1.0.0';
  }

  getDescription(): string {
    return 'Orchestrates multiple plugins in a data processing pipeline';
  }

  getAuthor(): string {
    return 'Pipeline Developer';
  }

  getCapabilities(): PluginCapability[] {
    return [
      {
        name: 'pipeline-orchestration',
        description: 'Orchestrate multiple plugin operations in sequence',
        type: 'utility',
        version: '1.0.0',
        async: true
      }
    ];
  }

  async execute(operation: string, params: any): Promise<any> {
    switch (operation) {
      case 'createPipeline':
        return this.createPipeline(params.steps);
      case 'runPipeline':
        return this.runPipeline(params.data, params.pipelineId);
      case 'getPipelines':
        return this.getPipelines();
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  private async createPipeline(steps: Array<{ plugin: string; operation: string; params?: any }>): Promise<any> {
    const pipelineId = `pipeline_${Date.now()}`;
    
    this.pipeline = steps.map(step => ({
      plugin: step.plugin,
      operation: step.operation,
      params: step.params || {}
    }));

    this.log('info', `Created pipeline with ${steps.length} steps`);
    
    return {
      pipelineId,
      steps: this.pipeline,
      createdAt: new Date()
    };
  }

  private async runPipeline(initialData: any, pipelineId: string): Promise<any> {
    this.log('info', `Running pipeline: ${pipelineId}`);
    
    let currentData = initialData;
    const stepResults = [];

    for (let i = 0; i < this.pipeline.length; i++) {
      const step = this.pipeline[i];
      
      try {
        this.log('debug', `Executing step ${i + 1}: ${step.plugin}.${step.operation}`);
        
        // In a real implementation, this would call the actual plugin manager
        const result = await this.executePluginStep(step, currentData);
        
        stepResults.push({
          stepIndex: i,
          plugin: step.plugin,
          operation: step.operation,
          success: true,
          result
        });
        
        currentData = result;
        
      } catch (error) {
        stepResults.push({
          stepIndex: i,
          plugin: step.plugin,
          operation: step.operation,
          success: false,
          error: String(error)
        });
        
        throw new Error(`Pipeline failed at step ${i + 1}: ${error}`);
      }
    }

    const pipelineResult = {
      pipelineId,
      initialData,
      finalData: currentData,
      steps: stepResults,
      executedAt: new Date(),
      duration: stepResults.reduce((total, step) => total + (step.duration || 0), 0)
    };

    this.results.set(pipelineId, pipelineResult);
    this.emit('pipeline:completed', pipelineResult);
    
    return pipelineResult;
  }

  private async executePluginStep(step: any, data: any): Promise<any> {
    // Mock plugin execution - in real implementation, use plugin manager
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate processing time
    
    return {
      ...data,
      processedBy: step.plugin,
      operation: step.operation,
      timestamp: new Date()
    };
  }

  private getPipelines(): any[] {
    return Array.from(this.results.values());
  }
}

/**
 * Example 3: Plugin with Streaming Capabilities
 */
export class StreamProcessorPlugin extends BasePlugin implements IDataProcessorPlugin {
  private streams: Map<string, ReadableStream> = new Map();
  private processors: Map<string, any> = new Map();

  getName(): string {
    return 'stream-processor';
  }

  getVersion(): string {
    return '1.0.0';
  }

  getDescription(): string {
    return 'Real-time data stream processing plugin';
  }

  getAuthor(): string {
    return 'Stream Developer';
  }

  getCapabilities(): PluginCapability[] {
    return [
      {
        name: 'stream-processing',
        description: 'Process continuous data streams',
        type: 'processing',
        version: '1.0.0',
        async: true
      }
    ];
  }

  async execute(operation: string, params: any): Promise<any> {
    switch (operation) {
      case 'createStream':
        return this.createStream(params.source, params.options);
      case 'processStream':
        return this.processStream(params.streamId, params.processor);
      case 'getStreams':
        return this.getActiveStreams();
      case 'stopStream':
        return this.stopStream(params.streamId);
      default:
        return this.process(params.data, params.options);
    }
  }

  // Implement IDataProcessorPlugin methods
  async process(data: Dataset, options?: any): Promise<Dataset> {
    this.log('info', `Processing dataset: ${data.name}`);
    
    const processed = data.data.map(row => ({
      ...row,
      processed: true,
      processedAt: new Date().toISOString()
    }));

    return {
      ...data,
      id: `${data.id}_processed`,
      data: processed,
      metadata: {
        ...data.metadata,
        processedBy: this.getName(),
        processedAt: new Date().toISOString()
      }
    };
  }

  async transform(data: Dataset, rules: any[]): Promise<Dataset> {
    // Implementation for transform
    return this.process(data);
  }

  async validate(data: Dataset): Promise<any> {
    return {
      isValid: true,
      errors: [],
      warnings: [],
      statistics: {}
    };
  }

  getProcessingCapabilities(): any[] {
    return [
      {
        name: 'real-time-processing',
        description: 'Process data in real-time streams',
        inputTypes: ['application/json'],
        outputTypes: ['application/json'],
        complexity: 'high',
        async: true
      }
    ];
  }

  getSupportedDataTypes(): any[] {
    return [
      { name: 'json', description: 'JSON data objects' },
      { name: 'csv', description: 'CSV formatted data' }
    ];
  }

  getPerformanceMetrics(): any {
    return {
      totalProcessed: 0,
      averageProcessingTime: 0,
      errorsEncountered: 0,
      throughput: 0
    };
  }

  async batch(datasets: Dataset[]): Promise<Dataset[]> {
    return Promise.all(datasets.map(dataset => this.process(dataset)));
  }

  async stream(dataStream: ReadableStream<Dataset>): Promise<ReadableStream<Dataset>> {
    const plugin = this;
    
    return new ReadableStream({
      start(controller) {
        const reader = dataStream.getReader();
        
        function pump(): Promise<any> {
          return reader.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            
            plugin.process(value).then(processed => {
              controller.enqueue(processed);
              return pump();
            }).catch(error => {
              controller.error(error);
            });
          });
        }
        
        return pump();
      }
    });
  }

  private async createStream(source: any, options: any): Promise<any> {
    const streamId = `stream_${Date.now()}`;
    
    // Create a mock data stream
    const stream = new ReadableStream({
      start(controller) {
        let count = 0;
        const interval = setInterval(() => {
          if (count < 100) { // Limit for demo
            controller.enqueue({
              id: `data_${count}`,
              timestamp: new Date(),
              value: Math.random() * 100,
              source: source.name
            });
            count++;
          } else {
            clearInterval(interval);
            controller.close();
          }
        }, options.interval || 1000);
      }
    });

    this.streams.set(streamId, stream);
    this.log('info', `Created stream: ${streamId}`);
    
    return {
      streamId,
      source,
      options,
      createdAt: new Date()
    };
  }

  private async processStream(streamId: string, processor: any): Promise<any> {
    const stream = this.streams.get(streamId);
    if (!stream) {
      throw new Error(`Stream not found: ${streamId}`);
    }

    const processedStream = stream.pipeThrough(new TransformStream({
      transform(chunk, controller) {
        // Apply processing logic
        const processed = {
          ...chunk,
          processed: true,
          processingTime: Date.now()
        };
        controller.enqueue(processed);
      }
    }));

    const processorId = `processor_${Date.now()}`;
    this.processors.set(processorId, {
      streamId,
      processor,
      stream: processedStream,
      startedAt: new Date()
    });

    return { processorId, streamId };
  }

  private getActiveStreams(): any[] {
    return Array.from(this.streams.keys()).map(streamId => ({
      streamId,
      status: 'active',
      createdAt: new Date()
    }));
  }

  private async stopStream(streamId: string): Promise<void> {
    this.streams.delete(streamId);
    this.log('info', `Stopped stream: ${streamId}`);
  }
}

/**
 * Example 4: Plugin with Advanced Caching
 */
export class CachedProcessorPlugin extends BasePlugin {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private cacheStats = { hits: 0, misses: 0, evictions: 0 };

  getName(): string {
    return 'cached-processor';
  }

  getVersion(): string {
    return '1.0.0';
  }

  getDescription(): string {
    return 'Data processor with intelligent caching';
  }

  getAuthor(): string {
    return 'Cache Developer';
  }

  getCapabilities(): PluginCapability[] {
    return [
      {
        name: 'cached-processing',
        description: 'Process data with intelligent caching',
        type: 'processing',
        version: '1.0.0',
        async: true
      }
    ];
  }

  async execute(operation: string, params: any): Promise<any> {
    switch (operation) {
      case 'process':
        return this.processWithCache(params.data, params.options);
      case 'clearCache':
        return this.clearCache();
      case 'getCacheStats':
        return this.getCacheStats();
      case 'setCacheConfig':
        return this.setCacheConfig(params.config);
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  private async processWithCache(data: any, options: any): Promise<any> {
    const cacheKey = this.generateCacheKey(data, options);
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      this.cacheStats.hits++;
      this.log('debug', 'Cache hit for key:', cacheKey);
      return cached;
    }

    this.cacheStats.misses++;
    this.log('debug', 'Cache miss for key:', cacheKey);
    
    // Simulate expensive processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const result = {
      processed: data,
      options,
      processedAt: new Date(),
      cacheKey
    };

    this.setInCache(cacheKey, result, options.cacheTtl || 300000); // 5 minutes default
    
    return result;
  }

  private generateCacheKey(data: any, options: any): string {
    const dataHash = this.hashObject(data);
    const optionsHash = this.hashObject(options);
    return `${dataHash}_${optionsHash}`;
  }

  private hashObject(obj: any): string {
    return JSON.stringify(obj).split('').reduce((hash, char) => {
      hash = ((hash << 5) - hash) + char.charCodeAt(0);
      return hash & hash;
    }, 0).toString();
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.timestamp + cached.ttl) {
      this.cache.delete(key);
      this.cacheStats.evictions++;
      return null;
    }
    
    return cached.data;
  }

  private setInCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    
    // Cleanup expired entries periodically
    if (this.cache.size % 100 === 0) {
      this.cleanupExpiredEntries();
    }
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    this.cacheStats.evictions += cleaned;
    this.log('debug', `Cleaned up ${cleaned} expired cache entries`);
  }

  private clearCache(): any {
    const size = this.cache.size;
    this.cache.clear();
    this.log('info', `Cleared cache (${size} entries)`);
    
    return {
      cleared: size,
      clearedAt: new Date()
    };
  }

  private getCacheStats(): any {
    const hitRate = this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) || 0;
    
    return {
      ...this.cacheStats,
      hitRate: hitRate * 100,
      cacheSize: this.cache.size,
      generatedAt: new Date()
    };
  }

  private setCacheConfig(config: any): any {
    // Update cache configuration
    this.log('info', 'Cache configuration updated', config);
    
    return {
      config,
      updatedAt: new Date()
    };
  }
}

/**
 * Example 5: Plugin Performance Optimization Patterns
 */
export async function demonstratePerformancePatterns() {
  console.log('🚀 Performance Optimization Patterns');
  
  const pluginSystem = await DataPrismPluginSystem.create();
  const manager = pluginSystem.getPluginManager();
  
  // 1. Lazy Loading Pattern
  console.log('\n📦 Lazy Loading Pattern');
  const customPlugin = new CustomAnalyticsPlugin();
  await manager.registerPlugin(customPlugin.getManifest());
  // Plugin is registered but not loaded until first use
  
  // 2. Batch Processing Pattern
  console.log('\n⚡ Batch Processing Pattern');
  const streamProcessor = new StreamProcessorPlugin();
  await manager.registerPlugin(streamProcessor.getManifest());
  await manager.loadPlugin('stream-processor');
  await manager.activatePlugin('stream-processor');
  
  const datasets = Array.from({ length: 5 }, (_, i) => ({
    id: `dataset_${i}`,
    name: `Dataset ${i}`,
    schema: { fields: [] },
    data: [{ value: i * 10 }],
    metadata: {}
  }));
  
  // Process multiple datasets in batch
  const batchResult = await manager.executePlugin('stream-processor', 'batch', {
    datasets
  });
  console.log('✅ Batch processed:', batchResult.length, 'datasets');
  
  // 3. Caching Pattern
  console.log('\n🗄️ Caching Pattern');
  const cachedProcessor = new CachedProcessorPlugin();
  await manager.registerPlugin(cachedProcessor.getManifest());
  await manager.loadPlugin('cached-processor');
  await manager.activatePlugin('cached-processor');
  
  const testData = { values: [1, 2, 3, 4, 5] };
  
  // First call - cache miss
  const start1 = Date.now();
  await manager.executePlugin('cached-processor', 'process', {
    data: testData,
    options: { type: 'test' }
  });
  const time1 = Date.now() - start1;
  
  // Second call - cache hit
  const start2 = Date.now();
  await manager.executePlugin('cached-processor', 'process', {
    data: testData,
    options: { type: 'test' }
  });
  const time2 = Date.now() - start2;
  
  console.log(`⚡ Performance improvement: ${time1}ms -> ${time2}ms`);
  
  // Get cache statistics
  const stats = await manager.executePlugin('cached-processor', 'getCacheStats');
  console.log('📊 Cache stats:', stats);
  
  return { pluginSystem, performanceData: { time1, time2, stats } };
}

/**
 * Example 6: Advanced Error Handling and Recovery
 */
export async function demonstrateErrorHandling() {
  console.log('\n🛡️ Advanced Error Handling');
  
  const pluginSystem = await DataPrismPluginSystem.create();
  const manager = pluginSystem.getPluginManager();
  
  // Register plugins with error handling
  const plugins = [
    new CustomAnalyticsPlugin(),
    new DataPipelinePlugin(),
    new StreamProcessorPlugin()
  ];
  
  for (const plugin of plugins) {
    try {
      await manager.registerPlugin(plugin.getManifest());
      await manager.loadPlugin(plugin.getName());
      await manager.activatePlugin(plugin.getName());
      console.log(`✅ ${plugin.getName()} activated`);
    } catch (error) {
      console.log(`❌ Failed to activate ${plugin.getName()}:`, (error as Error).message);
      // Continue with other plugins
    }
  }
  
  // Test error recovery
  const activePlugins = manager.getActivePlugins();
  console.log(`🔧 ${activePlugins.length} plugins active after error handling`);
  
  return { pluginSystem, activePlugins };
}

/**
 * Main function to run all advanced examples
 */
export async function runAdvancedExamples() {
  console.log('🎯 Advanced Plugin Patterns Examples\n');
  
  try {
    await demonstratePerformancePatterns();
    await demonstrateErrorHandling();
    
    console.log('\n🎉 All advanced examples completed successfully!');
  } catch (error) {
    console.error('\n❌ Advanced example failed:', error);
  }
}

// Export all advanced patterns
export {
  CustomAnalyticsPlugin,
  DataPipelinePlugin,
  StreamProcessorPlugin,
  CachedProcessorPlugin,
  demonstratePerformancePatterns,
  demonstrateErrorHandling
};

// Run examples if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runAdvancedExamples().catch(console.error);
}