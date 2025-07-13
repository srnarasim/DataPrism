// Simple EventEmitter implementation for browser compatibility
class EventEmitter {
  private listeners: Record<string, Function[]> = {};

  on(event: string, listener: Function): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  emit(event: string, ...args: any[]): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach(listener => listener(...args));
    }
  }

  removeListener(event: string, listener: Function): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(l => l !== listener);
    }
  }
}

export interface PerformanceMetrics {
  timestamp: number;
  fps: number;
  memoryUsage: number;
  queryTime?: number;
  wasmHeapSize: number;
  cpuUsage: number;
  networkLatency?: number;
}

export interface PerformanceAlert {
  type: 'memory' | 'fps' | 'query' | 'cpu';
  severity: 'warning' | 'critical';
  message: string;
  value: number;
  threshold: number;
  timestamp: number;
}

export interface PerformanceThresholds {
  maxMemoryMB: number;
  minFps: number;
  maxQueryTimeMs: number;
  maxCpuPercent: number;
}

export class PerformanceTracker extends EventEmitter {
  private metrics: PerformanceMetrics[] = [];
  private thresholds: PerformanceThresholds;
  private isTracking = false;
  private trackingInterval?: number;
  private fpsFrameCount = 0;
  private fpsStartTime = 0;
  private lastFrameTime = 0;

  constructor(thresholds: PerformanceThresholds = {
    maxMemoryMB: 1000,
    minFps: 30,
    maxQueryTimeMs: 5000,
    maxCpuPercent: 80
  }) {
    super();
    this.thresholds = thresholds;
  }

  public start(): void {
    if (this.isTracking) return;
    
    this.isTracking = true;
    this.fpsStartTime = performance.now();
    
    // Track metrics every second
    this.trackingInterval = window.setInterval(() => {
      this.collectMetrics();
    }, 1000);

    // Start FPS tracking
    this.trackFPS();
  }

  public stop(): void {
    if (!this.isTracking) return;
    
    this.isTracking = false;
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = undefined;
    }
  }

  public getMetrics(limit?: number): PerformanceMetrics[] {
    return limit ? this.metrics.slice(-limit) : [...this.metrics];
  }

  public clearMetrics(): void {
    this.metrics = [];
  }

  public exportMetrics(): string {
    const headers = ['timestamp', 'fps', 'memoryUsage', 'queryTime', 'wasmHeapSize', 'cpuUsage', 'networkLatency'];
    const rows = this.metrics.map(metric => [
      metric.timestamp,
      metric.fps,
      metric.memoryUsage,
      metric.queryTime || '',
      metric.wasmHeapSize,
      metric.cpuUsage,
      metric.networkLatency || ''
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  public markQueryStart(queryId: string): void {
    performance.mark(`query-start-${queryId}`);
  }

  public markQueryEnd(queryId: string): number {
    performance.mark(`query-end-${queryId}`);
    performance.measure(`query-${queryId}`, `query-start-${queryId}`, `query-end-${queryId}`);
    
    const measure = performance.getEntriesByName(`query-${queryId}`, 'measure')[0];
    const queryTime = measure.duration;
    
    // Check query time threshold
    if (queryTime > this.thresholds.maxQueryTimeMs) {
      this.emitAlert({
        type: 'query',
        severity: queryTime > this.thresholds.maxQueryTimeMs * 2 ? 'critical' : 'warning',
        message: `Query execution time exceeded threshold: ${queryTime.toFixed(2)}ms`,
        value: queryTime,
        threshold: this.thresholds.maxQueryTimeMs,
        timestamp: Date.now()
      });
    }

    return queryTime;
  }

  private collectMetrics(): void {
    const now = performance.now();
    const memory = this.getMemoryUsage();
    const wasmHeap = this.getWasmHeapSize();
    const cpu = this.getCpuUsage();

    const metrics: PerformanceMetrics = {
      timestamp: Date.now(),
      fps: this.getCurrentFPS(),
      memoryUsage: memory,
      wasmHeapSize: wasmHeap,
      cpuUsage: cpu
    };

    this.metrics.push(metrics);
    
    // Keep only last 300 entries (5 minutes at 1 second intervals)
    if (this.metrics.length > 300) {
      this.metrics = this.metrics.slice(-300);
    }

    // Check thresholds
    this.checkThresholds(metrics);
    
    this.emit('metrics', metrics);
  }

  private trackFPS(): void {
    const track = () => {
      if (!this.isTracking) return;
      
      const now = performance.now();
      this.fpsFrameCount++;
      
      // Calculate FPS every second
      if (now - this.fpsStartTime >= 1000) {
        const fps = (this.fpsFrameCount * 1000) / (now - this.fpsStartTime);
        this.fpsFrameCount = 0;
        this.fpsStartTime = now;
      }
      
      this.lastFrameTime = now;
      requestAnimationFrame(track);
    };
    
    requestAnimationFrame(track);
  }

  private getCurrentFPS(): number {
    const now = performance.now();
    const elapsed = now - this.fpsStartTime;
    return elapsed > 0 ? (this.fpsFrameCount * 1000) / elapsed : 0;
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / (1024 * 1024); // MB
    }
    return 0;
  }

  private getWasmHeapSize(): number {
    // This would need to be integrated with the actual WASM module
    // For now, return 0 as placeholder
    return 0;
  }

  private getCpuUsage(): number {
    // Browser doesn't provide direct CPU usage, return estimate based on frame timing
    const now = performance.now();
    const frameDelta = now - this.lastFrameTime;
    
    // Rough estimation: if frame time > 16ms (60fps), consider high CPU
    const cpuEstimate = Math.min(100, (frameDelta / 16) * 20);
    return cpuEstimate;
  }

  private checkThresholds(metrics: PerformanceMetrics): void {
    // Memory threshold
    if (metrics.memoryUsage > this.thresholds.maxMemoryMB) {
      this.emitAlert({
        type: 'memory',
        severity: metrics.memoryUsage > this.thresholds.maxMemoryMB * 1.5 ? 'critical' : 'warning',
        message: `Memory usage exceeded threshold: ${metrics.memoryUsage.toFixed(2)}MB`,
        value: metrics.memoryUsage,
        threshold: this.thresholds.maxMemoryMB,
        timestamp: Date.now()
      });
    }

    // FPS threshold
    if (metrics.fps < this.thresholds.minFps && metrics.fps > 0) {
      this.emitAlert({
        type: 'fps',
        severity: metrics.fps < this.thresholds.minFps * 0.5 ? 'critical' : 'warning',
        message: `FPS dropped below threshold: ${metrics.fps.toFixed(2)}`,
        value: metrics.fps,
        threshold: this.thresholds.minFps,
        timestamp: Date.now()
      });
    }

    // CPU threshold
    if (metrics.cpuUsage > this.thresholds.maxCpuPercent) {
      this.emitAlert({
        type: 'cpu',
        severity: metrics.cpuUsage > this.thresholds.maxCpuPercent * 1.2 ? 'critical' : 'warning',
        message: `CPU usage exceeded threshold: ${metrics.cpuUsage.toFixed(2)}%`,
        value: metrics.cpuUsage,
        threshold: this.thresholds.maxCpuPercent,
        timestamp: Date.now()
      });
    }
  }

  private emitAlert(alert: PerformanceAlert): void {
    this.emit('alert', alert);
  }
}