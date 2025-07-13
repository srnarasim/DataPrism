export interface EventHandler<T = any> {
  (data: T): void | Promise<void>;
}

export interface EventSubscription {
  unsubscribe(): void;
}

export interface EventHistoryEntry {
  event: string;
  data: any;
  timestamp: number;
}

export class EventBus {
  private handlers: Map<string, Set<EventHandler>>;
  private wildcardHandlers: Set<EventHandler>;
  private eventHistory: EventHistoryEntry[];
  private maxHistorySize: number = 1000;
  private isInitialized = false;

  constructor() {
    this.handlers = new Map();
    this.wildcardHandlers = new Set();
    this.eventHistory = [];
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Set up global error handling for async event handlers
    this.setupErrorHandling();
    this.isInitialized = true;
  }

  publish<T>(event: string, data: T): void {
    if (!this.isInitialized) {
      console.warn("EventBus not initialized, call initialize() first");
      return;
    }

    // Add to history
    this.addToHistory(event, data);

    // Handle specific event listeners
    const eventHandlers = this.handlers.get(event);
    if (eventHandlers) {
      for (const handler of eventHandlers) {
        this.executeHandler(handler, data, event);
      }
    }

    // Handle wildcard listeners
    for (const handler of this.wildcardHandlers) {
      this.executeHandler(handler, { event, data }, event);
    }
  }

  subscribe<T>(event: string, handler: EventHandler<T>): EventSubscription {
    if (!this.isInitialized) {
      console.warn("EventBus not initialized, call initialize() first");
    }

    if (event === "*") {
      this.wildcardHandlers.add(handler as EventHandler);
      return {
        unsubscribe: () =>
          this.wildcardHandlers.delete(handler as EventHandler),
      };
    }

    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }

    this.handlers.get(event)!.add(handler as EventHandler);

    return {
      unsubscribe: () => {
        const handlers = this.handlers.get(event);
        if (handlers) {
          handlers.delete(handler as EventHandler);
          if (handlers.size === 0) {
            this.handlers.delete(event);
          }
        }
      },
    };
  }

  unsubscribe(event: string, handler: EventHandler): void {
    if (event === "*") {
      this.wildcardHandlers.delete(handler);
      return;
    }

    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(event);
      }
    }
  }

  once<T>(event: string, handler: EventHandler<T>): EventSubscription {
    const onceHandler = (data: T) => {
      handler(data);
      subscription.unsubscribe();
    };

    const subscription = this.subscribe(event, onceHandler);
    return subscription;
  }

  getEventHistory(event?: string): EventHistoryEntry[] {
    if (event) {
      return this.eventHistory.filter((entry) => entry.event === event);
    }
    return [...this.eventHistory];
  }

  clearEventHistory(): void {
    this.eventHistory = [];
  }

  getActiveSubscriptions(): Map<string, number> {
    const subscriptions = new Map<string, number>();

    for (const [event, handlers] of this.handlers) {
      subscriptions.set(event, handlers.size);
    }

    if (this.wildcardHandlers.size > 0) {
      subscriptions.set("*", this.wildcardHandlers.size);
    }

    return subscriptions;
  }

  async waitForEvent<T>(event: string, timeout = 30000): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        subscription.unsubscribe();
        reject(new Error(`Timeout waiting for event: ${event}`));
      }, timeout);

      const subscription = this.once<T>(event, (data: T) => {
        clearTimeout(timeoutId);
        resolve(data);
      });
    });
  }

  getMetrics(): EventBusMetrics {
    return {
      totalEvents: this.eventHistory.length,
      uniqueEvents: new Set(this.eventHistory.map((e) => e.event)).size,
      activeSubscriptions:
        Array.from(this.handlers.entries()).reduce(
          (sum, [, handlers]) => sum + handlers.size,
          0,
        ) + this.wildcardHandlers.size,
      wildcardSubscriptions: this.wildcardHandlers.size,
      historySize: this.eventHistory.length,
      maxHistorySize: this.maxHistorySize,
    };
  }

  destroy(): void {
    this.handlers.clear();
    this.wildcardHandlers.clear();
    this.eventHistory = [];
    this.isInitialized = false;
  }

  private executeHandler(
    handler: EventHandler,
    data: any,
    event: string,
  ): void {
    try {
      const result = handler(data);

      // Handle async handlers
      if (result instanceof Promise) {
        result.catch((error) => {
          console.error(`Error in async event handler for ${event}:`, error);
          this.publish("eventbus:error", {
            event,
            error,
            handler: handler.toString(),
          });
        });
      }
    } catch (error) {
      console.error(`Error in event handler for ${event}:`, error);
      this.publish("eventbus:error", {
        event,
        error,
        handler: handler.toString(),
      });
    }
  }

  private addToHistory(event: string, data: any): void {
    this.eventHistory.push({
      event,
      data,
      timestamp: Date.now(),
    });

    // Maintain history size limit
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  private setupErrorHandling(): void {
    // Handle uncaught promise rejections from event handlers
    if (typeof window !== "undefined") {
      window.addEventListener("unhandledrejection", (event) => {
        this.publish("eventbus:unhandled-rejection", {
          reason: event.reason,
          timestamp: Date.now(),
        });
      });
    }
  }
}

export interface EventBusMetrics {
  totalEvents: number;
  uniqueEvents: number;
  activeSubscriptions: number;
  wildcardSubscriptions: number;
  historySize: number;
  maxHistorySize: number;
}

// Event Bus Factory for creating isolated instances
export class EventBusFactory {
  private static instances: Map<string, EventBus> = new Map();

  static create(name: string): EventBus {
    if (!this.instances.has(name)) {
      this.instances.set(name, new EventBus());
    }
    return this.instances.get(name)!;
  }

  static destroy(name: string): void {
    const instance = this.instances.get(name);
    if (instance) {
      instance.destroy();
      this.instances.delete(name);
    }
  }

  static getAll(): Map<string, EventBus> {
    return new Map(this.instances);
  }
}
