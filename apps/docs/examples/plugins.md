# Plugin Examples

Learn how to develop, integrate, and use plugins with DataPrism Core through practical examples and real-world use cases.

## Overview

This section demonstrates:
- Creating custom plugins from scratch
- Integrating existing plugins
- Plugin development patterns
- Testing and debugging plugins
- Performance optimization for plugins
- Real-world plugin implementations

## Basic Plugin Development

### Simple Data Processor Plugin

```typescript
import { DataPrismPlugin, PluginContext } from '@dataprism/plugin-framework';

export class TextAnalyzerPlugin implements DataPrismPlugin {
  readonly name = 'text-analyzer';
  readonly version = '1.0.0';
  readonly description = 'Analyzes text data for insights';
  readonly capabilities = ['data_processing'];
  
  private context: PluginContext;
  
  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    
    // Register plugin actions
    this.context.registerAction('analyze_text', this.analyzeText.bind(this));
    this.context.registerAction('extract_keywords', this.extractKeywords.bind(this));
    this.context.registerAction('sentiment_analysis', this.sentimentAnalysis.bind(this));
    
    this.context.log('info', 'Text Analyzer Plugin initialized');
  }
  
  async execute(action: string, params: any): Promise<any> {
    switch (action) {
      case 'analyze_text':
        return this.analyzeText(params);
      case 'extract_keywords':
        return this.extractKeywords(params);
      case 'sentiment_analysis':
        return this.sentimentAnalysis(params);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }
  
  async dispose(): Promise<void> {
    this.context.log('info', 'Text Analyzer Plugin disposed');
  }
  
  private async analyzeText(params: any): Promise<any> {
    const { text, options = {} } = params;
    
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid text input');
    }
    
    const analysis = {
      wordCount: this.countWords(text),
      characterCount: text.length,
      sentences: this.countSentences(text),
      readabilityScore: this.calculateReadability(text),
      topWords: this.getTopWords(text, options.topWordsCount || 10),
      sentiment: await this.analyzeSentiment(text),
      language: this.detectLanguage(text)
    };
    
    return {
      text: text.substring(0, 100) + '...',
      analysis,
      timestamp: Date.now()
    };
  }
  
  private async extractKeywords(params: any): Promise<any> {
    const { text, maxKeywords = 10 } = params;
    
    // Simple keyword extraction (in real implementation, use NLP libraries)
    const words = text.toLowerCase().split(/\W+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    
    const wordFreq = new Map<string, number>();
    
    words.forEach(word => {
      if (word.length > 2 && !stopWords.has(word)) {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      }
    });
    
    const keywords = Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxKeywords)
      .map(([word, freq]) => ({ word, frequency: freq }));
    
    return {
      keywords,
      totalWords: words.length,
      uniqueWords: wordFreq.size
    };
  }
  
  private async sentimentAnalysis(params: any): Promise<any> {
    const { text } = params;
    
    // Simple sentiment analysis (in real implementation, use ML models)
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'disappointing', 'poor'];
    
    const words = text.toLowerCase().split(/\W+/);
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });
    
    const sentiment = positiveCount > negativeCount ? 'positive' : 
                     negativeCount > positiveCount ? 'negative' : 'neutral';
    
    return {
      sentiment,
      confidence: Math.abs(positiveCount - negativeCount) / words.length,
      positiveWords: positiveCount,
      negativeWords: negativeCount,
      totalWords: words.length
    };
  }
  
  private countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }
  
  private countSentences(text: string): number {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  }
  
  private calculateReadability(text: string): number {
    const sentences = this.countSentences(text);
    const words = this.countWords(text);
    const characters = text.length;
    
    // Simplified readability score
    return Math.max(0, 206.835 - 1.015 * (words / sentences) - 84.6 * (characters / words));
  }
  
  private getTopWords(text: string, count: number): any[] {
    const words = text.toLowerCase().split(/\W+/);
    const wordFreq = new Map<string, number>();
    
    words.forEach(word => {
      if (word.length > 2) {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      }
    });
    
    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([word, freq]) => ({ word, frequency: freq }));
  }
  
  private analyzeSentiment(text: string): string {
    // Simplified sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'amazing'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible'];
    
    const words = text.toLowerCase().split(/\W+/);
    let score = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score++;
      if (negativeWords.includes(word)) score--;
    });
    
    return score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral';
  }
  
  private detectLanguage(text: string): string {
    // Simplified language detection
    const commonEnglishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const words = text.toLowerCase().split(/\W+/);
    
    const englishWordCount = words.filter(word => commonEnglishWords.includes(word)).length;
    const confidence = englishWordCount / words.length;
    
    return confidence > 0.1 ? 'english' : 'unknown';
  }
}
```

