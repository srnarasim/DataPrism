/**
 * CDN Plugin Loader
 * Dynamic plugin loading system for CDN-deployed DataPrism instances
 */

export interface PluginManifest {
  plugins: Array<{
    id: string;
    name: string;
    version: string;
    entry: string;           // CDN URL or relative path
    dependencies: string[];
    metadata: PluginMetadata;
    integrity: string;
    category: string;
    exports: string[];
  }>;
  categories: PluginCategory[];
  compatibility: BrowserCompatibility;
  baseUrl: string;
  version: string;
  timestamp: string;
}

export interface PluginMetadata {
  description: string;
  author: string;
  license: string;
  homepage?: string;
  repository?: string;
  keywords: string[];
  size: number;
  loadOrder: number;
  lazy: boolean;
}

export interface PluginCategory {
  id: string;
  name: string;
  description: string;
  plugins: string[];
}

export interface BrowserCompatibility {
  chrome: string;
  firefox: string;
  safari: string;
  edge: string;
  webAssembly: boolean;
  es2020: boolean;
}

export interface LoadedPlugin {
  id: string;
  instance: any;
  metadata: PluginMetadata;
  loadTime: number;
  status: 'loading' | 'loaded' | 'error';
  error?: string;
}

export interface PluginLoadOptions {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  integrity?: boolean;
  fallback?: boolean;
}

export class CDNPluginLoader {
  private plugins = new Map<string, LoadedPlugin>();
  private manifest: PluginManifest | null = null;
  private options: Required<PluginLoadOptions>;
  private cache = new Map<string, Promise<any>>();

  constructor(options: PluginLoadOptions = {}) {
    this.options = {
      baseUrl: '',
      timeout: 30000,
      retries: 3,
      cache: true,
      integrity: true,
      fallback: true,
      ...options,
    };
  }

  /**
   * Initialize the plugin loader with a manifest
   */
  async initialize(manifestUrl?: string): Promise<void> {
    try {
      const url = manifestUrl || `${this.options.baseUrl}/plugins/manifest.json`;
      console.log(`🔌 Loading plugin manifest from: ${url}`);
      
      this.manifest = await this.fetchManifest(url);
      console.log(`✅ Loaded manifest with ${this.manifest.plugins.length} plugins`);
      
      // Validate browser compatibility
      this.validateBrowserCompatibility();
      
      // Pre-load critical plugins
      await this.preloadCriticalPlugins();
      
    } catch (error) {
      console.error('❌ Failed to initialize plugin loader:', error);
      throw new Error(`Plugin loader initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Load a specific plugin by ID
   */
  async loadPlugin(pluginId: string, options: Partial<PluginLoadOptions> = {}): Promise<LoadedPlugin> {
    if (!this.manifest) {
      throw new Error('Plugin loader not initialized - call initialize() first');
    }

    // Check if plugin is already loaded
    const existing = this.plugins.get(pluginId);
    if (existing && existing.status === 'loaded') {
      return existing;
    }

    const pluginInfo = this.manifest.plugins.find(p => p.id === pluginId);
    if (!pluginInfo) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }

    console.log(`🔌 Loading plugin: ${pluginInfo.name} (${pluginId})`);
    const startTime = Date.now();

    const loadedPlugin: LoadedPlugin = {
      id: pluginId,
      instance: null,
      metadata: pluginInfo.metadata,
      loadTime: 0,
      status: 'loading',
    };

    this.plugins.set(pluginId, loadedPlugin);

    try {
      // Load plugin dependencies first
      await this.loadDependencies(pluginInfo.dependencies);

      // Load the plugin module
      const pluginModule = await this.loadPluginModule(pluginInfo, options);
      
      // Instantiate the plugin
      const instance = this.instantiatePlugin(pluginModule, pluginInfo);
      
      loadedPlugin.instance = instance;
      loadedPlugin.status = 'loaded';
      loadedPlugin.loadTime = Date.now() - startTime;

      console.log(`✅ Plugin loaded: ${pluginInfo.name} (${loadedPlugin.loadTime}ms)`);
      
      // Trigger plugin loaded event
      this.dispatchPluginEvent('plugin-loaded', { plugin: loadedPlugin });
      
      return loadedPlugin;

    } catch (error) {
      loadedPlugin.status = 'error';
      loadedPlugin.error = error instanceof Error ? error.message : String(error);
      
      console.error(`❌ Failed to load plugin ${pluginId}:`, error);
      
      // Trigger plugin error event
      this.dispatchPluginEvent('plugin-error', { plugin: loadedPlugin, error });
      
      throw error;
    }
  }

  /**
   * Load multiple plugins
   */
  async loadPlugins(pluginIds: string[]): Promise<LoadedPlugin[]> {
    const results = await Promise.allSettled(
      pluginIds.map(id => this.loadPlugin(id))
    );

    const loaded: LoadedPlugin[] = [];
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        loaded.push(result.value);
      } else {
        errors.push(`${pluginIds[index]}: ${result.reason.message}`);
      }
    });

    if (errors.length > 0) {
      console.warn(`⚠️  Some plugins failed to load: ${errors.join(', ')}`);
    }

    return loaded;
  }

  /**
   * Load plugins by category
   */
  async loadPluginsByCategory(categoryId: string): Promise<LoadedPlugin[]> {
    if (!this.manifest) {
      throw new Error('Plugin loader not initialized');
    }

    const category = this.manifest.categories.find(c => c.id === categoryId);
    if (!category) {
      throw new Error(`Plugin category not found: ${categoryId}`);
    }

    return this.loadPlugins(category.plugins);
  }

  /**
   * Get list of available plugins
   */
  getAvailablePlugins(): PluginManifest['plugins'] {
    return this.manifest?.plugins || [];
  }

  /**
   * Get list of loaded plugins
   */
  getLoadedPlugins(): LoadedPlugin[] {
    return Array.from(this.plugins.values()).filter(p => p.status === 'loaded');
  }

  /**
   * Get plugin by ID
   */
  getPlugin(pluginId: string): LoadedPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Unload a plugin
   */
  async unloadPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      return;
    }

    try {
      // Call plugin cleanup if available
      if (plugin.instance && typeof plugin.instance.cleanup === 'function') {
        await plugin.instance.cleanup();
      }

      this.plugins.delete(pluginId);
      
      // Trigger plugin unloaded event
      this.dispatchPluginEvent('plugin-unloaded', { pluginId });
      
      console.log(`🗑️  Plugin unloaded: ${pluginId}`);
    } catch (error) {
      console.error(`❌ Error unloading plugin ${pluginId}:`, error);
    }
  }

  /**
   * Check if plugin is loaded
   */
  isPluginLoaded(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId);
    return plugin?.status === 'loaded';
  }

  /**
   * Get plugin loading performance metrics
   */
  getPerformanceMetrics(): Record<string, number> {
    const metrics: Record<string, number> = {};
    
    this.plugins.forEach((plugin, id) => {
      if (plugin.status === 'loaded') {
        metrics[id] = plugin.loadTime;
      }
    });

    return metrics;
  }

  private async fetchManifest(url: string): Promise<PluginManifest> {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(this.options.timeout),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch plugin manifest: ${response.status}`);
    }

    const manifest = await response.json();
    
    // Validate manifest structure
    this.validateManifest(manifest);
    
    return manifest as PluginManifest;
  }

