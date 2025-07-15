import { DataPrismError } from "./types.js";

export type DependencyState = "loading" | "ready" | "error" | "timeout" | "initializing";

export interface DependencyMetadata {
  name: string;
  version?: string;
  state: DependencyState;
  loadStartTime: number;
  loadEndTime?: number;
  error?: DataPrismError;
  retryCount: number;
  maxRetries: number;
  timeoutMs: number;
  requiredFor: string[];
  module?: any;
}

export interface DependencyLoadOptions {
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  required?: boolean;
  preload?: boolean;
}

export interface DependencyEvent {
  type: "loading" | "ready" | "error" | "timeout" | "retry";
  dependency: string;
  metadata: DependencyMetadata;
  error?: DataPrismError;
}

export type DependencyEventHandler = (event: DependencyEvent) => void;

export class DependencyRegistry {
  private static instance: DependencyRegistry;
  private dependencies = new Map<string, DependencyMetadata>();
  private eventHandlers: DependencyEventHandler[] = [];
  private loadingPromises = new Map<string, Promise<any>>();
  private timeouts = new Map<string, NodeJS.Timeout>();

  private constructor() {}

  static getInstance(): DependencyRegistry {
    if (!DependencyRegistry.instance) {
      DependencyRegistry.instance = new DependencyRegistry();
    }
    return DependencyRegistry.instance;
  }

  registerDependency(
    name: string,
    options: DependencyLoadOptions = {}
  ): DependencyMetadata {
    const metadata: DependencyMetadata = {
      name,
      state: "initializing",
      loadStartTime: Date.now(),
      retryCount: 0,
      maxRetries: options.maxRetries || 3,
      timeoutMs: options.timeout || 30000,
      requiredFor: [],
      module: null,
    };

    this.dependencies.set(name, metadata);
    this.emitEvent("loading", name, metadata);

    return metadata;
  }

