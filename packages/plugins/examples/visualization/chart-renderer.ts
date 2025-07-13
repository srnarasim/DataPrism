import {
  IVisualizationPlugin,
  Dataset,
  VisualizationType,
  RenderConfig,
  Dimensions,
  InteractionFeature,
  ExportFormat,
  VisualizationConfig,
  InteractionEvent,
  DataType,
  PluginContext,
  PluginCapability,
  PluginManifest,
  PluginDependency
} from '../../src/interfaces/index.js';

/**
 * Chart Renderer Plugin
 * 
 * This plugin demonstrates visualization capabilities including:
 * - Multiple chart types (bar, line, pie, scatter)
 * - Interactive features (zoom, pan, tooltip)
 * - Export capabilities (SVG, PNG, PDF)
 * - Responsive design and theming
 */
export class ChartRendererPlugin implements IVisualizationPlugin {
  private context: PluginContext | null = null;
  private initialized = false;
  private active = false;
  private currentContainer: Element | null = null;
  private currentChart: any = null;
  private currentData: Dataset | null = null;
  private config: VisualizationConfig = {
    chartType: 'bar',
    theme: 'light',
    responsive: true,
    animation: true,
    showLegend: true,
    showTooltips: true
  };

  // Plugin Identity
  getName(): string {
    return 'chart-renderer';
  }

  getVersion(): string {
    return '1.0.0';
  }

  getDescription(): string {
    return 'Advanced chart rendering plugin with multiple chart types and interactive features';
  }

  getAuthor(): string {
    return 'DataPrism Team';
  }

  getDependencies(): PluginDependency[] {
    return [];
  }

  getManifest(): PluginManifest {
    return {
      name: this.getName(),
      version: this.getVersion(),
      description: this.getDescription(),
      author: this.getAuthor(),
      license: 'MIT',
      keywords: ['visualization', 'charts', 'graphs', 'interactive'],
      category: 'visualization',
      entryPoint: './chart-renderer.js',
      dependencies: [],
      permissions: [
        { resource: 'ui', access: 'write' },
        { resource: 'data', access: 'read' }
      ],
      configuration: {
        defaultChartType: {
          type: 'string',
          default: 'bar',
          description: 'Default chart type for new visualizations'
        },
        enableAnimations: {
          type: 'boolean',
          default: true,
          description: 'Enable chart animations'
        },
        colorPalette: {
          type: 'array',
          default: ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6'],
          description: 'Default color palette for charts'
        }
      },
      compatibility: {
        minCoreVersion: '0.1.0',
        browsers: ['chrome', 'firefox', 'safari', 'edge']
      }
    };
  }

  getCapabilities(): PluginCapability[] {
    return [
      {
        name: 'chart-rendering',
        description: 'Render interactive charts from datasets',
        type: 'visualization',
        version: '1.0.0',
        async: true,
        inputTypes: ['application/json'],
        outputTypes: ['text/html']
      },
      {
        name: 'chart-export',
        description: 'Export charts to various formats',
        type: 'utility',
        version: '1.0.0',
        async: true,
        inputTypes: ['text/html'],
        outputTypes: ['image/svg+xml', 'image/png', 'application/pdf']
      },
      {
        name: 'interactive-features',
        description: 'Add interactive features to charts',
        type: 'visualization',
        version: '1.0.0',
        async: false,
        inputTypes: ['text/html'],
        outputTypes: ['text/html']
      }
    ];
  }

  isCompatible(coreVersion: string): boolean {
    return coreVersion >= '0.1.0';
  }

  // Lifecycle Management
  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    this.log('info', 'Initializing Chart Renderer Plugin');
    
    // Load configuration
    const config = this.context.config;
    if (config.defaultChartType) {
      this.config.chartType = config.defaultChartType;
    }
    if (config.enableAnimations !== undefined) {
      this.config.animation = config.enableAnimations;
    }
    