  private validateManifest(manifest: any): void {
    if (!manifest.plugins || !Array.isArray(manifest.plugins)) {
      throw new Error('Invalid plugin manifest: missing plugins array');
    }

    if (!manifest.baseUrl) {
      throw new Error('Invalid plugin manifest: missing baseUrl');
    }

    // Validate each plugin entry
    manifest.plugins.forEach((plugin: any, index: number) => {
      if (!plugin.id || !plugin.name || !plugin.entry) {
        throw new Error(`Invalid plugin entry at index ${index}: missing required fields`);
      }
    });
  }

  private validateBrowserCompatibility(): void {
    if (!this.manifest?.compatibility) {
      console.warn('⚠️  No browser compatibility information in manifest');
      return;
    }

    const compat = this.manifest.compatibility;
    
    // Check WebAssembly support
    if (compat.webAssembly && typeof (globalThis as any).WebAssembly === 'undefined') {
      throw new Error('Plugins require WebAssembly support, but it is not available');
    }

    // Check ES2020 support (basic check)
    if (compat.es2020) {
      try {
        // Test for optional chaining and nullish coalescing
        eval('({}?.test ?? "test")');
      } catch (error) {
        console.warn('⚠️  ES2020 features may not be fully supported');
      }
    }

    console.log('✅ Browser compatibility validated');
  }

  private async preloadCriticalPlugins(): Promise<void> {
    if (!this.manifest) return;

    // Find plugins marked for preloading
    const criticalPlugins = this.manifest.plugins
      .filter(p => !p.metadata.lazy && p.metadata.loadOrder < 10)
      .sort((a, b) => a.metadata.loadOrder - b.metadata.loadOrder);

    if (criticalPlugins.length === 0) {
      return;
    }

    console.log(`🚀 Preloading ${criticalPlugins.length} critical plugins...`);
    
    // Load critical plugins in order
    for (const plugin of criticalPlugins) {
      try {
        await this.loadPlugin(plugin.id);
      } catch (error) {
        console.warn(`⚠️  Failed to preload critical plugin ${plugin.id}:`, error instanceof Error ? error.message : String(error));
      }
    }
  }

