import { IPlugin, PluginManifest, PluginContext, PluginCapability } from '../interfaces/plugin.js';
import { PluginRegistry } from './plugin-registry.js';
import { PluginLoader } from './plugin-loader.js';
import { SecurityManager } from '../security/security-manager.js';
import { ResourceManager } from './resource-manager.js';
import { EventBus } from '../communication/event-bus.js';

export class PluginManager {
  private registry: PluginRegistry;
  private loader: PluginLoader;
  private security: SecurityManager;
  private resources: ResourceManager;
  private eventBus: EventBus;
  private activePlugins: Map<string, IPlugin>;
  private pluginContexts: Map<string, PluginContext>;
  private initialized = false;

  constructor() {
    this.registry = new PluginRegistry();
    this.loader = new PluginLoader();
    this.security = new SecurityManager();
    this.resources = new ResourceManager();
    this.eventBus = new EventBus();
    this.activePlugins = new Map();
    this.pluginContexts = new Map();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.eventBus.initialize();
      await this.security.initialize();
      await this.resources.initialize();
      
      this.initialized = true;
      
      // Load core plugin definitions
      await this.loadCorePluginDefinitions();
      
      // Auto-discover plugins (skip in test environment)
      if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
        try {
          await this.discoverPlugins();
        } catch (error) {
          console.warn('Plugin discovery failed (this is normal in test environments):', String(error));
        }
      }

