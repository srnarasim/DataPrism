// Main plugin system exports
export { PluginManager } from "./manager/plugin-manager.js";
import { PluginManager } from "./manager/plugin-manager.js";
import { PluginRegistry } from "./manager/plugin-registry.js";
import {
  IPlugin,
  PluginManifest,
  PluginContext,
  PluginCapability,
} from "./interfaces/plugin.js";
import type { ValidationResult } from "./manager/plugin-registry.js";
export { PluginRegistry } from "./manager/plugin-registry.js";
export { PluginLoader, PluginLoadError } from "./manager/plugin-loader.js";
export {
  ResourceManager,
  ResourceMonitor,
  ResourceError,
} from "./manager/resource-manager.js";

// Security system exports
export {
  SecurityManager,
  PluginSandbox,
  SecurityError,
  AuditLogger,
  SecurityPolicySet,
} from "./security/security-manager.js";

// Communication system exports
export { EventBus, EventBusFactory } from "./communication/event-bus.js";

// Interface exports
export * from "./interfaces/index.js";

// Type exports for convenience
export type {
  // Plugin Manager types
  PluginInfo,
  PluginStatus,
  PluginSystemStatus,
} from "./manager/plugin-manager.js";

export type {
  // Plugin Registry types
  PluginSearchQuery,
  PluginSearchResult,
  PluginRegistryStatistics,
  ValidationResult,
} from "./manager/plugin-registry.js";

export type {
  // Plugin Loader types
  PluginValidationResult,
  PluginModuleInfo,
  ModuleType,
} from "./manager/plugin-loader.js";

export type {
  // Resource Manager types
  ResourceQuota,
  ResourceUsage,
  ResourceAllocation,
  ResourceViolation,
  ResourceReport,
  ResourceSummary,
  GlobalResourceLimits,
  GlobalResourceUsage,
  OptimizationResult,
  QuotaEnforcementResult,
} from "./manager/resource-manager.js";

export type {
  // Security types
  SandboxConfig,
  SecurityReport,
  SuspiciousActivity,
  SecurityPolicy,
  AuditEvent,
  EventFilter,
} from "./security/security-manager.js";

export type {
  // Event Bus types
  EventHandler,
  EventSubscription,
  EventHistoryEntry,
  EventBusMetrics,
} from "./communication/event-bus.js";

// Plugin System Factory
export class DataPrismPluginSystem {
  private static instance: PluginManager | null = null;

  static async create(config?: PluginSystemConfig): Promise<PluginManager> {
    if (this.instance) {
      return this.instance;
    }

    const manager = new PluginManager();

    // Apply configuration if provided
    if (config) {
      this.applyConfiguration(manager, config);
    }

    await manager.initialize();
    this.instance = manager;

    return manager;
  }

  static getInstance(): PluginManager | null {
    return this.instance;
  }

  static async destroy(): Promise<void> {
    if (this.instance) {
      await this.instance.destroy();
      this.instance = null;
    }
  }

  private static applyConfiguration(
    manager: PluginManager,
    config: PluginSystemConfig,
  ): void {
    // Apply configuration to manager
    // In production, this would configure various aspects of the plugin system
    console.debug("Plugin system configuration applied:", config);
  }
}

export interface PluginSystemConfig {
  maxPlugins?: number;
  securityLevel?: "strict" | "moderate" | "permissive";
  resourceLimits?: {
    globalMemoryMB?: number;
    globalCPUPercent?: number;
  };
  discoveryPaths?: string[];
  enableHotReload?: boolean;
  auditLogging?: boolean;
}

