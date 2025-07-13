import {
  IIntegrationPlugin,
  ILLMIntegrationPlugin,
  Connection,
  SyncResult,
  DataSource,
  LLMCompletion,
  LLMEmbedding,
  LLMProvider,
  PluginContext,
  PluginCapability,
  PluginManifest,
  PluginDependency,
  Dataset
} from '../../src/interfaces/index.js';

/**
 * LLM Integration Plugin
 * 
 * This plugin demonstrates integration capabilities including:
 * - Multiple LLM provider support (OpenAI, Anthropic, Local models)
 * - Intelligent caching and rate limiting
 * - Data analysis and insight generation
 * - Natural language query processing
 */
export class LLMIntegrationPlugin implements ILLMIntegrationPlugin {
  private context: PluginContext | null = null;
  private initialized = false;
  private active = false;
  private connections: Map<string, Connection> = new Map();
  private cache: Map<string, any> = new Map();
  private rateLimiter: Map<string, number[]> = new Map();
  private providers: LLMProvider[] = [
    {
      name: 'openai',
      apiUrl: 'https://api.openai.com/v1',
      models: ['gpt-4', 'gpt-3.5-turbo', 'text-embedding-ada-002'],
      capabilities: ['completion', 'embedding', 'function-calling']
    },
    {
      name: 'anthropic',
      apiUrl: 'https://api.anthropic.com/v1',
      models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
      capabilities: ['completion']
    },
    {
      name: 'local',
      apiUrl: 'http://localhost:11434/api',
      models: ['llama2', 'codellama', 'mistral'],
      capabilities: ['completion', 'embedding']
    }
  ];

  // Plugin Identity
  getName(): string {
    return 'llm-integration';
  }

  getVersion(): string {
    return '1.0.0';
  }

  getDescription(): string {
    return 'Advanced LLM integration plugin with multiple providers and intelligent caching';
  }

  getAuthor(): string {
    return 'DataPrism Team';
  }

  getDependencies(): PluginDependency[] {
    return [];
  }

  getManifest(): PluginManifest {
    return {
      name: this.getName(),
      version: this.getVersion(),
      description: this.getDescription(),
      author: this.getAuthor(),
      license: 'MIT',
      keywords: ['llm', 'ai', 'integration', 'analysis', 'natural-language'],
      category: 'integration',
      entryPoint: './llm-integration.js',
      dependencies: [],
      permissions: [
        { resource: 'network', access: 'read' },
        { resource: 'network', access: 'write' },
        { resource: 'data', access: 'read' },
        { resource: 'storage', access: 'read' },
        { resource: 'storage', access: 'write' }
      ],
      configuration: {
        defaultProvider: {
          type: 'string',
          default: 'openai',
          description: 'Default LLM provider to use'
        },
        cacheEnabled: {
          type: 'boolean',
          default: true,
          description: 'Enable response caching'
        },
        rateLimitPerMinute: {
          type: 'number',
          default: 60,
          description: 'Maximum requests per minute per provider'
        },
        maxTokens: {
          type: 'number',
          default: 2048,
          description: 'Maximum tokens per completion request'
        }
      },
      compatibility: {
        minCoreVersion: '0.1.0',
        browsers: ['chrome', 'firefox', 'safari', 'edge']
      }
    };
  }

  getCapabilities(): PluginCapability[] {
    return [
      {
        name: 'llm-completion',
        description: 'Generate text completions using LLM providers',
        type: 'integration',
        version: '1.0.0',
        async: true,
        inputTypes: ['text/plain'],
        outputTypes: ['text/plain', 'application/json']
      },
      {
        name: 'data-analysis',
        description: 'Generate insights and analysis from datasets',
        type: 'integration',
        version: '1.0.0',
        async: true,
        inputTypes: ['application/json'],
        outputTypes: ['text/plain', 'application/json']
      },
      {
        name: 'embeddings',
        description: 'Generate vector embeddings for text data',
        type: 'integration',
        version: '1.0.0',
        async: true,
        inputTypes: ['text/plain'],
        outputTypes: ['application/json']
      },
      {
        name: 'natural-language-query',
        description: 'Process natural language queries against datasets',
        type: 'integration',
        version: '1.0.0',
        async: true,
        inputTypes: ['text/plain', 'application/json'],
        outputTypes: ['application/json']
      }
    ];
  }

