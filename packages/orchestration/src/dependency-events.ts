import { DependencyRegistry, DependencyEvent } from "./dependency-registry.js";

export type DataPrismEventType = 
  | "dependencyLoading"
  | "dependencyReady" 
  | "dependencyError"
  | "dependencyTimeout"
  | "dependencyRetry"
  | "engineReady"
  | "arrowReady"
  | "duckdbReady"
  | "wasmReady"
  | "allDependenciesReady"
  | "initializationProgress";

export interface DataPrismEvent {
  type: DataPrismEventType;
  dependency?: string;
  progress?: {
    loaded: number;
    total: number;
    percentage: number;
  };
  error?: Error;
  metadata?: any;
  timestamp: number;
}

export type DataPrismEventHandler = (event: DataPrismEvent) => void;

export class DependencyEventSystem {
  private static instance: DependencyEventSystem;
  private eventHandlers = new Map<DataPrismEventType, DataPrismEventHandler[]>();
  private registry: DependencyRegistry;
  private initializationStartTime: number = 0;

  private constructor() {
    this.registry = DependencyRegistry.getInstance();
    this.setupRegistryEventHandlers();
  }

  static getInstance(): DependencyEventSystem {
    if (!DependencyEventSystem.instance) {
      DependencyEventSystem.instance = new DependencyEventSystem();
    }
    return DependencyEventSystem.instance;
  }

  private setupRegistryEventHandlers(): void {
    this.registry.addEventListener((event: DependencyEvent) => {
      this.handleRegistryEvent(event);
    });
  }

  private handleRegistryEvent(event: DependencyEvent): void {
    const dataPrismEvent: DataPrismEvent = {
      type: this.mapRegistryEventType(event.type, event.dependency),
      dependency: event.dependency,
      error: event.error,
      metadata: event.metadata,
      timestamp: Date.now(),
    };

    // Add progress information
    if (event.type === "loading" || event.type === "ready") {
      dataPrismEvent.progress = this.calculateProgress();
    }

    // Emit the mapped event
    this.emit(dataPrismEvent.type, dataPrismEvent);

    // Check if all dependencies are ready
    if (event.type === "ready") {
      this.checkAllDependenciesReady();
    }
  }

  private mapRegistryEventType(
    registryEventType: DependencyEvent["type"],
    dependency: string
  ): DataPrismEventType {
    switch (registryEventType) {
      case "loading":
        return "dependencyLoading";
      case "ready":
        return this.getSpecificReadyEventType(dependency);
      case "error":
        return "dependencyError";
      case "timeout":
        return "dependencyTimeout";
      case "retry":
        return "dependencyRetry";
      default:
        return "dependencyLoading";
    }
  }

  private getSpecificReadyEventType(dependency: string): DataPrismEventType {
    switch (dependency) {
      case "apache-arrow":
        return "arrowReady";
      case "duckdb":
        return "duckdbReady";
      case "wasm-core":
        return "wasmReady";
      default:
        return "dependencyReady";
    }
  }

  private calculateProgress(): { loaded: number; total: number; percentage: number } {
    const allDeps = this.registry.getAllDependencies();
    const readyDeps = allDeps.filter(dep => dep.state === "ready");
    const total = allDeps.length;
    const loaded = readyDeps.length;
    
    return {
      loaded,
      total,
      percentage: total > 0 ? Math.round((loaded / total) * 100) : 0,
    };
  }

  private checkAllDependenciesReady(): void {
    const allDeps = this.registry.getAllDependencies();
    const readyDeps = allDeps.filter(dep => dep.state === "ready");
    
    if (allDeps.length > 0 && readyDeps.length === allDeps.length) {
      this.emit("allDependenciesReady", {
        type: "allDependenciesReady",
        progress: this.calculateProgress(),
        timestamp: Date.now(),
        metadata: {
          loadTime: Date.now() - this.initializationStartTime,
          dependencies: allDeps.map(dep => dep.name),
        },
      });
    }
  }