### Using the Text Analyzer Plugin

```typescript
import { DataPrismEngine } from '@dataprism/core';
import { TextAnalyzerPlugin } from './text-analyzer-plugin';

async function useTextAnalyzer() {
  const engine = new DataPrismEngine();
  await engine.initialize();
  
  // Register the plugin
  const textPlugin = new TextAnalyzerPlugin();
  await engine.registerPlugin(textPlugin);
  
  // Sample text data
  const textData = [
    { id: 1, content: "This is an amazing product! I love it so much. Great quality and fantastic service." },
    { id: 2, content: "Terrible experience. The product was broken and customer service was awful." },
    { id: 3, content: "Good product overall. Some minor issues but generally satisfied with the purchase." }
  ];
  
  // Load data
  await engine.loadData(textData, 'reviews');
  
  // Analyze each text
  const analyses = [];
  for (const review of textData) {
    const analysis = await engine.executePlugin('text-analyzer', 'analyze_text', {
      text: review.content,
      options: { topWordsCount: 5 }
    });
    
    analyses.push({
      id: review.id,
      ...analysis
    });
  }
  
  // Extract keywords from all reviews
  const allText = textData.map(r => r.content).join(' ');
  const keywords = await engine.executePlugin('text-analyzer', 'extract_keywords', {
    text: allText,
    maxKeywords: 15
  });
  
  console.log('Text Analyses:', analyses);
  console.log('Keywords:', keywords);
  
  // Store results in database
  await engine.loadData(analyses, 'text_analysis_results');
  
  // Query insights
  const insights = await engine.query(`
    SELECT 
      AVG(CAST(JSON_EXTRACT(analysis, '$.readabilityScore') AS FLOAT)) as avg_readability,
      AVG(CAST(JSON_EXTRACT(analysis, '$.wordCount') AS FLOAT)) as avg_word_count,
      AVG(CAST(JSON_EXTRACT(analysis, '$.sentiment.confidence') AS FLOAT)) as avg_sentiment_confidence,
      COUNT(*) as total_reviews
    FROM text_analysis_results
  `);
  
  return {
    analyses,
    keywords,
    insights: insights.data[0]
  };
}
```

## Advanced Plugin Development

### Custom Visualization Plugin