  private async loadDependencies(dependencies: string[]): Promise<void> {
    if (dependencies.length === 0) return;

    const loadPromises = dependencies.map(async (depId) => {
      if (!this.isPluginLoaded(depId)) {
        await this.loadPlugin(depId);
      }
    });

    await Promise.all(loadPromises);
  }

  private async loadPluginModule(pluginInfo: any, options: Partial<PluginLoadOptions> = {}): Promise<any> {
    const pluginUrl = this.resolvePluginUrl(pluginInfo.entry);
    
    // Check cache first
    if (this.options.cache && this.cache.has(pluginUrl)) {
      return this.cache.get(pluginUrl);
    }

    const loadPromise = this.withRetry(async () => {
      console.log(`📦 Fetching plugin module: ${pluginUrl}`);
      
      // Verify integrity if enabled
      if (this.options.integrity && pluginInfo.integrity) {
        await this.verifyIntegrity(pluginUrl, pluginInfo.integrity);
      }

      // Dynamic import of the plugin module
      const module = await import(/* @vite-ignore */ pluginUrl);
      return module;
    }, options.retries || this.options.retries);

    if (this.options.cache) {
      this.cache.set(pluginUrl, loadPromise);
    }

    return loadPromise;
  }

  private instantiatePlugin(module: any, pluginInfo: any): any {
    // Look for the plugin class or factory function
    const PluginClass = module.default || module[pluginInfo.name] || module.Plugin;
    
    if (!PluginClass) {
      throw new Error(`Plugin ${pluginInfo.id} does not export a valid plugin class or function`);
    }

    // Instantiate the plugin
    if (typeof PluginClass === 'function') {
      try {
        return new PluginClass(pluginInfo.metadata);
      } catch (error) {
        // Try calling as a factory function
        return PluginClass(pluginInfo.metadata);
      }
    } else if (typeof PluginClass === 'object') {
      return PluginClass;
    } else {
      throw new Error(`Plugin ${pluginInfo.id} export is not a valid plugin type`);
    }
  }

  private resolvePluginUrl(entry: string): string {
    if (entry.startsWith('http://') || entry.startsWith('https://')) {
      return entry;
    }
    
    return `${this.options.baseUrl}/${entry}`.replace(/\/+/g, '/').replace(':/', '://');
  }

  private async verifyIntegrity(url: string, expectedHash: string): Promise<void> {
    try {
      const response = await fetch(url);
      const content = await response.text();
      
      // Calculate hash (assuming SHA-384)
      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      const hashBuffer = await crypto.subtle.digest('SHA-384', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashBase64 = btoa(String.fromCharCode(...hashArray));
      
      if (`sha384-${hashBase64}` !== expectedHash) {
        throw new Error(`Integrity check failed for ${url}`);
      }
      
      console.log(`🔒 Integrity verified for ${url}`);
    } catch (error) {
      if (this.options.fallback) {
        console.warn(`⚠️  Integrity check failed for ${url}, proceeding anyway:`, error instanceof Error ? error.message : String(error));
      } else {
        throw error;
      }
    }
  }

  private async withRetry<T>(operation: () => Promise<T>, maxRetries: number): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`🔄 Retry attempt ${attempt}/${maxRetries} in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError!;
  }

  private dispatchPluginEvent(eventType: string, detail: any): void {
    if (typeof globalThis !== 'undefined' && 'window' in globalThis && (globalThis as any).window?.dispatchEvent) {
      const event = new CustomEvent(`dataprism:${eventType}`, { detail });
      (globalThis as any).window.dispatchEvent(event);
    }
  }
}

// Default instance for easy usage
export const pluginLoader = new CDNPluginLoader();

// Utility functions
export function createPluginLoader(options: PluginLoadOptions = {}): CDNPluginLoader {
  return new CDNPluginLoader(options);
}

export async function loadPlugin(pluginId: string, loaderOptions?: PluginLoadOptions): Promise<LoadedPlugin> {
  if (!(pluginLoader as any).manifest) {
    await pluginLoader.initialize();
  }
  return pluginLoader.loadPlugin(pluginId, loaderOptions);
}

export async function loadPluginsByCategory(categoryId: string): Promise<LoadedPlugin[]> {
  if (!(pluginLoader as any).manifest) {
    await pluginLoader.initialize();
  }
  return pluginLoader.loadPluginsByCategory(categoryId);
}