  addEventListener(
    eventType: DataPrismEventType,
    handler: DataPrismEventHandler
  ): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  removeEventListener(
    eventType: DataPrismEventType,
    handler: DataPrismEventHandler
  ): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit(eventType: DataPrismEventType, event: DataPrismEvent): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in DataPrism event handler for ${eventType}:`, error);
        }
      });
    }
  }

  // Convenience methods for common event subscriptions
  onDependencyLoading(handler: DataPrismEventHandler): void {
    this.addEventListener("dependencyLoading", handler);
  }

  onDependencyReady(handler: DataPrismEventHandler): void {
    this.addEventListener("dependencyReady", handler);
  }

  onDependencyError(handler: DataPrismEventHandler): void {
    this.addEventListener("dependencyError", handler);
  }

  onArrowReady(handler: DataPrismEventHandler): void {
    this.addEventListener("arrowReady", handler);
  }

  onDuckDBReady(handler: DataPrismEventHandler): void {
    this.addEventListener("duckdbReady", handler);
  }

  onWasmReady(handler: DataPrismEventHandler): void {
    this.addEventListener("wasmReady", handler);
  }

  onAllDependenciesReady(handler: DataPrismEventHandler): void {
    this.addEventListener("allDependenciesReady", handler);
  }

  onInitializationProgress(handler: DataPrismEventHandler): void {
    this.addEventListener("initializationProgress", handler);
  }

  // Progress tracking methods
  startInitialization(): void {
    this.initializationStartTime = Date.now();
    this.emit("initializationProgress", {
      type: "initializationProgress",
      progress: { loaded: 0, total: 0, percentage: 0 },
      timestamp: Date.now(),
      metadata: { stage: "starting" },
    });
  }

  updateInitializationProgress(stage: string, additionalData?: any): void {
    const progress = this.calculateProgress();
    this.emit("initializationProgress", {
      type: "initializationProgress",
      progress,
      timestamp: Date.now(),
      metadata: { stage, ...additionalData },
    });
  }

  // Utility methods for creating loading indicators
  createLoadingPromise<T>(
    eventType: DataPrismEventType,
    timeoutMs: number = 30000
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Timeout waiting for ${eventType}`));
      }, timeoutMs);

      const handler = (event: DataPrismEvent) => {
        clearTimeout(timeoutId);
        if (event.error) {
          reject(event.error);
        } else {
          resolve(event.metadata as T);
        }
      };

      this.addEventListener(eventType, handler);
    });
  }

  async waitForArrowReady(timeoutMs: number = 30000): Promise<void> {
    return this.createLoadingPromise("arrowReady", timeoutMs);
  }

  async waitForDuckDBReady(timeoutMs: number = 30000): Promise<void> {
    return this.createLoadingPromise("duckdbReady", timeoutMs);
  }

  async waitForWasmReady(timeoutMs: number = 20000): Promise<void> {
    return this.createLoadingPromise("wasmReady", timeoutMs);
  }

  async waitForAllDependenciesReady(timeoutMs: number = 30000): Promise<void> {
    return this.createLoadingPromise("allDependenciesReady", timeoutMs);
  }

  // Debug and monitoring methods
  getEventStats(): {
    totalEvents: number;
    eventsByType: Record<DataPrismEventType, number>;
    recentEvents: DataPrismEvent[];
  } {
    const stats = {
      totalEvents: 0,
      eventsByType: {} as Record<DataPrismEventType, number>,
      recentEvents: [] as DataPrismEvent[],
    };

    // This would need to be implemented with actual event tracking
    // For now, return empty stats
    return stats;
  }

  clearAllEventHandlers(): void {
    this.eventHandlers.clear();
  }

  // Helper method to create a loading indicator UI
  createLoadingIndicator(
    container: HTMLElement,
    options: {
      showProgress?: boolean;
      showDetails?: boolean;
      theme?: "light" | "dark";
    } = {}
  ): {
    update: (progress: number, message?: string) => void;
    destroy: () => void;
  } {
    const indicator = document.createElement("div");
    indicator.className = `dataprism-loading-indicator ${options.theme || "light"}`;
    indicator.innerHTML = `
      <div class="loading-spinner"></div>
      <div class="loading-message">Initializing DataPrism...</div>
      ${options.showProgress ? '<div class="loading-progress"><div class="progress-bar"></div></div>' : ''}
      ${options.showDetails ? '<div class="loading-details"></div>' : ''}
    `;

    container.appendChild(indicator);

    const progressBar = indicator.querySelector(".progress-bar") as HTMLElement;
    const messageEl = indicator.querySelector(".loading-message") as HTMLElement;
    const detailsEl = indicator.querySelector(".loading-details") as HTMLElement;

    // Set up event listeners for real-time updates
    const progressHandler = (event: DataPrismEvent) => {
      if (event.progress) {
        if (progressBar) {
          progressBar.style.width = `${event.progress.percentage}%`;
        }
        if (messageEl) {
          messageEl.textContent = `Loading... ${event.progress.percentage}%`;
        }
        if (detailsEl && event.dependency) {
          detailsEl.textContent = `Loading ${event.dependency}...`;
        }
      }
    };

    this.addEventListener("initializationProgress", progressHandler);
    this.addEventListener("dependencyLoading", progressHandler);

    return {
      update: (progress: number, message?: string) => {
        if (progressBar) {
          progressBar.style.width = `${progress}%`;
        }
        if (messageEl && message) {
          messageEl.textContent = message;
        }
      },
      destroy: () => {
        this.removeEventListener("initializationProgress", progressHandler);
        this.removeEventListener("dependencyLoading", progressHandler);
        if (indicator.parentNode) {
          indicator.parentNode.removeChild(indicator);
        }
      },
    };
  }
}