```typescript
import { VisualizationPlugin, PluginContext } from '@dataprism/plugin-framework';

export class CustomChartPlugin implements VisualizationPlugin {
  readonly name = 'custom-charts';
  readonly version = '2.0.0';
  readonly description = 'Advanced custom chart visualizations';
  readonly capabilities = ['visualization'];
  
  private context: PluginContext;
  private charts: Map<string, any> = new Map();
  
  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    
    // Load chart libraries
    await this.loadChartLibraries();
    
    // Register chart types
    this.context.registerChartType('heatmap', this.createHeatmap.bind(this));
    this.context.registerChartType('treemap', this.createTreemap.bind(this));
    this.context.registerChartType('sankey', this.createSankeyDiagram.bind(this));
    this.context.registerChartType('network', this.createNetworkGraph.bind(this));
    
    this.context.log('info', 'Custom Charts Plugin initialized');
  }
  
  async execute(action: string, params: any): Promise<any> {
    switch (action) {
      case 'create_chart':
        return this.createChart(params);
      case 'update_chart':
        return this.updateChart(params);
      case 'export_chart':
        return this.exportChart(params);
      case 'get_chart_types':
        return this.getChartTypes();
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }
  
  async dispose(): Promise<void> {
    // Clean up all charts
    this.charts.forEach(chart => {
      if (chart.destroy) {
        chart.destroy();
      }
    });
    this.charts.clear();
    
    this.context.log('info', 'Custom Charts Plugin disposed');
  }
  
  private async loadChartLibraries(): Promise<void> {
    // Load D3.js and other chart libraries
    if (typeof window !== 'undefined' && !window.d3) {
      await this.loadScript('https://d3js.org/d3.v7.min.js');
    }
  }
  
  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  
  private async createChart(params: any): Promise<HTMLElement> {
    const { type, data, config, container } = params;
    
    let element: HTMLElement;
    
    switch (type) {
      case 'heatmap':
        element = await this.createHeatmap(container, data, config);
        break;
      case 'treemap':
        element = await this.createTreemap(container, data, config);
        break;
      case 'sankey':
        element = await this.createSankeyDiagram(container, data, config);
        break;
      case 'network':
        element = await this.createNetworkGraph(container, data, config);
        break;
      default:
        throw new Error(`Unsupported chart type: ${type}`);
    }
    
    // Store chart reference
    const chartId = this.generateChartId();
    this.charts.set(chartId, { element, type, data, config });
    element.setAttribute('data-chart-id', chartId);
    
    return element;
  }
  
  private async createHeatmap(container: HTMLElement, data: any[], config: any): Promise<HTMLElement> {
    const { width = 800, height = 600, colorScheme = 'viridis' } = config;
    
    // Create SVG container
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width.toString());
    svg.setAttribute('height', height.toString());
    svg.setAttribute('class', 'heatmap-chart');
    
    if (typeof window !== 'undefined' && window.d3) {
      const d3 = window.d3;
      
      // Create heatmap using D3
      const margin = { top: 20, right: 20, bottom: 60, left: 60 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;
      
      const d3svg = d3.select(svg);
      const g = d3svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
      
      // Get unique x and y values
      const xValues = Array.from(new Set(data.map(d => d.x))).sort();
      const yValues = Array.from(new Set(data.map(d => d.y))).sort();
      
      // Create scales
      const xScale = d3.scaleBand()
        .domain(xValues)
        .range([0, innerWidth])
        .padding(0.1);
      
      const yScale = d3.scaleBand()
        .domain(yValues)
        .range([0, innerHeight])
        .padding(0.1);
      
      const colorScale = d3.scaleSequential(d3.interpolateViridis)
        .domain(d3.extent(data, d => d.value));
      
      // Create heatmap cells
      g.selectAll('rect')
        .data(data)
        .enter().append('rect')
        .attr('x', d => xScale(d.x))
        .attr('y', d => yScale(d.y))
        .attr('width', xScale.bandwidth())
        .attr('height', yScale.bandwidth())
        .attr('fill', d => colorScale(d.value))
        .attr('class', 'heatmap-cell')
        .on('mouseover', function(event, d) {
          // Show tooltip
          const tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);
          
          tooltip.html(`X: ${d.x}<br>Y: ${d.y}<br>Value: ${d.value}`)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px')
            .transition()
            .duration(200)
            .style('opacity', 0.9);
        })
        .on('mouseout', function() {
          d3.selectAll('.tooltip').remove();
        });
      
      // Add axes
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale));
      
      g.append('g')
        .call(d3.axisLeft(yScale));
      
      // Add labels
      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - (innerHeight / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text(config.yLabel || 'Y Axis');
      
      g.append('text')
        .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + margin.bottom})`)
        .style('text-anchor', 'middle')
        .text(config.xLabel || 'X Axis');
    }
    
    container.appendChild(svg);
    return svg;
  }
  
  private async createTreemap(container: HTMLElement, data: any[], config: any): Promise<HTMLElement> {
    const { width = 800, height = 600 } = config;
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width.toString());
    svg.setAttribute('height', height.toString());
    svg.setAttribute('class', 'treemap-chart');
    
    if (typeof window !== 'undefined' && window.d3) {
      const d3 = window.d3;
      
      // Transform data to hierarchy
      const hierarchy = d3.hierarchy({ children: data })
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);
      
      // Create treemap layout
      const treemap = d3.treemap()
        .size([width, height])
        .padding(1);
      
      treemap(hierarchy);
      
      const d3svg = d3.select(svg);
      
      // Create rectangles
      const cell = d3svg.selectAll('g')
        .data(hierarchy.leaves())
        .enter().append('g')
        .attr('transform', d => `translate(${d.x0},${d.y0})`);
      
      cell.append('rect')
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .attr('fill', (d, i) => d3.schemeCategory10[i % 10])
        .attr('class', 'treemap-cell');
      
      cell.append('text')
        .attr('x', 4)
        .attr('y', 14)
        .text(d => d.data.name)
        .attr('font-size', '12px')
        .attr('fill', 'white');
    }
    
    container.appendChild(svg);
    return svg;
  }
  
  private async createSankeyDiagram(container: HTMLElement, data: any[], config: any): Promise<HTMLElement> {
    const { width = 800, height = 600 } = config;
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width.toString());
    svg.setAttribute('height', height.toString());
    svg.setAttribute('class', 'sankey-chart');
    
    // Sankey diagram implementation would go here
    // This is a placeholder for the actual implementation
    
    container.appendChild(svg);
    return svg;
  }
  
  private async createNetworkGraph(container: HTMLElement, data: any[], config: any): Promise<HTMLElement> {
    const { width = 800, height = 600 } = config;
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width.toString());
    svg.setAttribute('height', height.toString());
    svg.setAttribute('class', 'network-chart');
    
    if (typeof window !== 'undefined' && window.d3) {
      const d3 = window.d3;
      
      // Create force simulation
      const simulation = d3.forceSimulation(data.nodes)
        .force('link', d3.forceLink(data.links).id(d => d.id))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2));
      
      const d3svg = d3.select(svg);
      
      // Create links
      const link = d3svg.append('g')
        .selectAll('line')
        .data(data.links)
        .enter().append('line')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', d => Math.sqrt(d.value));
      
      // Create nodes
      const node = d3svg.append('g')
        .selectAll('circle')
        .data(data.nodes)
        .enter().append('circle')
        .attr('r', 5)
        .attr('fill', d => d3.schemeCategory10[d.group])
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended));
      
      // Add labels
      const label = d3svg.append('g')
        .selectAll('text')
        .data(data.nodes)
        .enter().append('text')
        .text(d => d.name)
        .attr('font-size', '12px')
        .attr('dx', 8)
        .attr('dy', 4);
      
      // Update positions on simulation tick
      simulation.on('tick', () => {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);
        
        node
          .attr('cx', d => d.x)
          .attr('cy', d => d.y);
        
        label
          .attr('x', d => d.x)
          .attr('y', d => d.y);
      });
      
      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
      
      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }
      
      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
    }
    
    container.appendChild(svg);
    return svg;
  }
  
  private generateChartId(): string {
    return 'chart-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
  
  private getChartTypes(): string[] {
    return ['heatmap', 'treemap', 'sankey', 'network'];
  }
  
  private async updateChart(params: any): Promise<void> {
    const { chartId, data, config } = params;
    const chart = this.charts.get(chartId);
    
    if (!chart) {
      throw new Error(`Chart not found: ${chartId}`);
    }
    
    // Update chart with new data
    // Implementation depends on chart type
  }
  
  private async exportChart(params: any): Promise<string> {
    const { chartId, format = 'png' } = params;
    const chart = this.charts.get(chartId);
    
    if (!chart) {
      throw new Error(`Chart not found: ${chartId}`);
    }
    
    // Export chart as image or data
    // Implementation depends on format
    return 'data:image/png;base64,...';
  }
}
```

## Plugin Integration Examples

### Using Multiple Plugins Together

```typescript
async function multiPluginWorkflow() {
  const engine = new DataPrismEngine();
  await engine.initialize();
  
  // Register multiple plugins
  const textPlugin = new TextAnalyzerPlugin();
  const chartPlugin = new CustomChartPlugin();
  const csvPlugin = new CSVProcessorPlugin();
  
  await engine.registerPlugin(textPlugin);
  await engine.registerPlugin(chartPlugin);
  await engine.registerPlugin(csvPlugin);
  
  // Load and process CSV data
  const csvData = `id,comment,rating,category
1,"Great product! Love it!",5,electronics
2,"Not bad, could be better",3,electronics
3,"Excellent service and quality",5,service
4,"Poor quality, disappointed",1,electronics
5,"Amazing experience overall",5,service`;
  
  const processedData = await engine.executePlugin('csv-processor', 'process', {
    data: csvData.split('\n').slice(1), // Skip header
    options: {
      delimiter: ',',
      hasHeader: true
    }
  });
  
  // Analyze text in comments
  const textAnalyses = [];
  for (const row of processedData.data) {
    const analysis = await engine.executePlugin('text-analyzer', 'analyze_text', {
      text: row.comment,
      options: { topWordsCount: 3 }
    });
    
    textAnalyses.push({
      id: row.id,
      comment: row.comment,
      rating: parseInt(row.rating),
      category: row.category,
      sentiment: analysis.analysis.sentiment,
      wordCount: analysis.analysis.wordCount,
      readability: analysis.analysis.readabilityScore
    });
  }
  
  // Load analyzed data
  await engine.loadData(textAnalyses, 'analyzed_comments');
  
  // Create visualizations
  const sentimentData = await engine.query(`
    SELECT 
      sentiment,
      COUNT(*) as count,
      AVG(rating) as avg_rating
    FROM analyzed_comments
    GROUP BY sentiment
  `);
  
  const categoryData = await engine.query(`
    SELECT 
      category,
      AVG(rating) as avg_rating,
      COUNT(*) as count
    FROM analyzed_comments
    GROUP BY category
  `);
  
  // Create charts
  const container = document.getElementById('charts-container');
  
  // Sentiment heatmap
  const sentimentChart = await engine.executePlugin('custom-charts', 'create_chart', {
    type: 'heatmap',
    data: sentimentData.data.map(d => ({
      x: d.sentiment,
      y: 'Rating',
      value: d.avg_rating
    })),
    config: {
      width: 400,
      height: 300,
      xLabel: 'Sentiment',
      yLabel: 'Average Rating'
    },
    container: container
  });
  
  // Category treemap
  const categoryChart = await engine.executePlugin('custom-charts', 'create_chart', {
    type: 'treemap',
    data: categoryData.data.map(d => ({
      name: d.category,
      value: d.count
    })),
    config: {
      width: 400,
      height: 300
    },
    container: container
  });
  
  return {
    processedData: processedData.data,
    textAnalyses,
    sentimentData: sentimentData.data,
    categoryData: categoryData.data,
    charts: [sentimentChart, categoryChart]
  };
}
```

### Plugin Configuration and Management

```typescript
class PluginManager {
  private engine: DataPrismEngine;
  private pluginConfigs: Map<string, any> = new Map();
  