// Utility functions for plugin development
export const PluginUtils = {
  /**
   * Validates a plugin manifest against the schema
   */
  validateManifest: async (manifest: any): Promise<ValidationResult> => {
    const registry = new PluginRegistry();
    return registry.validateManifest(manifest);
  },

  /**
   * Creates a basic plugin manifest template
   */
  createManifestTemplate: (pluginName: string, category: string): any => {
    return {
      name: pluginName,
      version: "1.0.0",
      description: `${pluginName} plugin for DataPrism`,
      author: "Plugin Developer",
      license: "MIT",
      keywords: [category, "dataprism"],
      category,
      entryPoint: "./index.js",
      dependencies: [],
      permissions: [{ resource: "data", access: "read" }],
      configuration: {},
      compatibility: {
        minCoreVersion: "0.1.0",
        browsers: ["chrome", "firefox", "safari", "edge"],
      },
    };
  },

  /**
   * Generates a unique plugin ID
   */
  generatePluginId: (): string => {
    return `plugin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Checks if a version string is valid
   */
  isValidVersion: (version: string): boolean => {
    return /^\d+\.\d+\.\d+(-[\w\d\-]+)?(\+[\w\d\-]+)?$/.test(version);
  },
};

// Plugin development helpers
export abstract class BasePlugin implements IPlugin {
  protected manifest: PluginManifest;
  protected context: PluginContext | null = null;
  protected initialized = false;
  protected active = false;

  constructor(manifest: PluginManifest) {
    this.manifest = manifest;
  }

  getName(): string {
    return this.manifest.name;
  }

  getVersion(): string {
    return this.manifest.version;
  }

  getDescription(): string {
    return this.manifest.description;
  }

  getAuthor(): string {
    return this.manifest.author;
  }

  getDependencies(): any[] {
    return this.manifest.dependencies;
  }

  getManifest(): PluginManifest {
    return this.manifest;
  }

  isCompatible(coreVersion: string): boolean {
    // Simple compatibility check - in production, implement proper semver checking
    return true;
  }

  abstract getCapabilities(): PluginCapability[];

  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    this.initialized = true;
    await this.onInitialize(context);
  }

  async activate(): Promise<void> {
    if (!this.initialized) {
      throw new Error("Plugin must be initialized before activation");
    }
    this.active = true;
    await this.onActivate();
  }

  async deactivate(): Promise<void> {
    this.active = false;
    await this.onDeactivate();
  }

  async cleanup(): Promise<void> {
    await this.onCleanup();
    this.context = null;
    this.initialized = false;
    this.active = false;
  }

  abstract execute(operation: string, params: any): Promise<any>;

  async configure(settings: any): Promise<void> {
    await this.onConfigure(settings);
  }

  // Hook methods for subclasses to override
  protected async onInitialize(context: PluginContext): Promise<void> {
    // Override in subclass
  }

  protected async onActivate(): Promise<void> {
    // Override in subclass
  }

  protected async onDeactivate(): Promise<void> {
    // Override in subclass
  }

  protected async onCleanup(): Promise<void> {
    // Override in subclass
  }

  protected async onConfigure(settings: any): Promise<void> {
    // Override in subclass
  }

  // Utility methods for plugin implementations
  protected log(
    level: "debug" | "info" | "warn" | "error",
    message: string,
    ...args: any[]
  ): void {
    if (this.context?.logger) {
      this.context.logger[level](message, ...args);
    } else {
      console[level](`[${this.getName()}]`, message, ...args);
    }
  }

  protected emit(event: string, data: any): void {
    if (this.context?.eventBus) {
      this.context.eventBus.publish(`plugin:${this.getName()}:${event}`, data);
    }
  }

  protected async callService(
    serviceName: string,
    method: string,
    ...args: any[]
  ): Promise<any> {
    if (!this.context?.services) {
      throw new Error("Plugin context services not available");
    }
    return this.context.services.call(serviceName, method, ...args);
  }
}

// Version information
export const VERSION = "1.0.0";
export const BUILD_TIME = new Date().toISOString();

// Plugin system metadata
export const PLUGIN_SYSTEM_INFO = {
  name: "DataPrism Plugin System",
  version: VERSION,
  buildTime: BUILD_TIME,
  supportedCategories: [
    "data-processing",
    "visualization",
    "integration",
    "utility",
  ],
  capabilities: [
    "Dynamic plugin loading",
    "Security sandboxing",
    "Resource management",
    "Event-driven communication",
    "Hot reload support",
    "Dependency resolution",
    "Audit logging",
  ],
};
