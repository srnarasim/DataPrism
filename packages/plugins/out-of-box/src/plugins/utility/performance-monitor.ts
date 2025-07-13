import {
  IUtilityPlugin,
  PluginContext,
  PluginManifest,
  PluginCapability
} from '@dataprism/plugins';
import { PerformanceTracker, PerformanceMetrics, PerformanceAlert } from '@shared/performance-tracker.js';
import * as d3 from 'd3';

export interface PerformanceMonitorConfig {
  mode: 'overlay' | 'detached' | 'embedded';
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  updateInterval: number;
  historyLength: number;
  showCharts: boolean;
  enableAlerts: boolean;
  thresholds: {
    memory: number;
    fps: number;
    queryTime: number;
    cpu: number;
  };
  autoExport: boolean;
  exportInterval: number;
}

export interface MonitorWidget {
  element: HTMLElement;
  update: (metrics: PerformanceMetrics) => void;
  destroy: () => void;
}

export class PerformanceMonitorPlugin implements IUtilityPlugin {
  private context: PluginContext | null = null;
  private performanceTracker: PerformanceTracker;
  private config: PerformanceMonitorConfig;
  private container: HTMLElement | null = null;
  private widgets: Map<string, MonitorWidget> = new Map();
  private updateInterval: number | null = null;
  private metricsHistory: PerformanceMetrics[] = [];
  private alertContainer: HTMLElement | null = null;

  constructor() {
    this.config = {
      mode: 'overlay',
      position: 'top-right',
      updateInterval: 1000,
      historyLength: 300,
      showCharts: true,
      enableAlerts: true,
      thresholds: {
        memory: 1000,
        fps: 30,
        queryTime: 5000,
        cpu: 80
      },
      autoExport: false,
      exportInterval: 300000 // 5 minutes
    };

    this.performanceTracker = new PerformanceTracker({
      maxMemoryMB: this.config.thresholds.memory,
      minFps: this.config.thresholds.fps,
      maxQueryTimeMs: this.config.thresholds.queryTime,
      maxCpuPercent: this.config.thresholds.cpu
    });
  }

  // Plugin Identity
  getName(): string {
    return 'PerformanceMonitor';
  }

  getVersion(): string {
    return '1.0.0';
  }

  getDescription(): string {
    return 'Live dashboard of FPS, memory, DuckDB query timings & WebAssembly heap usage';
  }

  getAuthor(): string {
    return 'DataPrism Team';
  }

  getDependencies() {
    return [
      { name: 'd3', version: '^7.8.5', optional: true }
    ];
  }

  // Lifecycle Management
  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    
    // Set up performance tracking
    this.performanceTracker.on('metrics', (metrics: PerformanceMetrics) => {
      this.handleMetricsUpdate(metrics);
    });

    this.performanceTracker.on('alert', (alert: PerformanceAlert) => {
      this.handleAlert(alert);
    });