  constructor() {
    this.engine = new DataPrismEngine();
  }
  
  async initialize() {
    await this.engine.initialize();
    await this.loadPluginConfigurations();
  }
  
  async loadPluginConfigurations() {
    // Load plugin configurations from file or API
    const configs = {
      'text-analyzer': {
        maxConcurrentAnalyses: 5,
        cacheResults: true,
        languages: ['english', 'spanish', 'french']
      },
      'custom-charts': {
        defaultTheme: 'light',
        animationDuration: 300,
        maxDataPoints: 10000
      }
    };
    
    for (const [pluginName, config] of Object.entries(configs)) {
      this.pluginConfigs.set(pluginName, config);
    }
  }
  
  async registerPlugin(plugin: any) {
    await this.engine.registerPlugin(plugin);
    
    // Configure plugin if config exists
    const config = this.pluginConfigs.get(plugin.name);
    if (config && plugin.configure) {
      await plugin.configure(config);
    }
  }
  
  async executePluginWithRetry(pluginName: string, action: string, params: any, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.engine.executePlugin(pluginName, action, params);
      } catch (error) {
        lastError = error;
        
        if (attempt < maxRetries) {
          console.warn(`Plugin ${pluginName} action ${action} failed (attempt ${attempt}/${maxRetries}):`, error.message);
          await this.delay(1000 * attempt); // Exponential backoff
        }
      }
    }
    
    throw new Error(`Plugin ${pluginName} action ${action} failed after ${maxRetries} attempts: ${lastError.message}`);
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async getPluginStatus(pluginName: string) {
    try {
      const status = await this.engine.executePlugin(pluginName, 'get_status', {});
      return {
        name: pluginName,
        status: 'active',
        ...status
      };
    } catch (error) {
      return {
        name: pluginName,
        status: 'error',
        error: error.message
      };
    }
  }
  
  async getAllPluginStatuses() {
    const plugins = this.engine.listPlugins();
    const statuses = await Promise.all(
      plugins.map(plugin => this.getPluginStatus(plugin.name))
    );
    
    return statuses;
  }
}
```

## Plugin Testing Examples

### Unit Testing for Plugins

```typescript
// test/text-analyzer.test.ts
import { describe, it, expect, beforeEach } from 'jest';
import { TextAnalyzerPlugin } from '../src/text-analyzer-plugin';
import { MockPluginContext } from '@dataprism/testing';