      this.eventBus.publish('plugin-manager:initialized', { timestamp: Date.now() });
    } catch (error) {
      throw new Error(`Failed to initialize PluginManager: ${error}`);
    }
  }

  async registerPlugin(manifest: PluginManifest): Promise<void> {
    if (!this.initialized) {
      throw new Error('PluginManager not initialized');
    }

    // Validate manifest
    const validation = this.registry.validateManifest(manifest);
    if (!validation.isValid) {
      throw new Error(`Invalid plugin manifest: ${validation.errors.join(', ')}`);
    }

    // Security validation
    await this.security.validatePlugin(manifest);

    // Version compatibility check
    if (!this.isCompatible(manifest)) {
      throw new Error(`Plugin ${manifest.name} is not compatible with this version`);
    }

    // Register in registry
    await this.registry.register(manifest);

    this.eventBus.publish('plugin:registered', { manifest });
  }

  async loadPlugin(pluginName: string): Promise<IPlugin> {
    if (!this.initialized) {
      throw new Error('PluginManager not initialized');
    }

    const manifest = this.registry.getManifest(pluginName);
    if (!manifest) {
      throw new Error(`Plugin not found: ${pluginName}`);
    }

    // Check if already loaded
    if (this.activePlugins.has(pluginName)) {
      return this.activePlugins.get(pluginName)!;
    }

    try {
      // Load plugin dependencies first
      await this.loadDependencies(manifest);

      // Load plugin code
      const plugin = await this.loader.load(manifest);

      // Create plugin context
      const context = await this.createPluginContext(manifest);
      this.pluginContexts.set(pluginName, context);

      // Initialize plugin
      await plugin.initialize(context);

      // Register in active plugins
      this.activePlugins.set(pluginName, plugin);

      this.eventBus.publish('plugin:loaded', { pluginName, manifest });
      
      return plugin;
    } catch (error) {
      this.eventBus.publish('plugin:load-failed', { pluginName, error: String(error) });
      throw error;
    }
  }

  async activatePlugin(pluginName: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('PluginManager not initialized');
    }

    const plugin = await this.loadPlugin(pluginName);
    
    try {
      // Allocate resources
      await this.resources.allocate(pluginName);
      
      // Create security sandbox
      await this.security.createSandbox(pluginName);
      
      // Activate plugin
      await plugin.activate();
      
      this.eventBus.publish('plugin:activated', { pluginName });
    } catch (error) {
      this.eventBus.publish('plugin:activation-failed', { pluginName, error: String(error) });
      throw error;
    }
  }

  async deactivatePlugin(pluginName: string): Promise<void> {
    const plugin = this.activePlugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin not active: ${pluginName}`);
    }

    try {
      // Deactivate plugin
      await plugin.deactivate();
      
      // Release resources
      await this.resources.release(pluginName);
      
      // Destroy sandbox
      await this.security.destroySandbox(pluginName);
      
      this.eventBus.publish('plugin:deactivated', { pluginName });
    } catch (error) {
      this.eventBus.publish('plugin:deactivation-failed', { pluginName, error: String(error) });
      throw error;
    }
  }

  async unloadPlugin(pluginName: string): Promise<void> {
    const plugin = this.activePlugins.get(pluginName);
    if (plugin) {
      // Deactivate first if active
      try {
        await this.deactivatePlugin(pluginName);
      } catch (error) {
        console.warn(`Failed to deactivate plugin ${pluginName} during unload:`, error);
      }

      // Cleanup plugin
      try {
        await plugin.cleanup();
      } catch (error) {
        console.warn(`Plugin cleanup failed for ${pluginName}:`, error);
      }

      this.activePlugins.delete(pluginName);
      this.pluginContexts.delete(pluginName);
    }

    await this.loader.unload(pluginName);
    
    this.eventBus.publish('plugin:unloaded', { pluginName });
  }

  async executePlugin(pluginName: string, operation: string, params: any): Promise<any> {
    const plugin = this.activePlugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin not active: ${pluginName}`);
    }

    // Check permissions
    await this.security.checkPermission(pluginName, operation, params);

    // Monitor resource usage
    const resourceMonitor = await this.resources.createMonitor(pluginName);

    try {
      const startTime = performance.now();
      const result = await plugin.execute(operation, params);
      const endTime = performance.now();

      this.eventBus.publish('plugin:operation-completed', {
        pluginName,
        operation,
        duration: endTime - startTime,
        success: true
      });

      return result;
    } catch (error) {
      this.eventBus.publish('plugin:operation-failed', {
        pluginName,
        operation,
        error: String(error)
      });
      throw error;
    } finally {
      await resourceMonitor.stop();
    }
  }

  async configurePlugin(pluginName: string, settings: any): Promise<void> {
    const plugin = this.activePlugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin not active: ${pluginName}`);
    }

    try {
      await plugin.configure(settings);
      this.eventBus.publish('plugin:configured', { pluginName, settings });
    } catch (error) {
      this.eventBus.publish('plugin:configuration-failed', { pluginName, error: String(error) });
      throw error;
    }
  }

  // Plugin Discovery and Management
  async discoverPlugins(): Promise<PluginManifest[]> {
    if (!this.initialized) {
      throw new Error('PluginManager not initialized');
    }

    try {
      // Discover from standard locations
      const discovered = await this.loader.discoverPlugins([
        './plugins/',
        '../plugins/',
        '/plugins/'
      ]);

      const manifests: PluginManifest[] = [];
      for (const path of discovered) {
        try {
          const manifest = await this.loader.loadManifest(path);
          await this.registerPlugin(manifest);
          manifests.push(manifest);
        } catch (error) {
          console.warn(`Failed to load plugin from ${path}:`, error);
        }
      }

      this.eventBus.publish('plugins:discovered', { count: manifests.length, manifests });
      return manifests;
    } catch (error) {
      this.eventBus.publish('plugins:discovery-failed', { error: String(error) });
      throw error;
    }
  }

  getActivePlugins(): string[] {
    return Array.from(this.activePlugins.keys());
  }

  getRegisteredPlugins(): string[] {
    return this.registry.getAllManifests().map(m => m.name);
  }

  getPluginInfo(pluginName: string): PluginInfo | null {
    const plugin = this.activePlugins.get(pluginName);
    const manifest = this.registry.getManifest(pluginName);
    
    if (!plugin || !manifest) {
      return null;
    }

    return {
      name: plugin.getName(),
      version: plugin.getVersion(),
      description: plugin.getDescription(),
      author: plugin.getAuthor(),
      category: manifest.category,
      capabilities: plugin.getCapabilities(),
      status: this.getPluginStatus(pluginName),
      resourceUsage: this.resources.getUsage(pluginName),
      dependencies: plugin.getDependencies(),
      permissions: manifest.permissions
    };
  }

  getPluginsByCategory(category: string): string[] {
    return this.registry.getPluginsByCategory(category);
  }

  searchPlugins(query: any): any[] {
    return this.registry.search(query);
  }

  async getSystemStatus(): Promise<PluginSystemStatus> {
    const securityReport = await this.security.generateSecurityReport();
    const resourceReport = await this.resources.generateReport();

    return {
      initialized: this.initialized,
      totalRegistered: this.registry.getAllManifests().length,
      totalActive: this.activePlugins.size,
      categorySummary: this.getCategorySummary(),
      resourceUsage: resourceReport.summary,
      securityStatus: {
        violations: securityReport.violations.length,
        suspiciousActivity: securityReport.suspiciousActivity.length,
        activeSandboxes: securityReport.summary.activeSandboxes
      },
      eventBusMetrics: this.eventBus.getMetrics()
    };
  }

  async hotReloadPlugin(pluginName: string): Promise<void> {
    if (!this.activePlugins.has(pluginName)) {
      throw new Error(`Plugin not active: ${pluginName}`);
    }

    const manifest = this.registry.getManifest(pluginName);
    if (!manifest) {
      throw new Error(`Plugin manifest not found: ${pluginName}`);
    }

    try {
      // Save current state if supported
      const plugin = this.activePlugins.get(pluginName)!;
      let savedState: any = null;
      
      if (typeof (plugin as any).saveState === 'function') {
        savedState = await (plugin as any).saveState();
      }

      // Unload current plugin
      await this.unloadPlugin(pluginName);

      // Reload plugin
      const newPlugin = await this.loadPlugin(pluginName);
      await this.activatePlugin(pluginName);

      // Restore state if available
      if (savedState && typeof (newPlugin as any).restoreState === 'function') {
        await (newPlugin as any).restoreState(savedState);
      }

      this.eventBus.publish('plugin:hot-reloaded', { pluginName });
    } catch (error) {
      this.eventBus.publish('plugin:hot-reload-failed', { pluginName, error: String(error) });
      throw error;
    }
  }

  private async loadCorePluginDefinitions(): Promise<void> {
    // Define core system plugins that should be available
    const corePlugins = [
      {
        name: 'performance-monitor',
        version: '1.0.0',
        description: 'System performance monitoring plugin',
        author: 'DataPrism Team',
        license: 'MIT',
        keywords: ['monitoring', 'performance', 'system'],
        category: 'utility' as const,
        entryPoint: './core-plugins/performance-monitor.js',
        dependencies: [],
        permissions: [
          { resource: 'core', access: 'read' as const }
        ],
        configuration: {},
        compatibility: {
          minCoreVersion: '0.1.0',
          browsers: ['chrome', 'firefox', 'safari', 'edge']
        }
      }
    ];

    for (const plugin of corePlugins) {
      try {
        await this.registerPlugin(plugin);
      } catch (error) {
        console.warn(`Failed to register core plugin ${plugin.name}:`, error);
      }
    }
  }

  private async loadDependencies(manifest: PluginManifest): Promise<void> {
    for (const dep of manifest.dependencies) {
      if (!dep.optional && !this.activePlugins.has(dep.name)) {
        await this.loadPlugin(dep.name);
        await this.activatePlugin(dep.name);
      }
    }
  }

  private async createPluginContext(manifest: PluginManifest): Promise<PluginContext> {
    const resourceQuota = this.resources.getQuota(manifest.name);
    return {
      pluginName: manifest.name,
      coreVersion: '0.1.0', // TODO: Get from DataPrism Core
      services: await this.createServiceProxy(manifest),
      eventBus: this.eventBus,
      logger: this.createPluginLogger(manifest.name),
      config: await this.loadPluginConfig(manifest.name),
      resources: {
        maxMemoryMB: resourceQuota.memoryMB,
        maxCpuPercent: resourceQuota.cpuPercent,
        maxExecutionTime: resourceQuota.maxExecutionTimeMs
      }
    };
  }

  private async createServiceProxy(manifest: PluginManifest): Promise<any> {
    // Create a service proxy that enforces permissions
    return {
      call: async (serviceName: string, method: string, ...args: any[]) => {
        const operation = `${serviceName}.${method}`;
        await this.security.checkPermission(manifest.name, operation, args);
        
        // TODO: Implement actual service calls to DataPrism Core
        return { success: true, result: null };
      },
      hasPermission: (serviceName: string, method: string) => {
        const requiredPermission = { resource: serviceName, access: 'read' as const };
        const permissions = manifest.permissions;
        return permissions.some(perm => 
          perm.resource === requiredPermission.resource &&
          (perm.access === requiredPermission.access || perm.access === 'execute')
        );
      }
    };
  }

  private createPluginLogger(pluginName: string): any {
    return {
      debug: (message: string, ...args: any[]) => console.debug(`[${pluginName}]`, message, ...args),
      info: (message: string, ...args: any[]) => console.info(`[${pluginName}]`, message, ...args),
      warn: (message: string, ...args: any[]) => console.warn(`[${pluginName}]`, message, ...args),
      error: (message: string, ...args: any[]) => console.error(`[${pluginName}]`, message, ...args)
    };
  }

  private async loadPluginConfig(pluginName: string): Promise<any> {
    // TODO: Implement configuration loading from storage
    return {};
  }

  private isCompatible(manifest: PluginManifest): boolean {
    // Check core version compatibility
    const coreVersion = '0.1.0'; // TODO: Get from DataPrism Core
    
    // Simple semver compatibility check
    const minVersion = manifest.compatibility.minCoreVersion;
    const maxVersion = manifest.compatibility.maxCoreVersion;
    
    // TODO: Implement proper semver comparison
    return true; // Simplified for now
  }

  private getPluginStatus(pluginName: string): PluginStatus {
    if (this.activePlugins.has(pluginName)) {
      return 'active';
    } else if (this.registry.getManifest(pluginName)) {
      return 'inactive';
    } else {
      return 'unknown';
    }
  }

  private getCategorySummary(): Record<string, number> {
    const summary: Record<string, number> = {};
    
    for (const manifest of this.registry.getAllManifests()) {
      summary[manifest.category] = (summary[manifest.category] || 0) + 1;
    }

    return summary;
  }

  async destroy(): Promise<void> {
    // Unload all active plugins
    const activePluginNames = Array.from(this.activePlugins.keys());
    for (const pluginName of activePluginNames) {
      try {
        await this.unloadPlugin(pluginName);
      } catch (error) {
        console.warn(`Failed to unload plugin ${pluginName} during shutdown:`, error);
      }
    }

    // Cleanup managers
    this.eventBus.destroy();
    await this.resources.destroy();

    this.initialized = false;
  }
}

export interface PluginInfo {
  name: string;
  version: string;
  description: string;
  author: string;
  category: string;
  capabilities: PluginCapability[];
  status: PluginStatus;
  resourceUsage: any;
  dependencies: any[];
  permissions: any[];
}

export type PluginStatus = 'active' | 'inactive' | 'error' | 'unknown';

export interface PluginSystemStatus {
  initialized: boolean;
  totalRegistered: number;
  totalActive: number;
  categorySummary: Record<string, number>;
  resourceUsage: any;
  securityStatus: {
    violations: number;
    suspiciousActivity: number;
    activeSandboxes: number;
  };
  eventBusMetrics: any;
}