    this.performanceTracker.start();
    this.context.logger.info('PerformanceMonitor plugin initialized');
  }

  async activate(): Promise<void> {
    if (!this.context) throw new Error('Plugin not initialized');
    
    await this.createMonitorUI();
    this.startMonitoring();
    
    this.context.logger.info('PerformanceMonitor plugin activated');
  }

  async deactivate(): Promise<void> {
    this.stopMonitoring();
    await this.destroyMonitorUI();
    this.context?.logger.info('PerformanceMonitor plugin deactivated');
  }

  async cleanup(): Promise<void> {
    this.performanceTracker.stop();
    this.context?.logger.info('PerformanceMonitor plugin cleaned up');
  }

  // Core Operations
  async execute(operation: string, params: any): Promise<any> {
    switch (operation) {
      case 'show':
        return this.showMonitor(params.mode, params.target);
      case 'hide':
        return this.hideMonitor();
      case 'export':
        return this.exportMetrics(params.format);
      case 'setThresholds':
        return this.setThresholds(params.thresholds);
      case 'getMetrics':
        return this.getMetrics(params.limit);
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  async configure(settings: Partial<PerformanceMonitorConfig>): Promise<void> {
    this.config = { ...this.config, ...settings };
    
    // Update performance tracker thresholds
    if (settings.thresholds) {
      this.performanceTracker = new PerformanceTracker({
        maxMemoryMB: settings.thresholds.memory || this.config.thresholds.memory,
        minFps: settings.thresholds.fps || this.config.thresholds.fps,
        maxQueryTimeMs: settings.thresholds.queryTime || this.config.thresholds.queryTime,
        maxCpuPercent: settings.thresholds.cpu || this.config.thresholds.cpu
      });
    }

    // Recreate UI if mode changed
    if (settings.mode && this.container) {
      await this.destroyMonitorUI();
      await this.createMonitorUI();
    }
  }

  // Metadata and Capabilities
  getManifest(): PluginManifest {
    return {
      name: this.getName(),
      version: this.getVersion(),
      description: this.getDescription(),
      author: this.getAuthor(),
      license: 'MIT',
      keywords: ['performance', 'monitoring', 'metrics', 'fps', 'memory'],
      category: 'utility',
      entryPoint: 'performance-monitor.js',
      dependencies: this.getDependencies(),
      permissions: [
        { resource: 'dom', access: 'write' },
        { resource: 'performance', access: 'read' }
      ],
      configuration: {
        mode: { type: 'string', default: 'overlay' },
        updateInterval: { type: 'number', default: 1000 },
        showCharts: { type: 'boolean', default: true },
        enableAlerts: { type: 'boolean', default: true }
      },
      compatibility: {
        minCoreVersion: '1.0.0',
        browsers: ['Chrome 90+', 'Firefox 88+', 'Safari 14+', 'Edge 90+']
      }
    };
  }

  getCapabilities(): PluginCapability[] {
    return [
      {
        name: 'monitor',
        description: 'Monitor application performance metrics',
        type: 'utility',
        version: '1.0.0',
        async: false,
        inputTypes: [],
        outputTypes: ['metrics']
      },
      {
        name: 'export',
        description: 'Export performance metrics data',
        type: 'utility',
        version: '1.0.0',
        async: true,
        inputTypes: ['metrics'],
        outputTypes: ['csv', 'json']
      }
    ];
  }

  isCompatible(coreVersion: string): boolean {
    return coreVersion >= '1.0.0';
  }

  // Monitor Operations
  async showMonitor(mode?: string, target?: HTMLElement): Promise<void> {
    if (mode) {
      this.config.mode = mode as any;
    }

    if (this.container) {
      this.container.style.display = 'block';
      return;
    }

    await this.createMonitorUI(target);
  }

  async hideMonitor(): Promise<void> {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }

  async exportMetrics(format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    if (format === 'csv') {
      const csv = this.performanceTracker.exportMetrics();
      return new Blob([csv], { type: 'text/csv' });
    } else {
      const data = {
        plugin: this.getName(),
        version: this.getVersion(),
        exportTime: new Date().toISOString(),
        config: this.config,
        metrics: this.metricsHistory
      };
      return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    }
  }

  async setThresholds(thresholds: Partial<PerformanceMonitorConfig['thresholds']>): Promise<void> {
    this.config.thresholds = { ...this.config.thresholds, ...thresholds };
    await this.configure({ thresholds: this.config.thresholds });
  }

  getMetrics(limit?: number): PerformanceMetrics[] {
    return this.performanceTracker.getMetrics(limit);
  }

  // Private Methods
  private async createMonitorUI(target?: HTMLElement): Promise<void> {
    if (this.container) return;

    this.container = document.createElement('div');
    this.container.className = 'dataprism-performance-monitor';
    
    this.applyContainerStyles();

    // Create widgets
    this.createHeaderWidget();
    this.createMetricsWidget();
    
    if (this.config.showCharts) {
      this.createChartsWidget();
    }

    // Attach to DOM
    if (this.config.mode === 'detached') {
      this.createDetachedWindow();
    } else if (target) {
      target.appendChild(this.container);
    } else {
      document.body.appendChild(this.container);
    }

    // Create alert container
    this.createAlertContainer();
  }

  private async destroyMonitorUI(): Promise<void> {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }

    if (this.alertContainer) {
      this.alertContainer.remove();
      this.alertContainer = null;
    }

    this.widgets.clear();
  }

  private applyContainerStyles(): void {
    if (!this.container) return;

    const styles: Partial<CSSStyleDeclaration> = {
      position: this.config.mode === 'overlay' ? 'fixed' : 'relative',
      zIndex: '10000',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '12px',
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '12px',
      minWidth: '280px',
      maxWidth: '400px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(4px)'
    };

    if (this.config.mode === 'overlay') {
      const [vertical, horizontal] = this.config.position.split('-');
      styles[vertical as any] = '20px';
      styles[horizontal as any] = '20px';
    }

    Object.assign(this.container.style, styles);
  }

  private createHeaderWidget(): void {
    if (!this.container) return;

    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      padding-bottom: 8px;
    `;

    const title = document.createElement('span');
    title.textContent = 'Performance Monitor';
    title.style.fontWeight = 'bold';

    const controls = document.createElement('div');
    controls.style.display = 'flex';
    controls.style.gap = '8px';

    // Toggle charts button
    if (this.config.showCharts) {
      const chartsBtn = document.createElement('button');
      chartsBtn.textContent = '📊';
      chartsBtn.style.cssText = 'background: none; border: 1px solid rgba(255,255,255,0.3); color: white; padding: 2px 6px; border-radius: 4px; cursor: pointer;';
      chartsBtn.onclick = () => this.toggleCharts();
      controls.appendChild(chartsBtn);
    }

    // Export button
    const exportBtn = document.createElement('button');
    exportBtn.textContent = '💾';
    exportBtn.style.cssText = 'background: none; border: 1px solid rgba(255,255,255,0.3); color: white; padding: 2px 6px; border-radius: 4px; cursor: pointer;';
    exportBtn.onclick = () => this.handleExportClick();
    controls.appendChild(exportBtn);

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = 'background: none; border: 1px solid rgba(255,255,255,0.3); color: white; padding: 2px 6px; border-radius: 4px; cursor: pointer;';
    closeBtn.onclick = () => this.hideMonitor();
    controls.appendChild(closeBtn);

    header.appendChild(title);
    header.appendChild(controls);
    this.container.appendChild(header);
  }

  private createMetricsWidget(): void {
    if (!this.container) return;

    const metricsContainer = document.createElement('div');
    metricsContainer.className = 'metrics-container';
    
    const widget: MonitorWidget = {
      element: metricsContainer,
      update: (metrics: PerformanceMetrics) => {
        metricsContainer.innerHTML = `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
            <div style="background: rgba(255,255,255,0.1); padding: 6px; border-radius: 4px;">
              <div style="color: #888; font-size: 10px;">FPS</div>
              <div style="font-size: 14px; font-weight: bold; color: ${metrics.fps < this.config.thresholds.fps ? '#ff6b6b' : '#51cf66'}">${metrics.fps.toFixed(1)}</div>
            </div>
            <div style="background: rgba(255,255,255,0.1); padding: 6px; border-radius: 4px;">
              <div style="color: #888; font-size: 10px;">Memory (MB)</div>
              <div style="font-size: 14px; font-weight: bold; color: ${metrics.memoryUsage > this.config.thresholds.memory ? '#ff6b6b' : '#51cf66'}">${metrics.memoryUsage.toFixed(1)}</div>
            </div>
            <div style="background: rgba(255,255,255,0.1); padding: 6px; border-radius: 4px;">
              <div style="color: #888; font-size: 10px;">CPU (%)</div>
              <div style="font-size: 14px; font-weight: bold; color: ${metrics.cpuUsage > this.config.thresholds.cpu ? '#ff6b6b' : '#51cf66'}">${metrics.cpuUsage.toFixed(1)}</div>
            </div>
            <div style="background: rgba(255,255,255,0.1); padding: 6px; border-radius: 4px;">
              <div style="color: #888; font-size: 10px;">WASM Heap (MB)</div>
              <div style="font-size: 14px; font-weight: bold;">${metrics.wasmHeapSize.toFixed(1)}</div>
            </div>
          </div>
        `;
      },
      destroy: () => {
        metricsContainer.remove();
      }
    };

    this.widgets.set('metrics', widget);
    this.container.appendChild(metricsContainer);
  }

  private createChartsWidget(): void {
    if (!this.container) return;

    const chartsContainer = document.createElement('div');
    chartsContainer.className = 'charts-container';
    chartsContainer.style.cssText = 'margin-top: 8px; height: 120px;';

    const svg = d3.select(chartsContainer)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '120');

    const widget: MonitorWidget = {
      element: chartsContainer,
      update: (metrics: PerformanceMetrics) => {
        this.updateChart(svg, metrics);
      },
      destroy: () => {
        chartsContainer.remove();
      }
    };

    this.widgets.set('charts', widget);
    this.container.appendChild(chartsContainer);
  }

  private createAlertContainer(): void {
    if (!this.config.enableAlerts) return;

    this.alertContainer = document.createElement('div');
    this.alertContainer.className = 'performance-alerts';
    this.alertContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10001;
      pointer-events: none;
    `;
    document.body.appendChild(this.alertContainer);
  }

  private createDetachedWindow(): void {
    // For detached mode, create a popup window
    const popup = window.open('', 'PerformanceMonitor', 'width=400,height=600,scrollbars=no,resizable=yes');
    if (popup) {
      popup.document.title = 'DataPrism Performance Monitor';
      popup.document.body.appendChild(this.container!);
      popup.document.head.innerHTML = `
        <style>
          body { margin: 0; padding: 20px; background: #1a1a1a; font-family: monospace; }
        </style>
      `;
    }
  }

  private startMonitoring(): void {
    if (this.updateInterval) return;

    this.updateInterval = window.setInterval(() => {
      const metrics = this.performanceTracker.getMetrics(1)[0];
      if (metrics) {
        this.handleMetricsUpdate(metrics);
      }
    }, this.config.updateInterval);
  }

  private stopMonitoring(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  private handleMetricsUpdate(metrics: PerformanceMetrics): void {
    // Store metrics history
    this.metricsHistory.push(metrics);
    if (this.metricsHistory.length > this.config.historyLength) {
      this.metricsHistory = this.metricsHistory.slice(-this.config.historyLength);
    }

    // Update all widgets
    for (const widget of this.widgets.values()) {
      widget.update(metrics);
    }

    // Publish metrics event
    this.context?.eventBus.publish('performance:metrics', metrics);
  }

  private handleAlert(alert: PerformanceAlert): void {
    if (!this.config.enableAlerts || !this.alertContainer) return;

    const alertElement = document.createElement('div');
    alertElement.style.cssText = `
      background: ${alert.severity === 'critical' ? '#ff6b6b' : '#ffa726'};
      color: white;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 8px;
      font-family: monospace;
      font-size: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      animation: slideIn 0.3s ease;
      pointer-events: auto;
      cursor: pointer;
    `;

    alertElement.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 4px;">${alert.type.toUpperCase()} ${alert.severity.toUpperCase()}</div>
      <div>${alert.message}</div>
    `;

    alertElement.onclick = () => alertElement.remove();

    this.alertContainer.appendChild(alertElement);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (alertElement.parentNode) {
        alertElement.remove();
      }
    }, 5000);

    // Publish alert event
    this.context?.eventBus.publish('performance:alert', alert);
  }

  private updateChart(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, metrics: PerformanceMetrics): void {
    if (this.metricsHistory.length < 2) return;

    const width = 280;
    const height = 120;
    const margin = { top: 10, right: 10, bottom: 20, left: 40 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Clear previous chart
    svg.selectAll('*').remove();

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, this.metricsHistory.length - 1])
      .range([0, chartWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.metricsHistory, d => d.memoryUsage) || 100])
      .range([chartHeight, 0]);

    // Create line generator
    const line = d3.line<PerformanceMetrics>()
      .x((d, i) => xScale(i))
      .y(d => yScale(d.memoryUsage))
      .curve(d3.curveMonotoneX);

    // Add the line
    g.append('path')
      .datum(this.metricsHistory)
      .attr('fill', 'none')
      .attr('stroke', '#51cf66')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .selectAll('text')
      .style('fill', 'white')
      .style('font-size', '10px');

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(4))
      .selectAll('text')
      .style('fill', 'white')
      .style('font-size', '10px');
  }

  private toggleCharts(): void {
    const chartsWidget = this.widgets.get('charts');
    if (chartsWidget) {
      const isVisible = chartsWidget.element.style.display !== 'none';
      chartsWidget.element.style.display = isVisible ? 'none' : 'block';
    }
  }

  private async handleExportClick(): Promise<void> {
    try {
      const blob = await this.exportMetrics('csv');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-metrics-${new Date().toISOString().slice(0, 19)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      this.context?.logger.error('Failed to export metrics:', error);
    }
  }
}