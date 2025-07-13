# DataPrism Core Plugin PRP Generator

## Context Engineering Template for Plugin Development

This document provides comprehensive context for generating Product Requirements Prompts (PRPs) for DataPrism Core plugins. Use this as the foundation for all plugin development PRPs to ensure consistency, performance, and proper integration with the core engine.

## DataPrism Core Architecture Context

### Core Engine Overview

DataPrism Core is a WebAssembly-powered browser analytics engine that processes large datasets with DuckDB-WASM integration and LLM-powered natural language processing. The hybrid architecture consists of:

- **Core WASM Engine (4-6MB)**: High-performance analytical database with DuckDB integration
- **JavaScript Orchestration Layer**: API management, event handling, and plugin coordination
- **LLM Integration Layer**: Natural language processing and intelligent insights
- **Plugin Extension Layer**: Modular functionality through well-defined interfaces

### Performance Requirements

- Query response: <2 seconds for 95% of analytical queries
- Memory usage: <4GB for 1M row datasets
- Initialization: <5 seconds for engine startup
- Browser support: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## Plugin Architecture Framework

### Plugin Categories

#### 1. Data Processing Plugins

**Purpose**: Extend analytical capabilities of the core engine
**Examples**:

- Data Labeling Tools (hierarchical taxonomy classification)
- Semantic Clustering (ML-powered data grouping)
- Quality Assurance (data validation and consistency)
- Duplicate Detection (advanced deduplication algorithms)

**Interface**: `IDataProcessorPlugin`

```typescript
interface IDataProcessorPlugin extends IPlugin {
  process(data: Dataset): Dataset;
  validate(data: Dataset): boolean;
  transform(data: Dataset, rules: TransformRules): Dataset;
  getProcessingCapabilities(): ProcessingCapabilities;
}
```

#### 2. Visualization Plugins

**Purpose**: Render and present data to users
**Examples**:

- Chart Renderers (custom visualization components)
- Report Generators (automated reporting systems)
- Dashboard Builders (interactive dashboard creation)
- Taxonomy Tree Viewers (hierarchical data navigation)

**Interface**: `IVisualizationPlugin`

```typescript
interface IVisualizationPlugin extends IPlugin {
  render(container: Element, data: Dataset): void;
  update(data: Dataset): void;
  resize(dimensions: Dimensions): void;
  getVisualizationTypes(): VisualizationType[];
}
```

#### 3. Integration Plugins

**Purpose**: Connect with external systems and services
**Examples**:

- LLM Connectors (OpenAI, Anthropic, custom models)
- API Bridges (RESTful service connectivity)
- Export Handlers (CSV, JSON, Parquet, custom formats)
- Authentication Providers (OAuth, API key, custom auth)

**Interface**: `IIntegrationPlugin`

```typescript
interface IIntegrationPlugin extends IPlugin {
  connect(endpoint: string): Connection;
  authenticate(credentials: Credentials): boolean;
  sync(data: Dataset): SyncResult;
  getIntegrationCapabilities(): IntegrationCapabilities;
}
```

#### 4. Utility Plugins

**Purpose**: Provide cross-cutting concerns and optimizations
**Examples**:

- Validation Engines (input validation and quality checks)
- Memory Optimizers (performance enhancement utilities)
- Security Managers (access control and data protection)
- Performance Monitors (system health and metrics)

**Interface**: `IUtilityPlugin`

```typescript
interface IUtilityPlugin extends IPlugin {
  configure(settings: Settings): void;
  monitor(metrics: Metrics): void;
  log(level: LogLevel, message: string): void;
  getUtilityFeatures(): UtilityFeature[];
}
```

### Core Plugin Interface

All plugins must implement the foundational interface:

```typescript
interface IPlugin {
  getName(): string;
  getVersion(): string;
  getDescription(): string;
  getDependencies(): string[];
  initialize(config: Config): Promise<void>;
  execute(context: Context, data: Data): Promise<Result>;
  cleanup(): Promise<void>;
  getManifest(): PluginManifest;
}
```