  async loadDependency(
    name: string,
    loader: () => Promise<any>,
    options: DependencyLoadOptions = {}
  ): Promise<any> {
    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name);
    }

    const metadata = this.dependencies.get(name) || this.registerDependency(name, options);
    
    const loadPromise = this.executeLoad(name, loader, options);
    this.loadingPromises.set(name, loadPromise);

    return loadPromise;
  }

  private async executeLoad(
    name: string,
    loader: () => Promise<any>,
    options: DependencyLoadOptions
  ): Promise<any> {
    const metadata = this.dependencies.get(name)!;
    
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.setState(name, "timeout");
        const error: DataPrismError = {
          message: `Dependency '${name}' failed to load within ${metadata.timeoutMs}ms`,
          code: "DEPENDENCY_TIMEOUT",
          source: "orchestration",
        };
        metadata.error = error;
        this.emitEvent("timeout", name, metadata, error);
        reject(error);
      }, metadata.timeoutMs);

      this.timeouts.set(name, timeoutId);

      // Execute the async loading logic
      this.performLoad(name, loader, options, timeoutId)
        .then((module) => {
          clearTimeout(timeoutId);
          this.timeouts.delete(name);
          
          metadata.module = module;
          metadata.loadEndTime = Date.now();
          metadata.version = this.extractVersion(module);
          this.setState(name, "ready");
          
          this.emitEvent("ready", name, metadata);
          resolve(module);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          this.timeouts.delete(name);
          
          const dataPrismError: DataPrismError = {
            message: `Failed to load dependency '${name}': ${error}`,
            code: "DEPENDENCY_LOAD_ERROR",
            source: "orchestration",
          };
          
          metadata.error = dataPrismError;
          
          if (metadata.retryCount < metadata.maxRetries) {
            metadata.retryCount++;
            this.emitEvent("retry", name, metadata, dataPrismError);
            
            const retryDelay = options.retryDelay || 1000 * metadata.retryCount;
            setTimeout(() => {
              this.executeLoad(name, loader, options).then(resolve).catch(reject);
            }, retryDelay);
          } else {
            this.setState(name, "error");
            this.emitEvent("error", name, metadata, dataPrismError);
            reject(dataPrismError);
          }
        });
    });
  }

  private async performLoad(
    name: string,
    loader: () => Promise<any>,
    options: DependencyLoadOptions,
    timeoutId: NodeJS.Timeout
  ): Promise<any> {
    this.setState(name, "loading");
    return await loader();
  }

  private extractVersion(module: any): string | undefined {
    if (!module) return undefined;
    
    // Try common version extraction patterns
    if (module.version) return module.version;
    if (module.VERSION) return module.VERSION;
    if (module.get_version && typeof module.get_version === 'function') {
      try {
        return module.get_version();
      } catch (e) {
        return undefined;
      }
    }
    
    // For Apache Arrow, try to extract version from build info
    if (module.Table && module.RecordBatch) {
      return "17.0.0"; // Known Arrow version from analysis
    }
    
    return undefined;
  }

  private setState(name: string, state: DependencyState): void {
    const metadata = this.dependencies.get(name);
    if (metadata) {
      metadata.state = state;
      this.dependencies.set(name, metadata);
    }
  }

  private emitEvent(
    type: DependencyEvent["type"],
    dependency: string,
    metadata: DependencyMetadata,
    error?: DataPrismError
  ): void {
    const event: DependencyEvent = {
      type,
      dependency,
      metadata: { ...metadata },
      error,
    };

    this.eventHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (e) {
        console.error("Error in dependency event handler:", e);
      }
    });
  }

  async waitForDependency(
    name: string,
    timeoutMs: number = 30000
  ): Promise<any> {
    const metadata = this.dependencies.get(name);
    
    if (!metadata) {
      throw new Error(`Dependency '${name}' not registered`);
    }

    if (metadata.state === "ready") {
      return metadata.module;
    }

    if (metadata.state === "error") {
      throw metadata.error || new Error(`Dependency '${name}' failed to load`);
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Timeout waiting for dependency '${name}'`));
      }, timeoutMs);

      const handler = (event: DependencyEvent) => {
        if (event.dependency === name) {
          if (event.type === "ready") {
            clearTimeout(timeoutId);
            resolve(event.metadata.module);
          } else if (event.type === "error" || event.type === "timeout") {
            clearTimeout(timeoutId);
            reject(event.error || new Error(`Dependency '${name}' failed to load`));
          }
        }
      };

      this.addEventListener(handler);
      
      // Clean up handler after timeout
      setTimeout(() => {
        this.removeEventListener(handler);
      }, timeoutMs + 1000);
    });
  }

  async waitForReady(
    dependencies: string[] = [],
    timeoutMs: number = 30000
  ): Promise<Record<string, any>> {
    const targetDeps = dependencies.length > 0 
      ? dependencies 
      : Array.from(this.dependencies.keys());

    const results: Record<string, any> = {};
    
    await Promise.all(
      targetDeps.map(async (name) => {
        try {
          results[name] = await this.waitForDependency(name, timeoutMs);
        } catch (error) {
          throw new Error(`Failed to wait for dependency '${name}': ${error}`);
        }
      })
    );

    return results;
  }

  isDependencyReady(name: string): boolean {
    const metadata = this.dependencies.get(name);
    return metadata?.state === "ready";
  }

  getDependencyState(name: string): DependencyState | undefined {
    return this.dependencies.get(name)?.state;
  }

  getDependencyMetadata(name: string): DependencyMetadata | undefined {
    const metadata = this.dependencies.get(name);
    return metadata ? { ...metadata } : undefined;
  }

  getAllDependencies(): DependencyMetadata[] {
    return Array.from(this.dependencies.values()).map(metadata => ({ ...metadata }));
  }

  getReadyDependencies(): string[] {
    return Array.from(this.dependencies.entries())
      .filter(([_, metadata]) => metadata.state === "ready")
      .map(([name, _]) => name);
  }

  getFailedDependencies(): string[] {
    return Array.from(this.dependencies.entries())
      .filter(([_, metadata]) => metadata.state === "error")
      .map(([name, _]) => name);
  }

  addEventListener(handler: DependencyEventHandler): void {
    this.eventHandlers.push(handler);
  }

  removeEventListener(handler: DependencyEventHandler): void {
    const index = this.eventHandlers.indexOf(handler);
    if (index > -1) {
      this.eventHandlers.splice(index, 1);
    }
  }

  async preloadDependencies(dependencies: string[]): Promise<void> {
    const preloadPromises = dependencies.map(async (name) => {
      const metadata = this.dependencies.get(name);
      if (!metadata || metadata.state === "initializing") {
        throw new Error(`Cannot preload unregistered dependency '${name}'`);
      }
      
      if (metadata.state === "ready") {
        return metadata.module;
      }
      
      return this.waitForDependency(name);
    });

    await Promise.all(preloadPromises);
  }

  clearDependency(name: string): void {
    const timeoutId = this.timeouts.get(name);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeouts.delete(name);
    }
    
    this.dependencies.delete(name);
    this.loadingPromises.delete(name);
  }

  clearAll(): void {
    this.timeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    this.timeouts.clear();
    this.dependencies.clear();
    this.loadingPromises.clear();
    this.eventHandlers.length = 0;
  }

  getHealthStatus(): {
    totalDependencies: number;
    readyCount: number;
    loadingCount: number;
    errorCount: number;
    timeoutCount: number;
    healthScore: number;
  } {
    const all = this.getAllDependencies();
    const ready = all.filter(d => d.state === "ready").length;
    const loading = all.filter(d => d.state === "loading").length;
    const error = all.filter(d => d.state === "error").length;
    const timeout = all.filter(d => d.state === "timeout").length;
    
    const healthScore = all.length > 0 ? (ready / all.length) * 100 : 100;
    
    return {
      totalDependencies: all.length,
      readyCount: ready,
      loadingCount: loading,
      errorCount: error,
      timeoutCount: timeout,
      healthScore,
    };
  }
}