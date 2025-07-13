// Type definitions for @dataprism/plugins
declare module '@dataprism/plugins' {
  export interface PluginDependency {
    name: string;
    version: string;
    optional: boolean;
  }

  export interface PluginPermission {
    resource: string;
    access: 'read' | 'write' | 'execute';
    scope?: string;
  }

  export interface ValidationRule {
    type: 'min' | 'max' | 'pattern' | 'enum' | 'custom';
    value: any;
    message?: string;
  }

  export interface PluginConfigSchema {
    [key: string]: {
      type: 'string' | 'number' | 'boolean' | 'object' | 'array';
      required?: boolean;
      default?: any;
      description?: string;
      validation?: ValidationRule[];
    };
  }

  export interface PluginManifest {
    name: string;
    version: string;
    description: string;
    author: string;
    license: string;
    homepage?: string;
    repository?: string;
    keywords: string[];
    category: PluginCategory;
    entryPoint: string;
    dependencies: PluginDependency[];
    permissions: PluginPermission[];
    configuration: PluginConfigSchema;
    compatibility: {
      minCoreVersion: string;
      maxCoreVersion?: string;
      browsers: string[];
    };
  }

  export type PluginCategory = 'data-processing' | 'visualization' | 'integration' | 'utility';

  export interface PluginCapability {
    name: string;
    description: string;
    type: 'processing' | 'visualization' | 'integration' | 'utility';
    version: string;
    async: boolean;
    inputTypes?: string[];
    outputTypes?: string[];
  }

  export interface ResourceQuota {
    maxMemoryMB: number;
    maxCpuPercent: number;
    maxExecutionTime: number;
    maxNetworkRequests?: number;
  }

  export interface PluginLogger {
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
  }

  export interface ServiceProxy {
    call(serviceName: string, method: string, ...args: any[]): Promise<any>;
    hasPermission(serviceName: string, method: string): boolean;
  }

  export interface EventHandler<T = any> {
    (data: T): void | Promise<void>;
  }

  export interface EventSubscription {
    unsubscribe(): void;
  }

  export interface EventBus {
    publish<T>(event: string, data: T): void;
    subscribe<T>(event: string, handler: EventHandler<T>): EventSubscription;
    unsubscribe(event: string, handler: EventHandler): void;
    once<T>(event: string, handler: EventHandler<T>): EventSubscription;
  }

  export interface PluginConfig {
    [key: string]: any;
  }

  export interface PluginContext {
    pluginName: string;
    coreVersion: string;
    services: ServiceProxy;
    eventBus: EventBus;
    logger: PluginLogger;
    config: PluginConfig;
    resources: ResourceQuota;
  }

  export interface PluginSettings {
    [key: string]: any;
  }

  // Base plugin interface
  export interface IPlugin {
    getName(): string;
    getVersion(): string;
    getDescription(): string;
    getAuthor(): string;
    getDependencies(): PluginDependency[];
    initialize(context: PluginContext): Promise<void>;
    activate(): Promise<void>;
    deactivate(): Promise<void>;
    cleanup(): Promise<void>;
    execute(operation: string, params: any): Promise<any>;
    configure(settings: PluginSettings): Promise<void>;
    getManifest(): PluginManifest;
    getCapabilities(): PluginCapability[];
    isCompatible(coreVersion: string): boolean;
  }

  // Data types
  export type DataType = 'string' | 'number' | 'integer' | 'boolean' | 'date' | 'object';

  export interface Column {
    name: string;
    type: DataType;
  }

  export interface Dataset {
    columns: Column[];
    rows: any[][];
  }

  // Visualization interfaces
  export interface Dimensions {
    width: number;
    height: number;
  }

  export interface InteractionEvent {
    type: InteractionEventType;
    target: any;
    data: any;
    position?: { x: number; y: number };
    modifiers?: {
      shift: boolean;
      ctrl: boolean;
      alt: boolean;
      meta: boolean;
    };
  }