  isCompatible(coreVersion: string): boolean {
    return coreVersion >= '0.1.0';
  }

  // Lifecycle Management
  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    this.log('info', 'Initializing LLM Integration Plugin');
    
    // Load configuration
    const config = this.context.config;
    this.log('debug', 'Plugin configuration:', config);
    
    // Initialize rate limiters for each provider
    this.providers.forEach(provider => {
      this.rateLimiter.set(provider.name, []);
    });
    
    this.initialized = true;
    this.log('info', 'LLM Integration Plugin initialized successfully');
  }

  async activate(): Promise<void> {
    if (!this.initialized) {
      throw new Error('Plugin must be initialized before activation');
    }
    
    this.active = true;
    this.log('info', 'LLM Integration Plugin activated');
    
    // Register event listeners
    this.context?.eventBus.subscribe('data:analysis-request', this.handleAnalysisRequest.bind(this));
    this.context?.eventBus.subscribe('query:natural-language', this.handleNaturalLanguageQuery.bind(this));
  }

  async deactivate(): Promise<void> {
    // Close all connections
    for (const connection of this.connections.values()) {
      await this.disconnect(connection.id);
    }
    
    this.active = false;
    this.log('info', 'LLM Integration Plugin deactivated');
  }

  async cleanup(): Promise<void> {
    this.connections.clear();
    this.cache.clear();
    this.rateLimiter.clear();
    this.context = null;
    this.initialized = false;
    this.active = false;
    this.log('info', 'LLM Integration Plugin cleaned up');
  }

  // Core Operations
  async execute(operation: string, params: any): Promise<any> {
    if (!this.active) {
      throw new Error('Plugin is not active');
    }

    this.log('debug', `Executing operation: ${operation}`, params);

    switch (operation) {
      case 'connect':
        return this.connect(params.source);
      case 'disconnect':
        return this.disconnect(params.connectionId);
      case 'sync':
        return this.sync(params.connectionId, params.options);
      case 'completion':
        return this.generateCompletion(params.prompt, params.options);
      case 'embedding':
        return this.generateEmbedding(params.text, params.options);
      case 'analyze':
        return this.analyzeDataset(params.dataset, params.options);
      case 'query':
        return this.processNaturalLanguageQuery(params.query, params.dataset, params.options);
      case 'providers':
        return this.getAvailableProviders();
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  async configure(settings: any): Promise<void> {
    this.log('info', 'Updating plugin configuration', settings);
    // Update internal configuration
  }

  // Integration Operations
  async connect(source: DataSource): Promise<Connection> {
    this.log('info', `Connecting to data source: ${source.name}`);
    
    const connectionId = `${source.type}_${Date.now()}`;
    const connection: Connection = {
      id: connectionId,
      name: source.name,
      type: source.type,
      status: 'connecting',
      config: source.config,
      createdAt: new Date(),
      lastSync: null
    };

    try {
      // Validate connection parameters
      await this.validateConnectionConfig(source);
      
      // Test connection
      const testResult = await this.testConnection(source);
      if (!testResult.success) {
        throw new Error(`Connection test failed: ${testResult.error}`);
      }
      
      connection.status = 'connected';
      this.connections.set(connectionId, connection);
      
      this.log('info', `Successfully connected to ${source.name}`);
      this.emit('connection:established', { connection });
      
      return connection;
    } catch (error) {
      connection.status = 'error';
      this.log('error', `Failed to connect to ${source.name}`, error);
      throw error;
    }
  }

  async disconnect(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error(`Connection not found: ${connectionId}`);
    }

    this.log('info', `Disconnecting from ${connection.name}`);
    
    try {
      // Perform cleanup if needed
      await this.cleanupConnection(connection);
      
      connection.status = 'disconnected';
      this.connections.delete(connectionId);
      
      this.emit('connection:closed', { connectionId, name: connection.name });
    } catch (error) {
      this.log('error', `Error during disconnection from ${connection.name}`, error);
      throw error;
    }
  }

  async sync(connectionId: string, options?: any): Promise<SyncResult> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error(`Connection not found: ${connectionId}`);
    }

    this.log('info', `Syncing data from ${connection.name}`);
    
    const startTime = Date.now();
    let recordsProcessed = 0;
    let recordsSkipped = 0;
    const errors: string[] = [];

    try {
      switch (connection.type) {
        case 'api':
          const apiResult = await this.syncFromAPI(connection, options);
          recordsProcessed = apiResult.processed;
          recordsSkipped = apiResult.skipped;
          break;
        case 'llm':
          const llmResult = await this.syncFromLLM(connection, options);
          recordsProcessed = llmResult.processed;
          recordsSkipped = llmResult.skipped;
          break;
        default:
          throw new Error(`Unsupported connection type: ${connection.type}`);
      }

      connection.lastSync = new Date();
      
      const result: SyncResult = {
        success: true,
        recordsProcessed,
        recordsSkipped,
        errors,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };

      this.log('info', `Sync completed: ${recordsProcessed} processed, ${recordsSkipped} skipped`);
      this.emit('sync:completed', { connectionId, result });
      
      return result;
    } catch (error) {
      const result: SyncResult = {
        success: false,
        recordsProcessed,
        recordsSkipped,
        errors: [String(error)],
        duration: Date.now() - startTime,
        timestamp: new Date()
      };

      this.log('error', `Sync failed for ${connection.name}`, error);
      this.emit('sync:failed', { connectionId, result });
      
      return result;
    }
  }

  // LLM Operations
  async generateCompletion(prompt: string, options?: any): Promise<LLMCompletion> {
    const provider = options?.provider || this.context?.config.defaultProvider || 'openai';
    const model = options?.model || this.getDefaultModel(provider);
    
    this.log('info', `Generating completion using ${provider}:${model}`);
    
    // Check rate limits
    await this.checkRateLimit(provider);
    
    // Check cache
    const cacheKey = this.generateCacheKey('completion', prompt, options);
    if (this.context?.config.cacheEnabled && this.cache.has(cacheKey)) {
      this.log('debug', 'Returning cached completion');
      return this.cache.get(cacheKey);
    }

    try {
      const completion = await this.callLLMAPI(provider, 'completion', {
        prompt,
        model,
        max_tokens: options?.maxTokens || this.context?.config.maxTokens || 2048,
        temperature: options?.temperature || 0.7,
        ...options
      });

      // Cache the result
      if (this.context?.config.cacheEnabled) {
        this.cache.set(cacheKey, completion);
      }

      this.log('info', `Completion generated successfully (${completion.tokens} tokens)`);
      this.emit('completion:generated', { provider, model, tokens: completion.tokens });
      
      return completion;
    } catch (error) {
      this.log('error', `Completion generation failed`, error);
      throw error;
    }
  }

  async generateEmbedding(text: string, options?: any): Promise<LLMEmbedding> {
    const provider = options?.provider || this.context?.config.defaultProvider || 'openai';
    const model = options?.model || this.getDefaultEmbeddingModel(provider);
    
    this.log('info', `Generating embedding using ${provider}:${model}`);
    
    // Check rate limits
    await this.checkRateLimit(provider);
    
    // Check cache
    const cacheKey = this.generateCacheKey('embedding', text, options);
    if (this.context?.config.cacheEnabled && this.cache.has(cacheKey)) {
      this.log('debug', 'Returning cached embedding');
      return this.cache.get(cacheKey);
    }

    try {
      const embedding = await this.callLLMAPI(provider, 'embedding', {
        input: text,
        model,
        ...options
      });

      // Cache the result
      if (this.context?.config.cacheEnabled) {
        this.cache.set(cacheKey, embedding);
      }

      this.log('info', `Embedding generated successfully (${embedding.dimensions} dimensions)`);
      this.emit('embedding:generated', { provider, model, dimensions: embedding.dimensions });
      
      return embedding;
    } catch (error) {
      this.log('error', `Embedding generation failed`, error);
      throw error;
    }
  }

  async analyzeDataset(dataset: Dataset, options?: any): Promise<any> {
    this.log('info', `Analyzing dataset: ${dataset.name} (${dataset.data.length} rows)`);
    
    // Prepare dataset summary for LLM
    const summary = this.createDatasetSummary(dataset);
    
    const analysisPrompt = this.buildAnalysisPrompt(summary, options);
    
    const completion = await this.generateCompletion(analysisPrompt, {
      provider: options?.provider,
      model: options?.model,
      temperature: 0.3, // Lower temperature for more factual analysis
      maxTokens: options?.maxTokens || 1500
    });

    const analysis = {
      dataset: dataset.name,
      summary,
      insights: this.parseAnalysisResponse(completion.text),
      recommendations: this.generateRecommendations(summary),
      metadata: {
        analyzedAt: new Date().toISOString(),
        provider: completion.provider,
        model: completion.model,
        tokens: completion.tokens
      }
    };

    this.log('info', 'Dataset analysis completed');
    this.emit('analysis:completed', { dataset: dataset.name, analysis });
    
    return analysis;
  }

  async processNaturalLanguageQuery(query: string, dataset: Dataset, options?: any): Promise<any> {
    this.log('info', `Processing natural language query: "${query}"`);
    
    // Create context about the dataset
    const datasetContext = this.createDatasetContext(dataset);
    
    // Build query processing prompt
    const queryPrompt = this.buildQueryPrompt(query, datasetContext, options);
    
    const completion = await this.generateCompletion(queryPrompt, {
      provider: options?.provider,
      model: options?.model,
      temperature: 0.2, // Lower temperature for more precise queries
      maxTokens: options?.maxTokens || 1000
    });

    const result = {
      originalQuery: query,
      interpretation: this.parseQueryInterpretation(completion.text),
      suggestedSQL: this.extractSQLFromResponse(completion.text),
      dataContext: datasetContext,
      metadata: {
        processedAt: new Date().toISOString(),
        provider: completion.provider,
        model: completion.model,
        tokens: completion.tokens
      }
    };

    this.log('info', 'Natural language query processed');
    this.emit('query:processed', { query, result });
    
    return result;
  }

  getAvailableProviders(): LLMProvider[] {
    return [...this.providers];
  }

  // Helper Methods
  private async validateConnectionConfig(source: DataSource): Promise<void> {
    if (!source.name || !source.type || !source.config) {
      throw new Error('Invalid data source configuration');
    }

    switch (source.type) {
      case 'api':
        if (!source.config.url) {
          throw new Error('API URL is required');
        }
        break;
      case 'llm':
        if (!source.config.provider || !source.config.apiKey) {
          throw new Error('LLM provider and API key are required');
        }
        break;
      default:
        throw new Error(`Unsupported source type: ${source.type}`);
    }
  }

  private async testConnection(source: DataSource): Promise<{ success: boolean; error?: string }> {
    try {
      switch (source.type) {
        case 'api':
          const response = await fetch(source.config.url, {
            method: 'HEAD',
            headers: source.config.headers || {}
          });
          return { success: response.ok };
        case 'llm':
          // Test LLM connection with a simple prompt
          const testResult = await this.callLLMAPI(source.config.provider, 'completion', {
            prompt: 'Test connection',
            model: this.getDefaultModel(source.config.provider),
            max_tokens: 10
          });
          return { success: !!testResult };
        default:
          return { success: false, error: `Unsupported source type: ${source.type}` };
      }
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  private async cleanupConnection(connection: Connection): Promise<void> {
    // Perform any necessary cleanup
    this.log('debug', `Cleaning up connection: ${connection.name}`);
  }

  private async syncFromAPI(connection: Connection, options?: any): Promise<{ processed: number; skipped: number }> {
    // Implement API sync logic
    return { processed: 0, skipped: 0 };
  }

  private async syncFromLLM(connection: Connection, options?: any): Promise<{ processed: number; skipped: number }> {
    // Implement LLM sync logic
    return { processed: 0, skipped: 0 };
  }

  private async checkRateLimit(provider: string): Promise<void> {
    const now = Date.now();
    const rateLimit = this.context?.config.rateLimitPerMinute || 60;
    const windowMs = 60000; // 1 minute
    
    const requests = this.rateLimiter.get(provider) || [];
    
    // Remove old requests outside the window
    const recentRequests = requests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= rateLimit) {
      const oldestRequest = Math.min(...recentRequests);
      const waitTime = windowMs - (now - oldestRequest);
      throw new Error(`Rate limit exceeded for ${provider}. Try again in ${Math.ceil(waitTime / 1000)} seconds.`);
    }
    
    // Add current request
    recentRequests.push(now);
    this.rateLimiter.set(provider, recentRequests);
  }

  private async callLLMAPI(provider: string, endpoint: string, params: any): Promise<any> {
    const providerConfig = this.providers.find(p => p.name === provider);
    if (!providerConfig) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    const url = `${providerConfig.apiUrl}/${endpoint}`;
    
    // Mock implementation - in real usage, make actual API calls
    this.log('debug', `Calling ${provider} API: ${endpoint}`, params);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 500));
    
    switch (endpoint) {
      case 'completion':
        return {
          text: `This is a mock completion response for prompt: "${params.prompt?.substring(0, 50)}..."`,
          tokens: Math.floor(Math.random() * 1000) + 100,
          provider,
          model: params.model,
          finishReason: 'completed'
        };
      case 'embedding':
        return {
          embedding: Array.from({ length: 1536 }, () => Math.random() - 0.5),
          dimensions: 1536,
          provider,
          model: params.model
        };
      default:
        throw new Error(`Unknown endpoint: ${endpoint}`);
    }
  }

  private getDefaultModel(provider: string): string {
    const providerConfig = this.providers.find(p => p.name === provider);
    return providerConfig?.models[0] || 'unknown';
  }

  private getDefaultEmbeddingModel(provider: string): string {
    const modelMap: Record<string, string> = {
      openai: 'text-embedding-ada-002',
      local: 'llama2',
      anthropic: 'claude-3-haiku'
    };
    return modelMap[provider] || this.getDefaultModel(provider);
  }

  private generateCacheKey(type: string, input: string, options?: any): string {
    const optionsHash = options ? JSON.stringify(options) : '';
    return `${type}:${this.hashString(input + optionsHash)}`;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  private createDatasetSummary(dataset: Dataset): any {
    const data = dataset.data;
    const summary = {
      name: dataset.name,
      rowCount: data.length,
      columnCount: 0,
      columns: [] as any[],
      sampleData: data.slice(0, 5),
      statistics: {} as any
    };

    if (data.length > 0) {
      const columns = Object.keys(data[0]);
      summary.columnCount = columns.length;
      
      columns.forEach(col => {
        const values = data.map(row => row[col]).filter(v => v !== null && v !== undefined);
        const columnInfo = {
          name: col,
          type: this.inferDataType(values),
          nullCount: data.length - values.length,
          uniqueValues: new Set(values).size
        };
        
        if (columnInfo.type === 'number') {
          const numbers = values.map(Number).filter(n => !isNaN(n));
          columnInfo.statistics = {
            min: Math.min(...numbers),
            max: Math.max(...numbers),
            avg: numbers.reduce((a, b) => a + b, 0) / numbers.length
          };
        }
        
        summary.columns.push(columnInfo);
      });
    }

    return summary;
  }

  private createDatasetContext(dataset: Dataset): any {
    const summary = this.createDatasetSummary(dataset);
    return {
      ...summary,
      schema: dataset.schema,
      metadata: dataset.metadata
    };
  }

  private buildAnalysisPrompt(summary: any, options?: any): string {
    return `Analyze the following dataset and provide insights:

Dataset: ${summary.name}
Rows: ${summary.rowCount}
Columns: ${summary.columnCount}

Column Information:
${summary.columns.map((col: any) => 
  `- ${col.name} (${col.type}): ${col.uniqueValues} unique values, ${col.nullCount} nulls`
).join('\n')}

Sample Data:
${JSON.stringify(summary.sampleData, null, 2)}

Please provide:
1. Key insights about the data
2. Data quality observations
3. Potential patterns or anomalies
4. Suggested next steps for analysis

Focus on: ${options?.focus || 'general insights'}`;
  }

  private buildQueryPrompt(query: string, dataContext: any, options?: any): string {
    return `Given the following dataset context, interpret this natural language query and suggest how to answer it:

Dataset: ${dataContext.name}
Columns: ${dataContext.columns.map((col: any) => `${col.name} (${col.type})`).join(', ')}

Query: "${query}"

Please provide:
1. Interpretation of what the user is asking
2. Suggested SQL query to answer this question
3. Any assumptions or clarifications needed

Response format should include both explanation and SQL code.`;
  }

  private parseAnalysisResponse(text: string): string[] {
    // Simple parsing of insights from LLM response
    const lines = text.split('\n').filter(line => line.trim());
    const insights = [];
    
    for (const line of lines) {
      if (line.includes('insight') || line.includes('pattern') || line.includes('observation')) {
        insights.push(line.trim());
      }
    }
    
    return insights.length > 0 ? insights : [text];
  }

  private parseQueryInterpretation(text: string): string {
    // Extract the interpretation part from the response
    const lines = text.split('\n');
    const interpretationStart = lines.findIndex(line => 
      line.toLowerCase().includes('interpretation') || 
      line.toLowerCase().includes('asking')
    );
    
    if (interpretationStart >= 0) {
      return lines.slice(interpretationStart, interpretationStart + 3).join(' ').trim();
    }
    
    return text.substring(0, 200) + '...';
  }

  private extractSQLFromResponse(text: string): string | null {
    // Extract SQL code from the response
    const sqlMatch = text.match(/```sql\n([\s\S]*?)\n```/) || text.match(/SELECT[\s\S]*?;/i);
    return sqlMatch ? sqlMatch[1] || sqlMatch[0] : null;
  }

  private generateRecommendations(summary: any): string[] {
    const recommendations = [];
    
    if (summary.rowCount < 100) {
      recommendations.push('Consider collecting more data for better statistical significance');
    }
    
    const nullColumns = summary.columns.filter((col: any) => col.nullCount > summary.rowCount * 0.1);
    if (nullColumns.length > 0) {
      recommendations.push(`Address missing data in columns: ${nullColumns.map((col: any) => col.name).join(', ')}`);
    }
    
    const lowVarianceColumns = summary.columns.filter((col: any) => col.uniqueValues < 5);
    if (lowVarianceColumns.length > 0) {
      recommendations.push(`Consider removing low-variance columns: ${lowVarianceColumns.map((col: any) => col.name).join(', ')}`);
    }
    
    return recommendations;
  }

  private inferDataType(values: any[]): string {
    if (values.length === 0) return 'unknown';
    
    const sample = values[0];
    if (typeof sample === 'number') return 'number';
    if (typeof sample === 'boolean') return 'boolean';
    if (sample instanceof Date || !isNaN(Date.parse(sample))) return 'date';
    return 'string';
  }

  private handleAnalysisRequest(data: any): void {
    this.log('debug', 'Analysis request received', data);
    // Handle analysis request event
  }

  private handleNaturalLanguageQuery(data: any): void {
    this.log('debug', 'Natural language query received', data);
    // Handle natural language query event
  }

  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: any[]): void {
    if (this.context?.logger) {
      this.context.logger[level](message, ...args);
    } else {
      console[level](`[${this.getName()}]`, message, ...args);
    }
  }

  private emit(event: string, data: any): void {
    if (this.context?.eventBus) {
      this.context.eventBus.publish(`plugin:${this.getName()}:${event}`, data);
    }
  }
}

// Plugin manifest for auto-discovery
export const manifest: PluginManifest = {
  name: 'llm-integration',
  version: '1.0.0',
  description: 'Advanced LLM integration plugin with multiple providers and intelligent caching',
  author: 'DataPrism Team',
  license: 'MIT',
  keywords: ['llm', 'ai', 'integration', 'analysis', 'natural-language'],
  category: 'integration',
  entryPoint: './llm-integration.js',
  dependencies: [],
  permissions: [
    { resource: 'network', access: 'read' },
    { resource: 'network', access: 'write' },
    { resource: 'data', access: 'read' },
    { resource: 'storage', access: 'read' },
    { resource: 'storage', access: 'write' }
  ],
  configuration: {
    defaultProvider: {
      type: 'string',
      default: 'openai',
      description: 'Default LLM provider to use'
    },
    cacheEnabled: {
      type: 'boolean',
      default: true,
      description: 'Enable response caching'
    }
  },
  compatibility: {
    minCoreVersion: '0.1.0',
    browsers: ['chrome', 'firefox', 'safari', 'edge']
  }
};

export default LLMIntegrationPlugin;