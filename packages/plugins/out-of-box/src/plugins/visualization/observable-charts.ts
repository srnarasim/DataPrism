import { 
  IVisualizationPlugin, 
  PluginContext, 
  PluginManifest, 
  PluginCapability,
  Dataset,
  DataType,
  VisualizationType,
  RenderConfig,
  Dimensions,
  InteractionEvent,
  InteractionFeature,
  ExportFormat,
  VisualizationConfig
} from '@dataprism/plugins';
import * as d3 from 'd3';
import { PerformanceTracker } from '@shared/performance-tracker.js';

export interface ChartSpec {
  type: 'bar' | 'line' | 'area' | 'scatter' | 'histogram';
  x: string;
  y: string;
  color?: string;
  size?: string;
  title?: string;
  subtitle?: string;
  legend?: boolean;
  grid?: boolean;
  animation?: boolean;
}

export interface ObservableChartsConfig extends VisualizationConfig {
  chartSpec: ChartSpec;
  responsive: boolean;
  maxDataPoints: number;
  enableInteraction: boolean;
  enableTooltips: boolean;
}

export class ObservableChartsPlugin implements IVisualizationPlugin {
  private context: PluginContext | null = null;
  private container: Element | null = null;
  private currentData: Dataset | null = null;
  private currentConfig: ObservableChartsConfig | null = null;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null;
  private performanceTracker: PerformanceTracker;
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    this.performanceTracker = new PerformanceTracker({
      maxMemoryMB: 500,
      minFps: 30,
      maxQueryTimeMs: 1000,
      maxCpuPercent: 70
    });
  }

  // Plugin Identity
  getName(): string {
    return 'ObservableCharts';
  }

  getVersion(): string {
    return '1.0.0';
  }

  getDescription(): string {
    return 'High-performance reactive charts built with Observable Framework and D3';
  }

  getAuthor(): string {
    return 'DataPrism Team';
  }

  getDependencies() {
    return [
      { name: 'd3', version: '^7.8.5', optional: false }
    ];
  }

  // Lifecycle Management
  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    this.performanceTracker.start();
    
    this.context.logger.info('ObservableCharts plugin initialized');
  }

  async activate(): Promise<void> {
    if (!this.context) throw new Error('Plugin not initialized');
    this.context.logger.info('ObservableCharts plugin activated');
  }

  async deactivate(): Promise<void> {
    if (this.container) {
      await this.destroy();
    }
    this.context?.logger.info('ObservableCharts plugin deactivated');
  }

  async cleanup(): Promise<void> {
    this.performanceTracker.stop();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    this.context?.logger.info('ObservableCharts plugin cleaned up');
  }

  // Core Operations
  async execute(operation: string, params: any): Promise<any> {
    switch (operation) {
      case 'render':
        return this.render(params.container, params.data, params.config);
      case 'update':
        return this.update(params.data);
      case 'export':
        return this.export(params.format);
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  async configure(settings: any): Promise<void> {
    this.currentConfig = { ...this.currentConfig, ...settings };
  }

  // Metadata and Capabilities
  getManifest(): PluginManifest {
    return {
      name: this.getName(),
      version: this.getVersion(),
      description: this.getDescription(),
      author: this.getAuthor(),
      license: 'MIT',
      keywords: ['visualization', 'charts', 'd3', 'observable'],
      category: 'visualization',
      entryPoint: 'observable-charts.js',
      dependencies: this.getDependencies(),
      permissions: [
        { resource: 'dom', access: 'write' },
        { resource: 'events', access: 'read' }
      ],
      configuration: {
        chartType: { type: 'string', required: true, default: 'bar' },
        responsive: { type: 'boolean', default: true },
        animation: { type: 'boolean', default: true },
        maxDataPoints: { type: 'number', default: 50000 }
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
        name: 'render',
        description: 'Render interactive charts',
        type: 'visualization',
        version: '1.0.0',
        async: true,
        inputTypes: ['dataset'],
        outputTypes: ['dom-element']
      },
      {
        name: 'export',
        description: 'Export charts to various formats',
        type: 'utility',
        version: '1.0.0',
        async: true,
        inputTypes: ['chart-instance'],
        outputTypes: ['svg', 'png', 'pdf']
      }
    ];
  }

  isCompatible(coreVersion: string): boolean {
    // Simple semantic version check
    return coreVersion >= '1.0.0';
  }

  // Visualization Operations
  async render(container: Element, data: Dataset, config?: RenderConfig): Promise<void> {
    this.performanceTracker.markQueryStart('render');
    
    try {
      this.container = container;
      this.currentData = data;
      
      // Set up default configuration
      const defaultConfig: ObservableChartsConfig = {
        chartSpec: {
          type: 'bar',
          x: data.columns[0]?.name || 'x',
          y: data.columns[1]?.name || 'y',
          title: 'Chart'
        },
        layout: {
          margin: { top: 20, right: 20, bottom: 40, left: 40 },
          padding: { top: 10, right: 10, bottom: 10, left: 10 },
          orientation: 'vertical',
          alignment: 'center'
        },
        styling: {
          colors: d3.schemeCategory10,
          colorScheme: 'categorical',
          fonts: { family: 'Arial', size: 12, weight: 'normal', style: 'normal' },
          borders: { width: 1, style: 'solid', color: '#ccc', radius: 0 },
          shadows: false
        },
        behavior: {
          interactive: true,
          zoomable: true,
          pannable: true,
          selectable: true,
          hoverable: true,
          clickable: true
        },
        data: {
          aggregation: 'none',
          sorting: 'none',
          filtering: [],
          grouping: []
        },
        responsive: true,
        maxDataPoints: 50000,
        enableInteraction: true,
        enableTooltips: true,
        ...config
      };

      this.currentConfig = defaultConfig;

      // Clear container
      d3.select(container).selectAll('*').remove();

      // Create SVG
      const containerRect = container.getBoundingClientRect();
      const width = containerRect.width || 800;
      const height = containerRect.height || 600;

      this.svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('max-width', '100%')
        .style('height', 'auto');

      // Set up resize observer for responsive charts
      if (defaultConfig.responsive) {
        this.setupResizeObserver();
      }

      // Render the specific chart type
      await this.renderChart(data, defaultConfig);

      this.context?.eventBus.publish('chart:rendered', {
        plugin: this.getName(),
        chartType: defaultConfig.chartSpec.type,
        dataPoints: data.rows.length
      });

    } catch (error) {
      this.context?.logger.error('Error rendering chart:', error);
      throw error;
    } finally {
      this.performanceTracker.markQueryEnd('render');
    }
  }

  async update(data: Dataset): Promise<void> {
    if (!this.container || !this.currentConfig) {
      throw new Error('Chart not initialized. Call render() first.');
    }

    this.currentData = data;
    await this.renderChart(data, this.currentConfig);
  }

  async resize(dimensions: Dimensions): Promise<void> {
    if (!this.svg) return;

    this.svg
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .attr('viewBox', `0 0 ${dimensions.width} ${dimensions.height}`);

    if (this.currentData && this.currentConfig) {
      await this.renderChart(this.currentData, this.currentConfig);
    }
  }

  async destroy(): Promise<void> {
    if (this.container) {
      d3.select(this.container).selectAll('*').remove();
    }
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    this.container = null;
    this.svg = null;
    this.currentData = null;
    this.currentConfig = null;
  }

  // Visualization Capabilities
  getVisualizationTypes(): VisualizationType[] {
    return [
      {
        name: 'Bar Chart',
        description: 'Compare values across categories',
        category: 'chart',
        requiredFields: [
          { name: 'category', types: ['string'], multiple: false, description: 'Category field' },
          { name: 'value', types: ['number', 'integer'], multiple: false, description: 'Value field' }
        ],
        optionalFields: [
          { name: 'color', types: ['string'], multiple: false, description: 'Color grouping field' }
        ],
        complexity: 'simple'
      },
      {
        name: 'Line Chart',
        description: 'Show trends over time or ordered categories',
        category: 'chart',
        requiredFields: [
          { name: 'x', types: ['date', 'number', 'string'], multiple: false, description: 'X-axis field' },
          { name: 'y', types: ['number', 'integer'], multiple: false, description: 'Y-axis field' }
        ],
        optionalFields: [
          { name: 'series', types: ['string'], multiple: false, description: 'Series grouping field' }
        ],
        complexity: 'simple'
      },
      {
        name: 'Scatter Plot',
        description: 'Explore relationships between two numeric variables',
        category: 'chart',
        requiredFields: [
          { name: 'x', types: ['number', 'integer'], multiple: false, description: 'X-axis field' },
          { name: 'y', types: ['number', 'integer'], multiple: false, description: 'Y-axis field' }
        ],
        optionalFields: [
          { name: 'size', types: ['number', 'integer'], multiple: false, description: 'Point size field' },
          { name: 'color', types: ['string', 'number'], multiple: false, description: 'Color field' }
        ],
        complexity: 'moderate'
      },
      {
        name: 'Area Chart',
        description: 'Show cumulative values over time',
        category: 'chart',
        requiredFields: [
          { name: 'x', types: ['date', 'number'], multiple: false, description: 'X-axis field' },
          { name: 'y', types: ['number', 'integer'], multiple: false, description: 'Y-axis field' }
        ],
        optionalFields: [
          { name: 'stack', types: ['string'], multiple: false, description: 'Stacking field' }
        ],
        complexity: 'moderate'
      },
      {
        name: 'Histogram',
        description: 'Show distribution of numeric values',
        category: 'chart',
        requiredFields: [
          { name: 'value', types: ['number', 'integer'], multiple: false, description: 'Value field' }
        ],
        optionalFields: [
          { name: 'bins', types: ['number'], multiple: false, description: 'Number of bins' }
        ],
        complexity: 'simple'
      }
    ];
  }

  getSupportedDataTypes(): DataType[] {
    return ['string', 'number', 'integer', 'date', 'boolean'];
  }

  getInteractionFeatures(): InteractionFeature[] {
    return [
      {
        name: 'Hover Tooltips',
        description: 'Show data values on hover',
        events: ['hover'],
        configurable: true
      },
      {
        name: 'Click Selection',
        description: 'Select data points by clicking',
        events: ['click', 'select'],
        configurable: true
      },
      {
        name: 'Zoom and Pan',
        description: 'Navigate large datasets',
        events: ['zoom', 'pan'],
        configurable: true
      },
      {
        name: 'Brush Selection',
        description: 'Select ranges of data',
        events: ['brush', 'select'],
        configurable: true
      }
    ];
  }

  // Export and Configuration
  async export(format: ExportFormat): Promise<Blob> {
    if (!this.svg) {
      throw new Error('No chart to export. Render chart first.');
    }

    switch (format) {
      case 'svg':
        return this.exportSvg();
      case 'png':
        return this.exportPng();
      case 'json':
        return this.exportJson();
      default:
        throw new Error(`Export format ${format} not supported`);
    }
  }

  getConfiguration(): VisualizationConfig {
    return this.currentConfig || {} as ObservableChartsConfig;
  }

  async setConfiguration(config: VisualizationConfig): Promise<void> {
    this.currentConfig = { ...this.currentConfig, ...config } as ObservableChartsConfig;
    
    if (this.currentData) {
      await this.renderChart(this.currentData, this.currentConfig);
    }
  }

  // Event Handling
  async onInteraction(event: InteractionEvent): Promise<void> {
    this.context?.eventBus.publish('chart:interaction', {
      plugin: this.getName(),
      event: event.type,
      data: event.data
    });
  }

  getSelectionData(): any[] {
    // Return currently selected data points
    return [];
  }

  async clearSelection(): Promise<void> {
    if (this.svg) {
      this.svg.selectAll('.selected').classed('selected', false);
    }
  }

  // Private Methods
  private async renderChart(data: Dataset, config: ObservableChartsConfig): Promise<void> {
    if (!this.svg) return;

    const { chartSpec, layout } = config;
    
    switch (chartSpec.type) {
      case 'bar':
        await this.renderBarChart(data, config);
        break;
      case 'line':
        await this.renderLineChart(data, config);
        break;
      case 'scatter':
        await this.renderScatterPlot(data, config);
        break;
      case 'area':
        await this.renderAreaChart(data, config);
        break;
      case 'histogram':
        await this.renderHistogram(data, config);
        break;
      default:
        throw new Error(`Chart type ${chartSpec.type} not implemented`);
    }
  }

  private async renderBarChart(data: Dataset, config: ObservableChartsConfig): Promise<void> {
    const svg = this.svg!;
    const { chartSpec, layout, styling } = config;
    
    // Clear previous content
    svg.selectAll('g').remove();
    
    const margin = layout.margin;
    const width = +svg.attr('width') - margin.left - margin.right;
    const height = +svg.attr('height') - margin.top - margin.bottom;
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Get column indices
    const xCol = data.columns.findIndex(col => col.name === chartSpec.x);
    const yCol = data.columns.findIndex(col => col.name === chartSpec.y);
    
    if (xCol === -1 || yCol === -1) {
      throw new Error('Required columns not found');
    }

    // Prepare data
    const chartData = data.rows.map(row => ({
      x: row[xCol],
      y: +row[yCol] || 0
    }));

    // Set up scales
    const xScale = d3.scaleBand()
      .domain(chartData.map(d => String(d.x)))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => d.y) || 0])
      .nice()
      .range([height, 0]);

    // Add axes
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale));

    // Add bars
    g.selectAll('.bar')
      .data(chartData)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(String(d.x)) || 0)
      .attr('width', xScale.bandwidth())
      .attr('y', d => yScale(d.y))
      .attr('height', d => height - yScale(d.y))
      .attr('fill', styling.colors[0] || '#1f77b4')
      .on('mouseover', (event, d) => {
        if (config.enableTooltips) {
          this.showTooltip(event, d);
        }
      })
      .on('mouseout', () => {
        this.hideTooltip();
      });

    // Add title if specified
    if (chartSpec.title) {
      svg.append('text')
        .attr('x', margin.left + width / 2)
        .attr('y', margin.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text(chartSpec.title);
    }
  }

  private async renderLineChart(data: Dataset, config: ObservableChartsConfig): Promise<void> {
    // Implementation for line chart
    // Similar structure to bar chart but using d3.line()
  }

  private async renderScatterPlot(data: Dataset, config: ObservableChartsConfig): Promise<void> {
    // Implementation for scatter plot
  }

  private async renderAreaChart(data: Dataset, config: ObservableChartsConfig): Promise<void> {
    // Implementation for area chart
  }

  private async renderHistogram(data: Dataset, config: ObservableChartsConfig): Promise<void> {
    // Implementation for histogram
  }

  private setupResizeObserver(): void {
    if (!this.container) return;

    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        this.resize({ width, height });
      }
    });

    this.resizeObserver.observe(this.container);
  }

  private showTooltip(event: MouseEvent, data: any): void {
    // Create and show tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'chart-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none');

    tooltip.transition()
      .duration(200)
      .style('opacity', 1);

    tooltip.html(`${data.x}: ${data.y}`)
      .style('left', (event.pageX + 10) + 'px')
      .style('top', (event.pageY - 28) + 'px');
  }

  private hideTooltip(): void {
    d3.selectAll('.chart-tooltip').remove();
  }

  private async exportSvg(): Promise<Blob> {
    const svgElement = this.svg!.node();
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement!);
    return new Blob([svgString], { type: 'image/svg+xml' });
  }

  private async exportPng(): Promise<Blob> {
    const svgBlob = await this.exportSvg();
    const svgUrl = URL.createObjectURL(svgBlob);
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const svgRect = this.svg!.node()!.getBoundingClientRect();
        canvas.width = svgRect.width;
        canvas.height = svgRect.height;
        
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(svgUrl);
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert to PNG'));
          }
        }, 'image/png');
      };
      img.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        reject(new Error('Failed to load SVG'));
      };
      img.src = svgUrl;
    });
  }

  private async exportJson(): Promise<Blob> {
    const exportData = {
      plugin: this.getName(),
      version: this.getVersion(),
      config: this.currentConfig,
      data: this.currentData
    };
    
    return new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  }
}