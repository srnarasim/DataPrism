import { 
  IDataProcessorPlugin, 
  Dataset, 
  ProcessingOptions, 
  ValidationResult,
  TransformationRule,
  ProcessingCapability,
  DataType,
  ProcessingMetrics,
  PluginContext,
  PluginCapability,
  PluginManifest,
  PluginDependency
} from '../../src/interfaces/index.js';

/**
 * CSV Data Processor Plugin
 * 
 * This plugin demonstrates data processing capabilities including:
 * - CSV parsing and formatting
 * - Data validation and cleaning
 * - Statistical transformations
 * - Batch processing support
 */
export class CSVProcessorPlugin implements IDataProcessorPlugin {
  private context: PluginContext | null = null;
  private initialized = false;
  private active = false;
  private metrics: ProcessingMetrics = {
    totalProcessed: 0,
    averageProcessingTime: 0,
    errorsEncountered: 0,
    dataQualityScore: 100
  };

  // Plugin Identity
  getName(): string {
    return 'csv-processor';
  }

  getVersion(): string {
    return '1.0.0';
  }

  getDescription(): string {
    return 'Advanced CSV data processing plugin with validation and transformation capabilities';
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
      keywords: ['csv', 'data-processing', 'validation', 'transformation'],
      category: 'data-processing',
      entryPoint: './csv-processor.js',
      dependencies: [],
      permissions: [
        { resource: 'data', access: 'read' },
        { resource: 'data', access: 'write' },
        { resource: 'storage', access: 'read' }
      ],
      configuration: {
        delimiter: {
          type: 'string',
          default: ',',
          description: 'CSV delimiter character'
        },
        hasHeader: {
          type: 'boolean',
          default: true,
          description: 'Whether CSV has header row'
        },
        validateData: {
          type: 'boolean',
          default: true,
          description: 'Enable data validation'
        },
        maxRows: {
          type: 'number',
          default: 1000000,
          description: 'Maximum rows to process'
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
        name: 'csv-parsing',
        description: 'Parse CSV data with customizable delimiters',
        type: 'processing',
        version: '1.0.0',
        async: true,
        inputTypes: ['text/csv', 'text/plain'],
        outputTypes: ['application/json']
      },
      {
        name: 'data-validation',
        description: 'Validate data quality and detect anomalies',
        type: 'processing',
        version: '1.0.0',
        async: true,
        inputTypes: ['application/json'],
        outputTypes: ['application/json']
      },
      {
        name: 'statistical-transform',
        description: 'Apply statistical transformations to datasets',
        type: 'processing',
        version: '1.0.0',
        async: true,
        inputTypes: ['application/json'],
        outputTypes: ['application/json']
      }
    ];
  }

  isCompatible(coreVersion: string): boolean {
    // Simple version compatibility check
    return coreVersion >= '0.1.0';
  }

  // Lifecycle Management
  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    this.log('info', 'Initializing CSV Processor Plugin');
    
    // Initialize configuration from context
    const config = this.context.config;
    this.log('debug', 'Plugin configuration:', config);
    
