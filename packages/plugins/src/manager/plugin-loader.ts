import { IPlugin, PluginManifest } from '../interfaces/plugin.js';

export class PluginLoader {
  private loadedModules: Map<string, any>;
  private moduleCache: Map<string, Promise<any>>;

  constructor() {
    this.loadedModules = new Map();
    this.moduleCache = new Map();
  }

  async load(manifest: PluginManifest): Promise<IPlugin> {
    const pluginName = manifest.name;

    try {
      // Check if already loaded
      if (this.loadedModules.has(pluginName)) {
        return this.createPluginInstance(this.loadedModules.get(pluginName), manifest);
      }

      // Load the plugin module
      const module = await this.loadModule(manifest.entryPoint);
      this.loadedModules.set(pluginName, module);

      // Create plugin instance
      return this.createPluginInstance(module, manifest);
    } catch (error) {
      throw new PluginLoadError(`Failed to load plugin ${pluginName}: ${error}`);
    }
  }

  async unload(pluginName: string): Promise<void> {
    if (this.loadedModules.has(pluginName)) {
      const module = this.loadedModules.get(pluginName);
      
      // Call cleanup if available
      if (module && typeof module.cleanup === 'function') {
        try {
          await module.cleanup();
        } catch (error) {
          console.warn(`Plugin cleanup failed for ${pluginName}:`, error);
        }
      }

      this.loadedModules.delete(pluginName);
    }

    // Clear from cache
    this.moduleCache.delete(pluginName);
  }

  async hotReload(manifest: PluginManifest): Promise<IPlugin> {
    const pluginName = manifest.name;

    // Clear from cache first
    this.moduleCache.delete(pluginName);
    
    // Force reload
    this.loadedModules.delete(pluginName);
    
    return this.load(manifest);
  }

  async discoverPlugins(searchPaths: string[]): Promise<string[]> {
    const discoveredPaths: string[] = [];

    for (const searchPath of searchPaths) {
      try {
        const paths = await this.searchForPlugins(searchPath);
        discoveredPaths.push(...paths);
      } catch (error) {
        console.warn(`Failed to search for plugins in ${searchPath}:`, error);
      }
    }

    return discoveredPaths;
  }

  async loadManifest(pluginPath: string): Promise<PluginManifest> {
    try {
      // Try to load manifest.json from plugin directory
      const manifestPath = this.resolveManifestPath(pluginPath);
      const manifestModule = await this.loadModule(manifestPath);
      
      if (manifestModule.default) {
        return manifestModule.default;
      } else if (manifestModule.manifest) {
        return manifestModule.manifest;
      } else {
        // Assume the entire module is the manifest
        return manifestModule;
      }
    } catch (error) {
      throw new PluginLoadError(`Failed to load manifest from ${pluginPath}: ${error}`);
    }
  }

  async preloadPlugin(manifest: PluginManifest): Promise<void> {
    const pluginName = manifest.name;

    if (!this.moduleCache.has(pluginName)) {
      // Start loading but don't await - just cache the promise
      this.moduleCache.set(pluginName, this.loadModule(manifest.entryPoint));
    }
  }

  getLoadedPlugins(): string[] {
    return Array.from(this.loadedModules.keys());
  }

  isLoaded(pluginName: string): boolean {
    return this.loadedModules.has(pluginName);
  }

  async validatePlugin(manifest: PluginManifest): Promise<PluginValidationResult> {
    const result: PluginValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      // Try to load and validate the plugin module
      const module = await this.loadModule(manifest.entryPoint);

      // Check for required exports
      if (!this.hasValidPluginClass(module)) {
        result.errors.push('Plugin must export a valid plugin class or factory function');
        result.isValid = false;
      }

      // Validate plugin metadata
      const instance = this.createPluginInstance(module, manifest);
      const pluginCapabilities = instance.getCapabilities();
      
      if (!pluginCapabilities || pluginCapabilities.length === 0) {
        result.warnings.push('Plugin does not declare any capabilities');
      }

      // Check for required methods
      const requiredMethods = ['initialize', 'activate', 'execute', 'deactivate', 'cleanup'];
      for (const method of requiredMethods) {
        if (typeof (instance as any)[method] !== 'function') {
          result.errors.push(`Plugin missing required method: ${method}`);
          result.isValid = false;
        }
      }

    } catch (error) {
      result.errors.push(`Plugin validation failed: ${error}`);
      result.isValid = false;
    }

