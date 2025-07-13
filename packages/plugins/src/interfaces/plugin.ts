export interface IPlugin {
  // Plugin Identity
  getName(): string;
  getVersion(): string;
  getDescription(): string;
  getAuthor(): string;
  getDependencies(): PluginDependency[];
  
  // Lifecycle Management
  initialize(context: PluginContext): Promise<void>;
  activate(): Promise<void>;
  deactivate(): Promise<void>;
  cleanup(): Promise<void>;
  
  // Core Operations
  execute(operation: string, params: any): Promise<any>;
  configure(settings: PluginSettings): Promise<void>;
  
  // Metadata and Capabilities
  getManifest(): PluginManifest;
  getCapabilities(): PluginCapability[];
  isCompatible(coreVersion: string): boolean;
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

export interface PluginConfigSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required?: boolean;
    default?: any;
    description?: string;
    validation?: ValidationRule[];
  };
}

export interface PluginCapability {
  name: string;
  description: string;
  type: 'processing' | 'visualization' | 'integration' | 'utility';
  version: string;
  async: boolean;
  inputTypes?: string[];
  outputTypes?: string[];
}

export interface ValidationRule {
  type: 'min' | 'max' | 'pattern' | 'enum' | 'custom';
  value: any;
  message?: string;
}

export interface PluginConfig {
  [key: string]: any;
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

export interface EventBus {
  publish<T>(event: string, data: T): void;
  subscribe<T>(event: string, handler: EventHandler<T>): EventSubscription;
  unsubscribe(event: string, handler: EventHandler): void;
  once<T>(event: string, handler: EventHandler<T>): EventSubscription;
}

export interface EventHandler<T = any> {
  (data: T): void | Promise<void>;
}

export interface EventSubscription {
  unsubscribe(): void;
}