    this.initialized = true;
    this.log('info', 'Chart Renderer Plugin initialized successfully');
  }

  async activate(): Promise<void> {
    if (!this.initialized) {
      throw new Error('Plugin must be initialized before activation');
    }
    
    this.active = true;
    this.log('info', 'Chart Renderer Plugin activated');
    
    // Register event listeners
    this.context?.eventBus.subscribe('data:updated', this.handleDataUpdate.bind(this));
    this.context?.eventBus.subscribe('theme:changed', this.handleThemeChange.bind(this));
  }

  async deactivate(): Promise<void> {
    if (this.currentChart) {
      await this.destroy();
    }
    this.active = false;
    this.log('info', 'Chart Renderer Plugin deactivated');
  }

  async cleanup(): Promise<void> {
    if (this.currentChart) {
      await this.destroy();
    }
    this.context = null;
    this.initialized = false;
    this.active = false;
    this.log('info', 'Chart Renderer Plugin cleaned up');
  }

  // Core Operations
  async execute(operation: string, params: any): Promise<any> {
    if (!this.active) {
      throw new Error('Plugin is not active');
    }

    this.log('debug', `Executing operation: ${operation}`, params);

    switch (operation) {
      case 'render':
        return this.render(params.container, params.data, params.config);
      case 'update':
        return this.update(params.data);
      case 'resize':
        return this.resize(params.dimensions);
      case 'export':
        return this.export(params.format);
      case 'getTypes':
        return this.getVisualizationTypes();
      case 'getConfig':
        return this.getConfiguration();
      case 'setConfig':
        return this.setConfiguration(params.config);
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  async configure(settings: any): Promise<void> {
    this.log('info', 'Updating plugin configuration', settings);
    Object.assign(this.config, settings);
    
    // Apply configuration changes to current chart
    if (this.currentChart && this.currentContainer) {
      await this.update(this.currentData!);
    }
  }

  // Rendering Operations
  async render(container: Element, data: Dataset, config?: RenderConfig): Promise<void> {
    this.log('info', `Rendering chart for dataset: ${data.name}`);
    
    if (!container) {
      throw new Error('Container element is required');
    }

    // Merge configurations
    const renderConfig = { ...this.config, ...config };
    
    // Clear previous content
    container.innerHTML = '';
    
    // Prepare data for visualization
    const chartData = this.prepareChartData(data, renderConfig);
    
    // Create chart container
    const chartContainer = document.createElement('div');
    chartContainer.className = 'dataprism-chart-container';
    chartContainer.style.width = '100%';
    chartContainer.style.height = '100%';
    chartContainer.style.position = 'relative';
    
    // Apply theme
    this.applyTheme(chartContainer, renderConfig.theme || 'light');
    
    // Create chart based on type
    const chart = await this.createChart(chartContainer, chartData, renderConfig);
    
    // Add interactive features
    this.addInteractiveFeatures(chartContainer, chart, renderConfig);
    
    // Add to container
    container.appendChild(chartContainer);
    
    // Store references
    this.currentContainer = container;
    this.currentChart = chart;
    this.currentData = data;
    
    this.log('info', 'Chart rendered successfully');
    this.emit('chart:rendered', { 
      dataset: data.name, 
      chartType: renderConfig.chartType,
      dimensions: { width: container.clientWidth, height: container.clientHeight }
    });
  }

  async update(data: Dataset): Promise<void> {
    if (!this.currentChart || !this.currentContainer) {
      throw new Error('No chart to update');
    }

    this.log('info', `Updating chart with new data: ${data.name}`);
    
    const chartData = this.prepareChartData(data, this.config);
    await this.updateChart(this.currentChart, chartData);
    
    this.currentData = data;
    this.emit('chart:updated', { dataset: data.name });
  }

  async resize(dimensions: Dimensions): Promise<void> {
    if (!this.currentChart || !this.currentContainer) {
      throw new Error('No chart to resize');
    }

    this.log('debug', `Resizing chart to ${dimensions.width}x${dimensions.height}`);
    
    await this.resizeChart(this.currentChart, dimensions);
    this.emit('chart:resized', dimensions);
  }

  async destroy(): Promise<void> {
    if (this.currentChart) {
      this.log('debug', 'Destroying current chart');
      
      // Clean up chart resources
      await this.destroyChart(this.currentChart);
      
      this.currentChart = null;
      this.currentContainer = null;
      this.currentData = null;
      
      this.emit('chart:destroyed', {});
    }
  }

  // Visualization Capabilities
  getVisualizationTypes(): VisualizationType[] {
    return [
      {
        name: 'bar',
        description: 'Bar chart for categorical data comparison',
        category: 'chart',
        requiredFields: ['category', 'value'],
        optionalFields: ['series', 'color'],
        preview: this.generatePreviewSVG('bar')
      },
      {
        name: 'line',
        description: 'Line chart for trend analysis over time',
        category: 'chart',
        requiredFields: ['x', 'y'],
        optionalFields: ['series', 'color'],
        preview: this.generatePreviewSVG('line')
      },
      {
        name: 'pie',
        description: 'Pie chart for proportion visualization',
        category: 'chart',
        requiredFields: ['label', 'value'],
        optionalFields: ['color'],
        preview: this.generatePreviewSVG('pie')
      },
      {
        name: 'scatter',
        description: 'Scatter plot for correlation analysis',
        category: 'chart',
        requiredFields: ['x', 'y'],
        optionalFields: ['size', 'color', 'label'],
        preview: this.generatePreviewSVG('scatter')
      },
      {
        name: 'heatmap',
        description: 'Heatmap for matrix data visualization',
        category: 'chart',
        requiredFields: ['x', 'y', 'value'],
        optionalFields: ['color'],
        preview: this.generatePreviewSVG('heatmap')
      }
    ];
  }

  getSupportedDataTypes(): DataType[] {
    return [
      { name: 'number', description: 'Numeric values for axes and measurements' },
      { name: 'string', description: 'Text labels for categories and series' },
      { name: 'date', description: 'Date/time values for temporal charts' },
      { name: 'boolean', description: 'Binary values for conditional styling' }
    ];
  }

  getInteractionFeatures(): InteractionFeature[] {
    return [
      {
        name: 'tooltip',
        description: 'Show data values on hover',
        events: ['mouseover', 'mouseout']
      },
      {
        name: 'zoom',
        description: 'Zoom in/out on chart areas',
        events: ['wheel', 'dblclick']
      },
      {
        name: 'pan',
        description: 'Pan across chart data',
        events: ['mousedown', 'mousemove', 'mouseup']
      },
      {
        name: 'selection',
        description: 'Select data points or ranges',
        events: ['click', 'drag']
      },
      {
        name: 'brush',
        description: 'Brush selection for filtering',
        events: ['mousedown', 'mousemove', 'mouseup']
      }
    ];
  }

  // Export and Configuration
  async export(format: ExportFormat): Promise<Blob> {
    if (!this.currentChart || !this.currentContainer) {
      throw new Error('No chart to export');
    }

    this.log('info', `Exporting chart as ${format}`);

    switch (format) {
      case 'svg':
        return this.exportAsSVG();
      case 'png':
        return this.exportAsPNG();
      case 'pdf':
        return this.exportAsPDF();
      case 'html':
        return this.exportAsHTML();
      case 'json':
        return this.exportAsJSON();
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  getConfiguration(): VisualizationConfig {
    return { ...this.config };
  }

  async setConfiguration(config: VisualizationConfig): Promise<void> {
    this.config = { ...this.config, ...config };
    
    if (this.currentChart && this.currentData) {
      await this.update(this.currentData);
    }
    
    this.emit('config:changed', this.config);
  }

  // Helper Methods
  private prepareChartData(data: Dataset, config: any): any {
    const chartData = {
      raw: data.data,
      processed: [],
      schema: data.schema,
      metadata: data.metadata
    };

    // Process data based on chart type
    switch (config.chartType) {
      case 'bar':
        chartData.processed = this.prepareBarData(data.data);
        break;
      case 'line':
        chartData.processed = this.prepareLineData(data.data);
        break;
      case 'pie':
        chartData.processed = this.preparePieData(data.data);
        break;
      case 'scatter':
        chartData.processed = this.prepareScatterData(data.data);
        break;
      case 'heatmap':
        chartData.processed = this.prepareHeatmapData(data.data);
        break;
      default:
        chartData.processed = data.data;
    }

    return chartData;
  }

  private async createChart(container: Element, data: any, config: any): Promise<any> {
    // This is a simplified implementation
    // In a real plugin, you would use a charting library like D3.js, Chart.js, etc.
    
    const chart = {
      type: config.chartType,
      container,
      data,
      config,
      elements: []
    };

    // Create basic chart structure
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', '0 0 800 600');
    
    // Add chart elements based on type
    switch (config.chartType) {
      case 'bar':
        this.createBarChart(svg, data, config);
        break;
      case 'line':
        this.createLineChart(svg, data, config);
        break;
      case 'pie':
        this.createPieChart(svg, data, config);
        break;
      case 'scatter':
        this.createScatterChart(svg, data, config);
        break;
      default:
        this.createBarChart(svg, data, config); // fallback
    }
    
    container.appendChild(svg);
    chart.elements.push(svg);
    
    return chart;
  }

  private createBarChart(svg: SVGElement, data: any, config: any): void {
    // Simplified bar chart implementation
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
    
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${margin.left},${margin.top})`);
    
    // Create bars (simplified)
    data.processed.forEach((d: any, i: number) => {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      const barWidth = width / data.processed.length - 10;
      const barHeight = (d.value / 100) * height; // simplified scaling
      
      rect.setAttribute('x', (i * (barWidth + 10)).toString());
      rect.setAttribute('y', (height - barHeight).toString());
      rect.setAttribute('width', barWidth.toString());
      rect.setAttribute('height', barHeight.toString());
      rect.setAttribute('fill', config.colorPalette?.[i % 5] || '#3498db');
      
      g.appendChild(rect);
    });
    
    svg.appendChild(g);
  }

  private createLineChart(svg: SVGElement, data: any, config: any): void {
    // Simplified line chart implementation
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
    
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${margin.left},${margin.top})`);
    
    // Create line path (simplified)
    if (data.processed.length > 1) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      let pathData = '';
      
      data.processed.forEach((d: any, i: number) => {
        const x = (i / (data.processed.length - 1)) * width;
        const y = height - (d.value / 100) * height; // simplified scaling
        
        if (i === 0) {
          pathData += `M ${x} ${y}`;
        } else {
          pathData += ` L ${x} ${y}`;
        }
      });
      
      path.setAttribute('d', pathData);
      path.setAttribute('stroke', config.colorPalette?.[0] || '#3498db');
      path.setAttribute('stroke-width', '2');
      path.setAttribute('fill', 'none');
      
      g.appendChild(path);
    }
    
    svg.appendChild(g);
  }

  private createPieChart(svg: SVGElement, data: any, config: any): void {
    // Simplified pie chart implementation
    const centerX = 400;
    const centerY = 300;
    const radius = 150;
    
    const total = data.processed.reduce((sum: number, d: any) => sum + d.value, 0);
    let currentAngle = 0;
    
    data.processed.forEach((d: any, i: number) => {
      const sliceAngle = (d.value / total) * 2 * Math.PI;
      const endAngle = currentAngle + sliceAngle;
      
      const x1 = centerX + radius * Math.cos(currentAngle);
      const y1 = centerY + radius * Math.sin(currentAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);
      
      const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
      
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
      
      path.setAttribute('d', pathData);
      path.setAttribute('fill', config.colorPalette?.[i % 5] || '#3498db');
      path.setAttribute('stroke', '#fff');
      path.setAttribute('stroke-width', '2');
      
      svg.appendChild(path);
      
      currentAngle = endAngle;
    });
  }

  private createScatterChart(svg: SVGElement, data: any, config: any): void {
    // Simplified scatter chart implementation
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
    
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${margin.left},${margin.top})`);
    
    data.processed.forEach((d: any, i: number) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      const cx = (d.x / 100) * width; // simplified scaling
      const cy = height - (d.y / 100) * height; // simplified scaling
      
      circle.setAttribute('cx', cx.toString());
      circle.setAttribute('cy', cy.toString());
      circle.setAttribute('r', '5');
      circle.setAttribute('fill', config.colorPalette?.[0] || '#3498db');
      circle.setAttribute('opacity', '0.7');
      
      g.appendChild(circle);
    });
    
    svg.appendChild(g);
  }

  private prepareBarData(data: any[]): any[] {
    return data.map(row => ({
      category: row.category || row.name || row.label,
      value: Number(row.value || row.count || row.amount || 0)
    }));
  }

  private prepareLineData(data: any[]): any[] {
    return data.map(row => ({
      x: row.x || row.date || row.time,
      y: Number(row.y || row.value || 0)
    }));
  }

  private preparePieData(data: any[]): any[] {
    return data.map(row => ({
      label: row.label || row.category || row.name,
      value: Number(row.value || row.count || row.amount || 0)
    }));
  }

  private prepareScatterData(data: any[]): any[] {
    return data.map(row => ({
      x: Number(row.x || 0),
      y: Number(row.y || 0),
      label: row.label || row.name
    }));
  }

  private prepareHeatmapData(data: any[]): any[] {
    return data.map(row => ({
      x: row.x,
      y: row.y,
      value: Number(row.value || 0)
    }));
  }

  private addInteractiveFeatures(container: Element, chart: any, config: any): void {
    if (!config.interaction) return;
    
    // Add tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'chart-tooltip';
    tooltip.style.position = 'absolute';
    tooltip.style.display = 'none';
    tooltip.style.background = '#333';
    tooltip.style.color = '#fff';
    tooltip.style.padding = '8px';
    tooltip.style.borderRadius = '4px';
    tooltip.style.fontSize = '12px';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.zIndex = '1000';
    
    container.appendChild(tooltip);
    
    // Add mouse event listeners
    container.addEventListener('mouseover', (event) => {
      const target = event.target as Element;
      if (target.tagName === 'rect' || target.tagName === 'circle' || target.tagName === 'path') {
        tooltip.style.display = 'block';
        tooltip.innerHTML = 'Data point'; // simplified
      }
    });
    
    container.addEventListener('mouseout', () => {
      tooltip.style.display = 'none';
    });
    
    container.addEventListener('mousemove', (event) => {
      if (tooltip.style.display === 'block') {
        tooltip.style.left = (event.clientX + 10) + 'px';
        tooltip.style.top = (event.clientY - 10) + 'px';
      }
    });
  }

  private async updateChart(chart: any, data: any): Promise<void> {
    // In a real implementation, this would update the chart with new data
    // For this example, we'll just re-render
    if (chart.container && this.currentContainer) {
      await this.render(this.currentContainer, this.currentData!, this.config);
    }
  }

  private async resizeChart(chart: any, dimensions: Dimensions): Promise<void> {
    // Update chart dimensions
    const svg = chart.elements[0] as SVGElement;
    if (svg) {
      svg.setAttribute('viewBox', `0 0 ${dimensions.width} ${dimensions.height}`);
    }
  }

  private async destroyChart(chart: any): Promise<void> {
    // Clean up chart elements
    chart.elements.forEach((element: Element) => {
      element.remove();
    });
    chart.elements = [];
  }

  private applyTheme(container: Element, theme: string): void {
    const element = container as HTMLElement;
    element.classList.add(`theme-${theme}`);
    
    if (theme === 'dark') {
      element.style.backgroundColor = '#2c3e50';
      element.style.color = '#ecf0f1';
    } else {
      element.style.backgroundColor = '#ffffff';
      element.style.color = '#2c3e50';
    }
  }

  private generatePreviewSVG(chartType: string): string {
    // Generate base64 encoded SVG preview for chart type
    const svg = `<svg width="100" height="80" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="80" fill="#f8f9fa"/>
      <text x="50" y="40" text-anchor="middle" font-size="12" fill="#6c757d">${chartType}</text>
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  private async exportAsSVG(): Promise<Blob> {
    const svg = this.currentChart?.elements[0] as SVGElement;
    if (!svg) throw new Error('No SVG to export');
    
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    return new Blob([svgString], { type: 'image/svg+xml' });
  }

  private async exportAsPNG(): Promise<Blob> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 800;
    canvas.height = 600;
    
    // Convert SVG to canvas (simplified)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    ctx.font = '16px Arial';
    ctx.fillText('Chart Export (PNG)', 50, 50);
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png');
    });
  }

  private async exportAsPDF(): Promise<Blob> {
    // Simplified PDF export
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
>>
endobj

xref
0 4
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000173 00000 n 
trailer
<<
/Size 4
/Root 1 0 R
>>
startxref
250
%%EOF`;
    
    return new Blob([pdfContent], { type: 'application/pdf' });
  }

  private async exportAsHTML(): Promise<Blob> {
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Chart Export</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .chart-container { width: 100%; height: 600px; border: 1px solid #ddd; }
  </style>
</head>
<body>
  <h1>Exported Chart</h1>
  <div class="chart-container">
    ${this.currentContainer?.innerHTML || ''}
  </div>
</body>
</html>`;
    
    return new Blob([html], { type: 'text/html' });
  }

  private async exportAsJSON(): Promise<Blob> {
    const exportData = {
      chart: {
        type: this.config.chartType,
        config: this.config
      },
      data: this.currentData,
      metadata: {
        exportedAt: new Date().toISOString(),
        plugin: this.getName(),
        version: this.getVersion()
      }
    };
    
    return new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  }

  private handleDataUpdate(data: any): void {
    this.log('debug', 'Data update event received', data);
    if (this.currentChart && data.dataset === this.currentData?.name) {
      this.update(data.dataset);
    }
  }

  private handleThemeChange(theme: any): void {
    this.log('debug', 'Theme change event received', theme);
    if (this.currentContainer) {
      this.applyTheme(this.currentContainer, theme.name);
    }
  }

  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: any[]): void {
    if (this.context?.logger) {
      this.context.logger[level](message, ...args);
    } else {
      console[level](`[${this.getName()}]`, message, ...args);
    }
  }

  private emit(event: string, data: any): void {
    if (this.context?.eventBus) {
      this.context.eventBus.publish(`plugin:${this.getName()}:${event}`, data);
    }
  }
}

// Plugin manifest for auto-discovery
export const manifest: PluginManifest = {
  name: 'chart-renderer',
  version: '1.0.0',
  description: 'Advanced chart rendering plugin with multiple chart types and interactive features',
  author: 'DataPrism Team',
  license: 'MIT',
  keywords: ['visualization', 'charts', 'graphs', 'interactive'],
  category: 'visualization',
  entryPoint: './chart-renderer.js',
  dependencies: [],
  permissions: [
    { resource: 'ui', access: 'write' },
    { resource: 'data', access: 'read' }
  ],
  configuration: {
    defaultChartType: {
      type: 'string',
      default: 'bar',
      description: 'Default chart type for new visualizations'
    },
    enableAnimations: {
      type: 'boolean',
      default: true,
      description: 'Enable chart animations'
    }
  },
  compatibility: {
    minCoreVersion: '0.1.0',
    browsers: ['chrome', 'firefox', 'safari', 'edge']
  }
};

export default ChartRendererPlugin;