  export type InteractionEventType = 
    | 'click' 
    | 'hover' 
    | 'select' 
    | 'zoom' 
    | 'pan' 
    | 'brush'
    | 'filter'
    | 'sort';

  export interface InteractionFeature {
    name: string;
    description: string;
    events: InteractionEventType[];
    configurable: boolean;
  }

  export interface FieldRequirement {
    name: string;
    types: DataType[];
    multiple: boolean;
    description: string;
  }

  export interface VisualizationType {
    name: string;
    description: string;
    category: 'chart' | 'table' | 'map' | 'network' | 'tree' | 'custom';
    requiredFields: FieldRequirement[];
    optionalFields: FieldRequirement[];
    preview?: string;
    complexity: 'simple' | 'moderate' | 'complex';
  }

  export interface AccessibilityConfig {
    enabled: boolean;
    highContrast: boolean;
    largeText: boolean;
    screenReader: boolean;
    keyboardNavigation: boolean;
  }

  export interface PerformanceConfig {
    lazyLoading: boolean;
    virtualization: boolean;
    debounceMs: number;
    maxDataPoints: number;
  }

  export interface RenderConfig {
    theme: 'light' | 'dark' | 'auto';
    responsive: boolean;
    animation: boolean;
    interaction: boolean;
    customStyles?: Record<string, any>;
    accessibility?: AccessibilityConfig;
    performance?: PerformanceConfig;
  }

  export interface LayoutConfig {
    margin: { top: number; right: number; bottom: number; left: number };
    padding: { top: number; right: number; bottom: number; left: number };
    orientation: 'horizontal' | 'vertical';
    alignment: 'start' | 'center' | 'end';
  }

  export interface FontConfig {
    family: string;
    size: number;
    weight: 'normal' | 'bold' | 'lighter' | 'bolder';
    style: 'normal' | 'italic';
  }

  export interface BorderConfig {
    width: number;
    style: 'solid' | 'dashed' | 'dotted';
    color: string;
    radius: number;
  }

  export interface StylingConfig {
    colors: string[];
    colorScheme: 'categorical' | 'sequential' | 'diverging';
    fonts: FontConfig;
    borders: BorderConfig;
    shadows: boolean;
  }

  export interface BehaviorConfig {
    interactive: boolean;
    zoomable: boolean;
    pannable: boolean;
    selectable: boolean;
    hoverable: boolean;
    clickable: boolean;
  }

  export interface FilterConfig {
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
    value: any;
    active: boolean;
  }

  export interface DataConfig {
    aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'none';
    sorting: 'asc' | 'desc' | 'none';
    filtering: FilterConfig[];
    grouping: string[];
  }

  export interface VisualizationConfig {
    layout: LayoutConfig;
    styling: StylingConfig;
    behavior: BehaviorConfig;
    data: DataConfig;
    [key: string]: any;
  }

  export type ExportFormat = 'svg' | 'png' | 'jpeg' | 'pdf' | 'html' | 'json' | 'csv';

  // Specialized plugin interfaces
  export interface IVisualizationPlugin extends IPlugin {
    render(container: Element, data: Dataset, config?: RenderConfig): Promise<void>;
    update(data: Dataset): Promise<void>;
    resize(dimensions: Dimensions): Promise<void>;
    destroy(): Promise<void>;
    getVisualizationTypes(): VisualizationType[];
    getSupportedDataTypes(): DataType[];
    getInteractionFeatures(): InteractionFeature[];
    export(format: ExportFormat): Promise<Blob>;
    getConfiguration(): VisualizationConfig;
    setConfiguration(config: VisualizationConfig): Promise<void>;
    onInteraction(event: InteractionEvent): Promise<void>;
    getSelectionData(): any[];
    clearSelection(): Promise<void>;
  }

  export interface IIntegrationPlugin extends IPlugin {
    // Integration-specific methods would be defined here
  }

  export interface IDataProcessorPlugin extends IPlugin {
    // Data processing-specific methods would be defined here
  }

  export interface IUtilityPlugin extends IPlugin {
    // Utility-specific methods would be defined here
  }
}