## Plugin Development Context

### Technology Stack

- **TypeScript**: Primary development language with full type safety
- **WebAssembly**: For performance-critical operations
- **DuckDB-WASM**: Database operations and query processing
- **React**: UI components and visualization
- **D3.js**: Data visualization and interactive charts
- **TensorFlow.js/ONNX.js**: Machine learning model integration

### Development Workflow

1. **Context Setup**: Reference this document and DataPrism Core architecture
2. **PRP Generation**: Use `/generate-prp` with plugin-specific requirements
3. **Implementation**: Follow generated PRP with AI assistance
4. **Testing**: Comprehensive unit, integration, and performance testing
5. **Documentation**: Complete API documentation and examples

### Communication Mechanisms

#### Event Bus System

```typescript
interface EventBus {
  publish(event: string, data: any): void;
  subscribe(event: string, handler: EventHandler): void;
  unsubscribe(event: string, handler: EventHandler): void;
}
```

#### Shared Memory Management

```typescript
interface SharedMemory {
  allocate(size: number): ArrayBuffer;
  deallocate(buffer: ArrayBuffer): void;
  getTypedArray<T>(buffer: ArrayBuffer): T;
}
```

#### Service Registry

```typescript
interface ServiceRegistry {
  register(name: string, service: PluginService): void;
  unregister(name: string): void;
  resolve<T>(name: string): T | null;
}
```

## Security and Performance Guidelines

### Security Requirements

- **Sandboxing**: All plugins run in isolated environments
- **Validation**: Input validation and sanitization required
- **Permissions**: Capability-based access control
- **Resource Limits**: CPU and memory quotas enforced

### Performance Optimization

- **Lazy Loading**: Load plugins only when needed
- **Memory Pools**: Efficient allocation for frequent operations
- **Caching**: Intelligent caching for computed results
- **Background Processing**: Use Web Workers for heavy computations

## PRP Generation Template

When generating PRPs for DataPrism plugins, use this structured template:

### 1. Plugin Overview

- **Plugin Name**: Descriptive name following naming conventions
- **Category**: One of the four plugin categories
- **Purpose**: Clear description of plugin functionality
- **Target Use Cases**: Specific scenarios where plugin adds value

### 2. Architecture Integration

- **Interface Implementation**: Which plugin interface to implement
- **Dependencies**: Required DataPrism Core APIs and external libraries
- **Data Flow**: How data moves through the plugin
- **Performance Impact**: Expected resource usage and optimization strategies

### 3. Functional Requirements

- **Core Features**: Essential plugin functionality
- **Configuration**: Required settings and parameters
- **Error Handling**: Comprehensive error management strategy
- **Validation**: Input/output validation requirements

### 4. Technical Specifications

- **API Design**: Detailed interface implementation
- **Data Structures**: Internal data organization
- **Algorithms**: Core processing logic
- **Integration Points**: Connection with DataPrism Core systems

### 5. Development Implementation

- **File Structure**: Organization of plugin code
- **Build Configuration**: Webpack/bundling setup
- **Testing Strategy**: Unit, integration, and performance tests
- **Documentation**: API docs and usage examples

### 6. Performance Optimization

- **Memory Management**: Efficient resource utilization
- **Caching Strategy**: Intelligent caching implementation
- **Lazy Loading**: On-demand functionality loading
- **Background Processing**: Web Worker utilization

### 7. Quality Assurance

- **Testing Framework**: Comprehensive testing approach
- **Performance Benchmarks**: Expected performance metrics
- **Error Scenarios**: Edge case handling
- **Browser Compatibility**: Cross-browser testing requirements

## Example Plugin Ideas

### Data Processing Plugins