describe('TextAnalyzerPlugin', () => {
  let plugin: TextAnalyzerPlugin;
  let context: MockPluginContext;
  
  beforeEach(async () => {
    plugin = new TextAnalyzerPlugin();
    context = new MockPluginContext();
    await plugin.initialize(context);
  });
  
  describe('analyze_text action', () => {
    it('should analyze text correctly', async () => {
      const text = "This is a great product! I love it so much.";
      
      const result = await plugin.execute('analyze_text', {
        text,
        options: { topWordsCount: 3 }
      });
      
      expect(result).toHaveProperty('analysis');
      expect(result.analysis).toHaveProperty('wordCount');
      expect(result.analysis).toHaveProperty('sentiment');
      expect(result.analysis.wordCount).toBe(10);
      expect(result.analysis.sentiment).toBe('positive');
    });
    
    it('should handle empty text', async () => {
      await expect(plugin.execute('analyze_text', { text: '' }))
        .rejects.toThrow('Invalid text input');
    });
    
    it('should handle non-string input', async () => {
      await expect(plugin.execute('analyze_text', { text: 123 }))
        .rejects.toThrow('Invalid text input');
    });
  });
  
  describe('extract_keywords action', () => {
    it('should extract keywords correctly', async () => {
      const text = "The quick brown fox jumps over the lazy dog. The fox is quick and brown.";
      
      const result = await plugin.execute('extract_keywords', {
        text,
        maxKeywords: 5
      });
      
      expect(result).toHaveProperty('keywords');
      expect(result.keywords).toHaveLength(5);
      expect(result.keywords[0]).toHaveProperty('word');
      expect(result.keywords[0]).toHaveProperty('frequency');
    });
    
    it('should respect maxKeywords parameter', async () => {
      const text = "word1 word2 word3 word4 word5 word6";
      
      const result = await plugin.execute('extract_keywords', {
        text,
        maxKeywords: 3
      });
      
      expect(result.keywords).toHaveLength(3);
    });
  });
  
  describe('sentiment_analysis action', () => {
    it('should detect positive sentiment', async () => {
      const text = "This is an amazing and wonderful product!";
      
      const result = await plugin.execute('sentiment_analysis', { text });
      
      expect(result.sentiment).toBe('positive');
      expect(result.confidence).toBeGreaterThan(0);
    });
    
    it('should detect negative sentiment', async () => {
      const text = "This is a terrible and awful product!";
      
      const result = await plugin.execute('sentiment_analysis', { text });
      
      expect(result.sentiment).toBe('negative');
      expect(result.confidence).toBeGreaterThan(0);
    });
    
    it('should detect neutral sentiment', async () => {
      const text = "This is a product with some features.";
      
      const result = await plugin.execute('sentiment_analysis', { text });
      
      expect(result.sentiment).toBe('neutral');
    });
  });
});
```

### Integration Testing

```typescript
// test/plugin-integration.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'jest';
import { DataPrismEngine } from '@dataprism/core';
import { TextAnalyzerPlugin } from '../src/text-analyzer-plugin';