    this.initialized = true;
    this.log('info', 'CSV Processor Plugin initialized successfully');
  }

  async activate(): Promise<void> {
    if (!this.initialized) {
      throw new Error('Plugin must be initialized before activation');
    }
    
    this.active = true;
    this.log('info', 'CSV Processor Plugin activated');
    
    // Register event listeners
    this.context?.eventBus.subscribe('data:new', this.handleNewData.bind(this));
  }

  async deactivate(): Promise<void> {
    this.active = false;
    this.log('info', 'CSV Processor Plugin deactivated');
  }

  async cleanup(): Promise<void> {
    this.context = null;
    this.initialized = false;
    this.active = false;
    this.log('info', 'CSV Processor Plugin cleaned up');
  }

  // Core Operations
  async execute(operation: string, params: any): Promise<any> {
    if (!this.active) {
      throw new Error('Plugin is not active');
    }

    this.log('debug', `Executing operation: ${operation}`, params);

    switch (operation) {
      case 'parse':
        return this.parseCSV(params.data, params.options);
      case 'validate':
        return this.validate(params.dataset);
      case 'transform':
        return this.transform(params.dataset, params.rules);
      case 'process':
        return this.process(params.dataset, params.options);
      case 'getMetrics':
        return this.getPerformanceMetrics();
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  async configure(settings: any): Promise<void> {
    this.log('info', 'Updating plugin configuration', settings);
    // Update internal configuration
    // In a real implementation, this would update the plugin's behavior
  }

  // Data Processing Operations
  async process(data: Dataset, options?: ProcessingOptions): Promise<Dataset> {
    const startTime = Date.now();
    this.log('info', `Processing dataset: ${data.name} (${data.data.length} rows)`);

    try {
      let processedData = [...data.data];

      // Apply basic data cleaning
      processedData = this.cleanData(processedData);

      // Apply transformations based on options
      if (options?.validation) {
        const validation = await this.validate(data);
        if (!validation.isValid) {
          this.log('warn', 'Data validation failed', validation.errors);
        }
      }

      const processingTime = Date.now() - startTime;
      this.updateMetrics(processedData.length, processingTime);

      const result: Dataset = {
        ...data,
        id: `${data.id}_processed`,
        data: processedData,
        metadata: {
          ...data.metadata,
          processedBy: this.getName(),
          processedAt: new Date().toISOString(),
          processingTime: processingTime,
          originalRowCount: data.data.length,
          processedRowCount: processedData.length
        }
      };

      this.log('info', `Processing completed in ${processingTime}ms`);
      this.emit('processing:complete', { dataset: result, metrics: this.metrics });

      return result;
    } catch (error) {
      this.metrics.errorsEncountered++;
      this.log('error', 'Processing failed', error);
      throw error;
    }
  }

  async transform(data: Dataset, rules: TransformationRule[]): Promise<Dataset> {
    this.log('info', `Applying ${rules.length} transformation rules`);

    let transformedData = [...data.data];

    for (const rule of rules) {
      transformedData = this.applyTransformationRule(transformedData, rule);
    }

    return {
      ...data,
      id: `${data.id}_transformed`,
      data: transformedData,
      metadata: {
        ...data.metadata,
        transformedBy: this.getName(),
        transformedAt: new Date().toISOString(),
        transformationRules: rules.map(r => ({ field: r.field, operation: r.operation }))
      }
    };
  }

  async validate(data: Dataset): Promise<ValidationResult> {
    this.log('info', `Validating dataset: ${data.name}`);

    const errors: any[] = [];
    const warnings: any[] = [];
    const statistics = {
      totalRows: data.data.length,
      nullValues: 0,
      duplicateRows: 0,
      dataTypes: {} as Record<string, string>
    };

    // Check for null/undefined values
    data.data.forEach((row, index) => {
      Object.entries(row).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          statistics.nullValues++;
          warnings.push({
            type: 'null_value',
            row: index,
            field: key,
            message: `Null value found in field '${key}' at row ${index}`
          });
        }
      });
    });

    // Check for duplicate rows
    const rowHashes = new Set();
    data.data.forEach((row, index) => {
      const hash = JSON.stringify(row);
      if (rowHashes.has(hash)) {
        statistics.duplicateRows++;
        warnings.push({
          type: 'duplicate_row',
          row: index,
          message: `Duplicate row found at index ${index}`
        });
      } else {
        rowHashes.add(hash);
      }
    });

    // Analyze data types
    if (data.data.length > 0) {
      Object.keys(data.data[0]).forEach(key => {
        const values = data.data.map(row => row[key]).filter(v => v !== null && v !== undefined);
        statistics.dataTypes[key] = this.inferDataType(values);
      });
    }

    const isValid = errors.length === 0;
    
    this.log('info', `Validation complete: ${isValid ? 'PASSED' : 'FAILED'}`);

    return {
      isValid,
      errors,
      warnings,
      statistics
    };
  }

  // Processing Capabilities
  getProcessingCapabilities(): ProcessingCapability[] {
    return [
      {
        name: 'csv-parsing',
        description: 'Parse CSV files with configurable delimiters and headers',
        inputTypes: ['text/csv'],
        outputTypes: ['application/json'],
        complexity: 'low',
        async: true
      },
      {
        name: 'data-cleaning',
        description: 'Clean and normalize data removing duplicates and null values',
        inputTypes: ['application/json'],
        outputTypes: ['application/json'],
        complexity: 'medium',
        async: true
      },
      {
        name: 'statistical-analysis',
        description: 'Perform statistical analysis and generate insights',
        inputTypes: ['application/json'],
        outputTypes: ['application/json'],
        complexity: 'high',
        async: true
      }
    ];
  }

  getSupportedDataTypes(): DataType[] {
    return [
      { name: 'string', description: 'Text data' },
      { name: 'number', description: 'Numeric data (integer or float)' },
      { name: 'boolean', description: 'Boolean true/false values' },
      { name: 'date', description: 'Date and time values' },
      { name: 'currency', description: 'Monetary values' }
    ];
  }

  getPerformanceMetrics(): ProcessingMetrics {
    return { ...this.metrics };
  }

  // Advanced Features
  async batch(datasets: Dataset[]): Promise<Dataset[]> {
    this.log('info', `Batch processing ${datasets.length} datasets`);

    const results: Dataset[] = [];
    for (const dataset of datasets) {
      try {
        const processed = await this.process(dataset);
        results.push(processed);
      } catch (error) {
        this.log('error', `Failed to process dataset ${dataset.id}`, error);
        // Continue with other datasets
      }
    }

    this.log('info', `Batch processing complete: ${results.length}/${datasets.length} successful`);
    return results;
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
            
            // Process the dataset
            plugin.process(value).then(processed => {
              controller.enqueue(processed);
              return pump();
            }).catch(error => {
              plugin.log('error', 'Stream processing error', error);
              controller.error(error);
            });
          });
        }
        
        return pump();
      }
    });
  }

  // Helper Methods
  private async parseCSV(csvData: string, options: any = {}): Promise<Dataset> {
    const delimiter = options.delimiter || ',';
    const hasHeader = options.hasHeader !== false;
    
    const lines = csvData.trim().split('\n');
    const headers = hasHeader ? this.parseCSVLine(lines[0], delimiter) : null;
    const dataLines = hasHeader ? lines.slice(1) : lines;
    
    const data = dataLines.map((line, index) => {
      const values = this.parseCSVLine(line, delimiter);
      if (headers) {
        const row: any = {};
        headers.forEach((header, i) => {
          row[header] = this.parseValue(values[i] || '');
        });
        return row;
      } else {
        return values.reduce((row: any, value, i) => {
          row[`column_${i}`] = this.parseValue(value);
          return row;
        }, {});
      }
    });

    return {
      id: `csv_${Date.now()}`,
      name: 'CSV Dataset',
      schema: this.generateSchema(data),
      data,
      metadata: {
        source: 'csv_parser',
        createdAt: new Date().toISOString(),
        rowCount: data.length,
        columnCount: headers?.length || (data[0] ? Object.keys(data[0]).length : 0)
      }
    };
  }

  private parseCSVLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  private parseValue(value: string): any {
    if (!value || value === '') return null;
    
    // Try number
    const num = Number(value);
    if (!isNaN(num)) return num;
    
    // Try boolean
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
    
    // Try date
    const date = new Date(value);
    if (!isNaN(date.getTime()) && value.includes('-')) {
      return date.toISOString();
    }
    
    return value;
  }

  private cleanData(data: any[]): any[] {
    return data
      .filter(row => Object.values(row).some(value => value !== null && value !== undefined))
      .map(row => {
        const cleaned: any = {};
        Object.entries(row).forEach(([key, value]) => {
          if (typeof value === 'string') {
            cleaned[key] = value.trim();
          } else {
            cleaned[key] = value;
          }
        });
        return cleaned;
      });
  }

  private applyTransformationRule(data: any[], rule: TransformationRule): any[] {
    return data.map(row => {
      const value = row[rule.field];
      let transformedValue = value;

      switch (rule.operation) {
        case 'uppercase':
          transformedValue = typeof value === 'string' ? value.toUpperCase() : value;
          break;
        case 'lowercase':
          transformedValue = typeof value === 'string' ? value.toLowerCase() : value;
          break;
        case 'multiply':
          transformedValue = typeof value === 'number' ? value * (rule.parameters.factor || 1) : value;
          break;
        case 'round':
          transformedValue = typeof value === 'number' ? Math.round(value) : value;
          break;
        case 'replace':
          transformedValue = typeof value === 'string' ? 
            value.replace(rule.parameters.from, rule.parameters.to) : value;
          break;
        default:
          // No transformation
          break;
      }

      return { ...row, [rule.field]: transformedValue };
    });
  }

  private generateSchema(data: any[]): any {
    if (data.length === 0) return { fields: [] };

    const fields = Object.keys(data[0]).map(key => {
      const values = data.map(row => row[key]).filter(v => v !== null && v !== undefined);
      return {
        name: key,
        type: this.inferDataType(values),
        nullable: data.some(row => row[key] === null || row[key] === undefined)
      };
    });

    return { fields };
  }

  private inferDataType(values: any[]): string {
    if (values.length === 0) return 'unknown';

    const firstValue = values[0];
    if (typeof firstValue === 'number') return 'number';
    if (typeof firstValue === 'boolean') return 'boolean';
    if (firstValue instanceof Date || (typeof firstValue === 'string' && !isNaN(Date.parse(firstValue)))) {
      return 'date';
    }
    return 'string';
  }

  private updateMetrics(rowsProcessed: number, processingTime: number): void {
    this.metrics.totalProcessed += rowsProcessed;
    this.metrics.averageProcessingTime = 
      (this.metrics.averageProcessingTime + processingTime) / 2;
  }

  private handleNewData(data: any): void {
    this.log('debug', 'New data event received', data);
    // Handle new data availability
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
  name: 'csv-processor',
  version: '1.0.0',
  description: 'Advanced CSV data processing plugin with validation and transformation capabilities',
  author: 'DataPrism Team',
  license: 'MIT',
  keywords: ['csv', 'data-processing', 'validation', 'transformation'],
  category: 'data-processing',
  entryPoint: './csv-processor.js',
  dependencies: [],
  permissions: [
    { resource: 'data', access: 'read' },
    { resource: 'data', access: 'write' },
    { resource: 'storage', access: 'read' }
  ],
  configuration: {
    delimiter: {
      type: 'string',
      default: ',',
      description: 'CSV delimiter character'
    },
    hasHeader: {
      type: 'boolean',
      default: true,
      description: 'Whether CSV has header row'
    }
  },
  compatibility: {
    minCoreVersion: '0.1.0',
    browsers: ['chrome', 'firefox', 'safari', 'edge']
  }
};

// Export the plugin class as default
export default CSVProcessorPlugin;