- **Hierarchical Classification Plugin**: UNSPSC/NAICS taxonomy classification
- **Semantic Clustering Plugin**: ML-powered data grouping and similarity
- **Data Quality Plugin**: Validation, deduplication, and consistency checking
- **Text Analytics Plugin**: NLP processing and entity extraction
- **Time Series Analysis Plugin**: Temporal data processing and forecasting

### Visualization Plugins

- **Advanced Chart Plugin**: Custom D3.js visualizations
- **Dashboard Builder Plugin**: Interactive dashboard creation
- **Report Generator Plugin**: Automated report generation
- **Taxonomy Navigator Plugin**: Hierarchical data navigation
- **Cluster Visualizer Plugin**: Interactive cluster visualization

### Integration Plugins

- **OpenAI Connector Plugin**: GPT model integration
- **Anthropic Claude Plugin**: Claude model integration
- **Custom LLM Plugin**: Local or custom model integration
- **API Gateway Plugin**: RESTful service connectivity
- **Export Engine Plugin**: Multi-format data export

### Utility Plugins

- **Performance Monitor Plugin**: System health and metrics
- **Security Manager Plugin**: Access control and data protection
- **Configuration Manager Plugin**: Settings and preferences
- **Backup Manager Plugin**: Data backup and recovery
- **Audit Logger Plugin**: Comprehensive operation logging

## Context Engineering Best Practices

### Effective PRP Generation

1. **Comprehensive Context**: Include all relevant architecture details
2. **Specific Requirements**: Clear, measurable objectives
3. **Implementation Guidance**: Step-by-step development approach
4. **Validation Criteria**: Concrete success metrics
5. **Integration Testing**: Seamless DataPrism Core integration

### Common Pitfalls to Avoid

- **Insufficient Context**: Missing plugin architecture details
- **Vague Requirements**: Unclear functionality specifications
- **Missing Performance Targets**: No measurable performance goals
- **Inadequate Testing**: Insufficient validation strategies
- **Poor Integration**: Misaligned with DataPrism Core architecture

### PRP Refinement Process

1. **Initial Generation**: Create comprehensive PRP from requirements
2. **Technical Review**: Validate against DataPrism Core architecture
3. **Performance Analysis**: Ensure performance targets are achievable
4. **Integration Assessment**: Verify seamless core integration
5. **Final Validation**: Confirm all requirements are addressed

## Usage Instructions

### For Plugin Developers

1. **Study this context**: Understand DataPrism Core architecture
2. **Define plugin requirements**: Clear functionality specifications
3. **Generate PRP**: Use `/generate-prp` with plugin-specific context
4. **Implement plugin**: Follow generated PRP systematically
5. **Test thoroughly**: Validate performance and integration

### For AI Assistants

1. **Load this context**: Reference all architectural guidelines
2. **Analyze requirements**: Understand plugin objectives
3. **Generate comprehensive PRP**: Include all necessary details
4. **Validate technical feasibility**: Ensure implementation viability
5. **Provide implementation guidance**: Step-by-step development approach

## Success Metrics

### Plugin Development Success

- **Implementation Time**: <2 weeks for standard plugins
- **Performance Targets**: Meet DataPrism Core performance requirements
- **Integration Quality**: Seamless core system integration
- **Test Coverage**: >90% code coverage with comprehensive tests
- **Documentation**: Complete API documentation and examples

### Plugin Quality Metrics

- **Functionality**: All specified features implemented correctly
- **Performance**: Meets or exceeds performance targets
- **Security**: Passes security validation and sandboxing tests
- **Compatibility**: Works across all supported browsers
- **Maintainability**: Clean, well-documented code structure

## Conclusion

This context engineering template provides the foundation for generating comprehensive PRPs for DataPrism Core plugins. By following these guidelines and using the structured template, developers can create high-quality, performant, and well-integrated plugins that extend the capabilities of the DataPrism Core analytics engine.

Remember: The success of plugin development depends on comprehensive context provision, clear requirements specification, and systematic implementation following established patterns and best practices.