describe('Plugin Integration', () => {
  let engine: DataPrismEngine;
  let plugin: TextAnalyzerPlugin;
  
  beforeEach(async () => {
    engine = new DataPrismEngine();
    plugin = new TextAnalyzerPlugin();
    
    await engine.initialize();
    await engine.registerPlugin(plugin);
  });
  
  afterEach(async () => {
    await engine.shutdown();
  });
  
  it('should integrate with DataPrism engine', async () => {
    const testData = [
      { id: 1, comment: "Great product!" },
      { id: 2, comment: "Not bad, could be better" },
      { id: 3, comment: "Excellent quality" }
    ];
    
    await engine.loadData(testData, 'comments');
    
    // Process each comment
    const analyses = [];
    for (const row of testData) {
      const analysis = await engine.executePlugin('text-analyzer', 'analyze_text', {
        text: row.comment
      });
      
      analyses.push({
        id: row.id,
        sentiment: analysis.analysis.sentiment,
        wordCount: analysis.analysis.wordCount
      });
    }
    
    await engine.loadData(analyses, 'comment_analysis');
    
    // Query results
    const results = await engine.query(`
      SELECT 
        sentiment,
        COUNT(*) as count,
        AVG(wordCount) as avg_word_count
      FROM comment_analysis
      GROUP BY sentiment
    `);
    
    expect(results.data).toHaveLength(2); // Should have positive and neutral
    expect(results.data.find(r => r.sentiment === 'positive')).toBeDefined();
  });
  
  it('should handle plugin errors gracefully', async () => {
    await expect(engine.executePlugin('text-analyzer', 'invalid_action', {}))
      .rejects.toThrow('Unknown action: invalid_action');
  });
  
  it('should handle concurrent plugin executions', async () => {
    const promises = [];
    
    for (let i = 0; i < 10; i++) {
      promises.push(
        engine.executePlugin('text-analyzer', 'analyze_text', {
          text: `Test text number ${i}`
        })
      );
    }
    
    const results = await Promise.all(promises);
    
    expect(results).toHaveLength(10);
    results.forEach((result, index) => {
      expect(result.analysis.wordCount).toBe(4); // "Test text number N"
    });
  });
});
```

## Performance Optimization

### Optimized Plugin Implementation

```typescript
class OptimizedTextAnalyzerPlugin implements DataPrismPlugin {
  readonly name = 'optimized-text-analyzer';
  readonly version = '1.0.0';
  readonly description = 'Performance-optimized text analyzer';
  readonly capabilities = ['data_processing'];
  