    return result;
  }

  private async loadModule(modulePath: string): Promise<any> {
    try {
      // Handle different module loading strategies
      if (this.isESModule(modulePath)) {
        return await this.loadESModule(modulePath);
      } else if (this.isWebAssembly(modulePath)) {
        return await this.loadWebAssembly(modulePath);
      } else {
        return await this.loadCommonJSModule(modulePath);
      }
    } catch (error) {
      throw new PluginLoadError(`Module loading failed for ${modulePath}: ${error}`);
    }
  }

  private async loadESModule(modulePath: string): Promise<any> {
    // Dynamic import for ES modules
    const resolvedPath = this.resolvePath(modulePath);
    return await import(resolvedPath);
  }

  private async loadWebAssembly(modulePath: string): Promise<any> {
    // Load WebAssembly module
    const resolvedPath = this.resolvePath(modulePath);
    const wasmModule = await WebAssembly.compileStreaming(fetch(resolvedPath));
    const wasmInstance = await WebAssembly.instantiate(wasmModule);
    
    return {
      module: wasmModule,
      instance: wasmInstance,
      exports: wasmInstance.exports
    };
  }

  private async loadCommonJSModule(modulePath: string): Promise<any> {
    // For CommonJS modules, we'll need to handle differently in browser vs Node
    const resolvedPath = this.resolvePath(modulePath);
    
    if (typeof require !== 'undefined') {
      // Node.js environment
      delete require.cache[require.resolve(resolvedPath)];
      return require(resolvedPath);
    } else {
      // Browser environment - treat as ES module
      return await import(resolvedPath);
    }
  }

  private createPluginInstance(module: any, manifest: PluginManifest): IPlugin {
    let PluginClass: any;

    // Determine the plugin class from the module
    if (module.default && typeof module.default === 'function') {
      PluginClass = module.default;
    } else if (module[manifest.name] && typeof module[manifest.name] === 'function') {
      PluginClass = module[manifest.name];
    } else if (module.Plugin && typeof module.Plugin === 'function') {
      PluginClass = module.Plugin;
    } else if (typeof module === 'function') {
      PluginClass = module;
    } else {
      throw new PluginLoadError('No valid plugin class found in module');
    }

    // Create instance
    try {
      const instance = new PluginClass(manifest);
      
      // Validate that instance implements IPlugin interface
      if (!this.implementsIPlugin(instance)) {
        throw new PluginLoadError('Plugin instance does not implement IPlugin interface');
      }

      return instance;
    } catch (error) {
      throw new PluginLoadError(`Failed to create plugin instance: ${error}`);
    }
  }

  private implementsIPlugin(instance: any): boolean {
    const requiredMethods = [
      'getName', 'getVersion', 'getDescription', 'getAuthor', 'getCapabilities',
      'getDependencies', 'initialize', 'activate', 'execute', 'deactivate', 'cleanup', 'configure'
    ];

    return requiredMethods.every(method => typeof instance[method] === 'function');
  }

  private hasValidPluginClass(module: any): boolean {
    return (
      (module.default && typeof module.default === 'function') ||
      (module.Plugin && typeof module.Plugin === 'function') ||
      (typeof module === 'function')
    );
  }

  private async searchForPlugins(searchPath: string): Promise<string[]> {
    const pluginPaths: string[] = [];

    try {
      // In a real implementation, this would scan the filesystem
      // For now, we'll provide a mock implementation
      const mockPaths = [
        `${searchPath}/data-processor-csv`,
        `${searchPath}/visualization-charts`,
        `${searchPath}/integration-api`,
        `${searchPath}/utility-performance`
      ];

      // Validate each path has a manifest
      for (const path of mockPaths) {
        try {
          const manifestPath = this.resolveManifestPath(path);
          // In real implementation, check if file exists
          pluginPaths.push(path);
        } catch (error) {
          // Skip invalid plugins
          continue;
        }
      }
    } catch (error) {
      throw new PluginLoadError(`Plugin discovery failed: ${error}`);
    }

    return pluginPaths;
  }

  private resolvePath(modulePath: string): string {
    // Handle relative and absolute paths
    if (modulePath.startsWith('./') || modulePath.startsWith('../')) {
      // Relative path - resolve relative to current location
      return new URL(modulePath, import.meta.url).href;
    } else if (modulePath.startsWith('/')) {
      // Absolute path
      return modulePath;
    } else if (modulePath.startsWith('http://') || modulePath.startsWith('https://')) {
      // URL
      return modulePath;
    } else {
      // Package name or relative path
      return `./${modulePath}`;
    }
  }

  private resolveManifestPath(pluginPath: string): string {
    // Try different manifest file names
    const manifestNames = ['manifest.json', 'plugin.json', 'package.json'];
    
    for (const name of manifestNames) {
      const manifestPath = `${pluginPath}/${name}`;
      // In real implementation, check if file exists
      return manifestPath;
    }

    throw new PluginLoadError(`No manifest found in ${pluginPath}`);
  }

  private isESModule(modulePath: string): boolean {
    return modulePath.endsWith('.js') || modulePath.endsWith('.mjs') || modulePath.endsWith('.ts');
  }

  private isWebAssembly(modulePath: string): boolean {
    return modulePath.endsWith('.wasm');
  }

  async getModuleInfo(pluginName: string): Promise<PluginModuleInfo | null> {
    const module = this.loadedModules.get(pluginName);
    if (!module) return null;

    return {
      pluginName,
      modulePath: module.path || 'unknown',
      loadTime: module.loadTime || Date.now(),
      size: module.size || 0,
      type: this.getModuleType(module),
      exports: Object.keys(module).filter(key => key !== 'default')
    };
  }

  private getModuleType(module: any): ModuleType {
    if (module.instance && module.exports) {
      return 'webassembly';
    } else if (module.__esModule || module.default) {
      return 'esmodule';
    } else {
      return 'commonjs';
    }
  }

  async destroy(): Promise<void> {
    // Unload all plugins
    const pluginNames = Array.from(this.loadedModules.keys());
    for (const pluginName of pluginNames) {
      try {
        await this.unload(pluginName);
      } catch (error) {
        console.warn(`Failed to unload plugin ${pluginName}:`, error);
      }
    }

    this.loadedModules.clear();
    this.moduleCache.clear();
  }
}

export class PluginLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PluginLoadError';
  }
}

export interface PluginValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PluginModuleInfo {
  pluginName: string;
  modulePath: string;
  loadTime: number;
  size: number;
  type: ModuleType;
  exports: string[];
}

export type ModuleType = 'esmodule' | 'commonjs' | 'webassembly';