  private context: PluginContext;
  private cache: Map<string, any> = new Map();
  private workerPool: Worker[] = [];
  private maxCacheSize = 1000;
  
  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    
    // Initialize worker pool for CPU-intensive tasks
    await this.initializeWorkerPool();
    
    // Setup cache cleanup
    this.setupCacheCleanup();
  }
  
  private async initializeWorkerPool(): Promise<void> {
    const workerCount = Math.min(navigator.hardwareConcurrency || 4, 8);
    
    for (let i = 0; i < workerCount; i++) {
      // Create worker for text processing
      const worker = new Worker(new URL('./text-analysis-worker.js', import.meta.url));
      this.workerPool.push(worker);
    }
  }
  
  private setupCacheCleanup(): void {
    // Clean up cache every 5 minutes
    setInterval(() => {
      if (this.cache.size > this.maxCacheSize) {
        // Remove oldest entries
        const entries = Array.from(this.cache.entries());
        const toRemove = entries.slice(0, entries.length - this.maxCacheSize);
        toRemove.forEach(([key]) => this.cache.delete(key));
      }
    }, 5 * 60 * 1000);
  }
  
  async execute(action: string, params: any): Promise<any> {
    const startTime = performance.now();
    
    try {
      // Check cache first
      const cacheKey = this.getCacheKey(action, params);
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }
      
      let result;
      
      switch (action) {
        case 'analyze_text_batch':
          result = await this.analyzeTextBatch(params);
          break;
        case 'analyze_text':
          result = await this.analyzeText(params);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
      
      // Cache result
      this.cache.set(cacheKey, result);
      
      // Record performance metrics
      const executionTime = performance.now() - startTime;
      this.context.recordMetric('plugin_execution_time', executionTime);
      
      return result;
    } catch (error) {
      this.context.recordMetric('plugin_errors', 1);
      throw error;
    }
  }
  
  private async analyzeTextBatch(params: any): Promise<any> {
    const { texts, options = {} } = params;
    
    if (!Array.isArray(texts)) {
      throw new Error('texts must be an array');
    }
    
    // Process in parallel using worker pool
    const batchSize = Math.ceil(texts.length / this.workerPool.length);
    const batches = [];
    
    for (let i = 0; i < texts.length; i += batchSize) {
      batches.push(texts.slice(i, i + batchSize));
    }
    
    const promises = batches.map((batch, index) => {
      const worker = this.workerPool[index % this.workerPool.length];
      return this.processTextBatch(worker, batch, options);
    });
    
    const results = await Promise.all(promises);
    return results.flat();
  }
  
  private processTextBatch(worker: Worker, batch: string[], options: any): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const messageHandler = (event: MessageEvent) => {
        worker.removeEventListener('message', messageHandler);
        
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data.results);
        }
      };
      
      worker.addEventListener('message', messageHandler);
      worker.postMessage({ batch, options });
    });
  }
  
  private async analyzeText(params: any): Promise<any> {
    return this.analyzeTextBatch({ texts: [params.text], options: params.options });
  }
  
  private getCacheKey(action: string, params: any): string {
    return `${action}:${JSON.stringify(params)}`;
  }
  
  async dispose(): Promise<void> {
    // Terminate workers
    this.workerPool.forEach(worker => worker.terminate());
    this.workerPool = [];
    
    // Clear cache
    this.cache.clear();
  }
}
```

## Best Practices

1. **Error Handling**: Always implement proper error handling and recovery
2. **Performance**: Use caching, worker pools, and batch processing for large datasets
3. **Memory Management**: Clean up resources in the dispose method
4. **Security**: Validate all inputs and request minimal permissions
5. **Testing**: Write comprehensive unit and integration tests
6. **Documentation**: Document all public APIs and usage examples
7. **Versioning**: Use semantic versioning for plugin releases
8. **Configuration**: Make plugins configurable through options

## Next Steps

- Learn about [Plugin API Reference](/plugins/api) for detailed API documentation
- Explore [Plugin Testing](/plugins/testing) for comprehensive testing strategies
- Check out [Plugin Development Guide](/plugins/development) for best practices
- See [Advanced Examples](/examples/advanced) for complex use cases

## Contributing

Found an issue or have a plugin to share? Please contribute to our [GitHub repository](https://github.com/srnarasim/DataPrism).

## License

MIT License. See [LICENSE](https://github.com/srnarasim/DataPrism/blob/main/LICENSE) for details.