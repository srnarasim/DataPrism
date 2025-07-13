import {
  IDataProcessorPlugin,
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
  VisualizationConfig,
} from "@dataprism/plugins";
import { kmeans } from "ml-kmeans";
import { DBSCAN } from "density-clustering";
import { WorkerManager, WorkerTask } from "@shared/worker-manager.js";
import { PerformanceTracker } from "@shared/performance-tracker.js";
import * as d3 from "d3";

export interface ClusteringConfig {
  algorithm: "kmeans" | "dbscan";
  numClusters?: number; // For k-means
  eps?: number; // For DBSCAN
  minPoints?: number; // For DBSCAN
  features: string[];
  normalize: boolean;
  embeddings?: {
    provider: "local" | "openai";
    model?: string;
    dimensions?: number;
  };
}

export interface ClusteringResult {
  clusters: number[];
  centroids?: number[][];
  metrics: ClusterQualityMetrics;
  embeddings?: number[][];
  visualization?: {
    x: number[];
    y: number[];
    colors: string[];
  };
}

export interface ClusterQualityMetrics {
  silhouetteScore: number;
  daviesBouldinIndex: number;
  withinClusterSumOfSquares: number;
  betweenClusterSumOfSquares: number;
  numClusters: number;
  numPoints: number;
}

export interface DimensionalityReduction {
  method: "tsne" | "umap" | "pca";
  dimensions: number;
  perplexity?: number; // For t-SNE
  neighbors?: number; // For UMAP
}

export class SemanticClusteringPlugin
  implements IDataProcessorPlugin, IVisualizationPlugin
{
  private context: PluginContext | null = null;
  private workerManager: WorkerManager;
  private performanceTracker: PerformanceTracker;
  private container: Element | null = null;
  private currentData: Dataset | null = null;
  private currentResult: ClusteringResult | null = null;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null =
    null;

  constructor() {
    this.workerManager = new WorkerManager({
      maxWorkers: 2,
      maxQueueSize: 20,
      terminateTimeout: 10000,
    });
    this.performanceTracker = new PerformanceTracker({
      maxMemoryMB: 2000,
      minFps: 30,
      maxQueryTimeMs: 60000, // Clustering can take longer
      maxCpuPercent: 90,
    });
  }

  // Plugin Identity
  getName(): string {
    return "SemanticClustering";
  }

  getVersion(): string {
    return "1.0.0";
  }

  getDescription(): string {
    return "Generate embeddings, run K-means/DBSCAN, and surface interactive cluster views for bulk classification";
  }

  getAuthor(): string {
    return "DataPrism Team";
  }

  getDependencies() {
    return [
      { name: "ml-kmeans", version: "^6.0.0", optional: false },
      { name: "density-clustering", version: "^1.3.0", optional: false },
      { name: "d3", version: "^7.8.5", optional: false },
    ];
  }

  // Lifecycle Management
  async initialize(context: PluginContext): Promise<void> {
    this.context = context;

    // Initialize worker for heavy computations
    await this.workerManager.initialize("/workers/clustering-worker.js");

    this.performanceTracker.start();
    this.context.logger.info("SemanticClustering plugin initialized");
  }

  async activate(): Promise<void> {
    if (!this.context) throw new Error("Plugin not initialized");
    this.context.logger.info("SemanticClustering plugin activated");
  }

  async deactivate(): Promise<void> {
    if (this.container) {
      await this.destroy();
    }
    this.context?.logger.info("SemanticClustering plugin deactivated");
  }

  async cleanup(): Promise<void> {
    await this.workerManager.terminate();
    this.performanceTracker.stop();
    this.context?.logger.info("SemanticClustering plugin cleaned up");
  }

  // Core Operations
  async execute(operation: string, params: any): Promise<any> {
    switch (operation) {
      case "cluster":
        return this.performClustering(params.data, params.config);
      case "embed":
        return this.generateEmbeddings(params.data, params.config);
      case "reduce":
        return this.performDimensionalityReduction(
          params.embeddings,
          params.config,
        );
      case "visualize":
        return this.render(params.container, params.data, params.config);
      case "export-labels":
        return this.exportClusterLabels(params.format);
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  async configure(settings: any): Promise<void> {
    // Configure clustering parameters
  }

  // Metadata and Capabilities
  getManifest(): PluginManifest {
    return {
      name: this.getName(),
      version: this.getVersion(),
      description: this.getDescription(),
      author: this.getAuthor(),
      license: "MIT",
      keywords: [
        "clustering",
        "ml",
        "embeddings",
        "classification",
        "visualization",
      ],
      category: "data-processing",
      entryPoint: "semantic-clustering.js",
      dependencies: this.getDependencies(),
      permissions: [
        { resource: "dom", access: "write" },
        { resource: "workers", access: "execute" },
        { resource: "network", access: "read" }, // For external embedding APIs
      ],
      configuration: {
        algorithm: { type: "string", default: "kmeans" },
        numClusters: { type: "number", default: 5 },
        normalize: { type: "boolean", default: true },
        embeddingProvider: { type: "string", default: "local" },
      },
      compatibility: {
        minCoreVersion: "1.0.0",
        browsers: ["Chrome 90+", "Firefox 88+", "Safari 14+", "Edge 90+"],
      },
    };
  }

  getCapabilities(): PluginCapability[] {
    return [
      {
        name: "cluster",
        description: "Perform clustering analysis on datasets",
        type: "processing",
        version: "1.0.0",
        async: true,
        inputTypes: ["dataset"],
        outputTypes: ["cluster-result"],
      },
      {
        name: "embed",
        description: "Generate embeddings for text and numeric data",
        type: "processing",
        version: "1.0.0",
        async: true,
        inputTypes: ["dataset"],
        outputTypes: ["embeddings"],
      },
      {
        name: "visualize",
        description: "Create interactive cluster visualizations",
        type: "visualization",
        version: "1.0.0",
        async: true,
        inputTypes: ["cluster-result"],
        outputTypes: ["dom-element"],
      },
    ];
  }

  isCompatible(coreVersion: string): boolean {
    return coreVersion >= "1.0.0";
  }

  // Data Processing Operations
  async performClustering(
    data: Dataset,
    config: ClusteringConfig,
  ): Promise<ClusteringResult> {
    this.performanceTracker.markQueryStart("clustering");

    try {
      this.context?.logger.info(
        `Starting ${config.algorithm} clustering with ${data.rows.length} rows`,
      );

      // Extract and prepare features
      const features = await this.extractFeatures(data, config);

      // Generate embeddings if needed
      let embeddings: number[][];
      if (config.embeddings) {
        embeddings = await this.generateEmbeddings(data, config.embeddings);
      } else {
        embeddings = features;
      }

      // Normalize features if requested
      if (config.normalize) {
        embeddings = this.normalizeFeatures(embeddings);
      }

      // Perform clustering using worker
      const clusterTask: WorkerTask = {
        id: `cluster-${Date.now()}`,
        type: "clustering",
        data: {
          algorithm: config.algorithm,
          features: embeddings,
          config: {
            numClusters: config.numClusters || 5,
            eps: config.eps || 0.5,
            minPoints: config.minPoints || 5,
          },
        },
      };

      const result = await this.workerManager.execute(clusterTask);

      if (!result.success) {
        throw new Error(`Clustering failed: ${result.error}`);
      }

      const { clusters, centroids } = result.data;

      // Calculate quality metrics
      const metrics = this.calculateQualityMetrics(
        embeddings,
        clusters,
        centroids,
      );

      // Generate 2D visualization using dimensionality reduction
      const visualization = await this.generate2DVisualization(
        embeddings,
        clusters,
      );

      const clusteringResult: ClusteringResult = {
        clusters,
        centroids,
        metrics,
        embeddings,
        visualization,
      };

      this.currentResult = clusteringResult;

      this.context?.eventBus.publish("clustering:complete", {
        plugin: this.getName(),
        algorithm: config.algorithm,
        numClusters: metrics.numClusters,
        silhouetteScore: metrics.silhouetteScore,
        executionTime: this.performanceTracker.markQueryEnd("clustering"),
      });

      return clusteringResult;
    } catch (error) {
      this.context?.logger.error("Clustering failed:", error);
      throw error;
    }
  }

  async generateEmbeddings(data: Dataset, config: any): Promise<number[][]> {
    this.performanceTracker.markQueryStart("embeddings");

    try {
      if (config.provider === "local") {
        return this.generateLocalEmbeddings(data, config);
      } else if (config.provider === "openai") {
        return this.generateOpenAIEmbeddings(data, config);
      } else {
        throw new Error(`Unknown embedding provider: ${config.provider}`);
      }
    } finally {
      this.performanceTracker.markQueryEnd("embeddings");
    }
  }

  async performDimensionalityReduction(
    embeddings: number[][],
    config: DimensionalityReduction,
  ): Promise<number[][]> {
    const reductionTask: WorkerTask = {
      id: `reduction-${Date.now()}`,
      type: "dimensionality-reduction",
      data: {
        method: config.method,
        embeddings,
        config,
      },
    };

    const result = await this.workerManager.execute(reductionTask);

    if (!result.success) {
      throw new Error(`Dimensionality reduction failed: ${result.error}`);
    }

    return result.data.reducedEmbeddings;
  }

  // Visualization Operations
  async render(
    container: Element,
    data: Dataset,
    config?: RenderConfig,
  ): Promise<void> {
    if (!this.currentResult) {
      throw new Error("No clustering result available. Run clustering first.");
    }

    this.container = container;
    this.currentData = data;

    // Clear container
    d3.select(container).selectAll("*").remove();

    const containerRect = container.getBoundingClientRect();
    const width = containerRect.width || 800;
    const height = containerRect.height || 600;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };

    this.svg = d3
      .select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    await this.renderClusterVisualization(width, height, margin);
  }

  async update(data: Dataset): Promise<void> {
    // Re-run clustering with new data
    throw new Error("Update not implemented - re-run clustering instead");
  }

  async resize(dimensions: Dimensions): Promise<void> {
    if (!this.svg) return;

    this.svg
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .attr("viewBox", `0 0 ${dimensions.width} ${dimensions.height}`);

    // Re-render with new dimensions
    if (this.currentResult) {
      const margin = { top: 40, right: 40, bottom: 60, left: 60 };
      await this.renderClusterVisualization(
        dimensions.width,
        dimensions.height,
        margin,
      );
    }
  }

  async destroy(): Promise<void> {
    if (this.container) {
      d3.select(this.container).selectAll("*").remove();
    }

    this.container = null;
    this.svg = null;
    this.currentData = null;
    this.currentResult = null;
  }

  // Visualization metadata
  getVisualizationTypes(): VisualizationType[] {
    return [
      {
        name: "Cluster Scatter Plot",
        description:
          "2D visualization of clustering results with interactive selection",
        category: "chart",
        requiredFields: [
          {
            name: "features",
            types: ["number"],
            multiple: true,
            description: "Numeric features for clustering",
          },
        ],
        optionalFields: [
          {
            name: "text",
            types: ["string"],
            multiple: false,
            description: "Text field for embeddings",
          },
        ],
        complexity: "complex",
      },
    ];
  }

  getSupportedDataTypes(): DataType[] {
    return ["string", "number", "integer"];
  }

  getInteractionFeatures(): InteractionFeature[] {
    return [
      {
        name: "Lasso Selection",
        description: "Select points using lasso tool",
        events: ["brush", "select"],
        configurable: true,
      },
      {
        name: "Cluster Highlight",
        description: "Highlight all points in a cluster",
        events: ["hover", "click"],
        configurable: true,
      },
      {
        name: "Zoom and Pan",
        description: "Navigate the cluster space",
        events: ["zoom", "pan"],
        configurable: true,
      },
    ];
  }

  async export(format: ExportFormat): Promise<Blob> {
    if (format === "svg" && this.svg) {
      const svgElement = this.svg.node();
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement!);
      return new Blob([svgString], { type: "image/svg+xml" });
    } else if (format === "json" && this.currentResult) {
      return new Blob([JSON.stringify(this.currentResult, null, 2)], {
        type: "application/json",
      });
    } else {
      throw new Error(`Export format ${format} not supported`);
    }
  }

  getConfiguration(): VisualizationConfig {
    return {} as VisualizationConfig;
  }

  async setConfiguration(config: VisualizationConfig): Promise<void> {
    // Update visualization configuration
  }

  async onInteraction(event: InteractionEvent): Promise<void> {
    this.context?.eventBus.publish("clustering:interaction", {
      plugin: this.getName(),
      event: event.type,
      data: event.data,
    });
  }

  getSelectionData(): any[] {
    // Return selected cluster data
    return [];
  }

  async clearSelection(): Promise<void> {
    if (this.svg) {
      this.svg.selectAll(".selected").classed("selected", false);
    }
  }

  async exportClusterLabels(format: "csv" | "json" = "csv"): Promise<Blob> {
    if (!this.currentResult || !this.currentData) {
      throw new Error("No clustering result available");
    }

    if (format === "csv") {
      const headers = [
        ...this.currentData.columns.map((col) => col.name),
        "cluster_id",
      ];
      const rows = this.currentData.rows.map((row, index) => [
        ...row,
        this.currentResult!.clusters[index],
      ]);

      const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
      return new Blob([csv], { type: "text/csv" });
    } else {
      const data = {
        clusters: this.currentResult.clusters,
        metrics: this.currentResult.metrics,
        exportTime: new Date().toISOString(),
      };
      return new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
    }
  }

  // Private Methods
  private async extractFeatures(
    data: Dataset,
    config: ClusteringConfig,
  ): Promise<number[][]> {
    const features: number[][] = [];

    for (const row of data.rows) {
      const featureVector: number[] = [];

      for (const featureName of config.features) {
        const columnIndex = data.columns.findIndex(
          (col) => col.name === featureName,
        );
        if (columnIndex === -1) {
          throw new Error(`Feature column '${featureName}' not found`);
        }

        const value = row[columnIndex];
        const numericValue =
          typeof value === "number" ? value : parseFloat(String(value));

        if (isNaN(numericValue)) {
          throw new Error(
            `Non-numeric value found in feature '${featureName}': ${value}`,
          );
        }

        featureVector.push(numericValue);
      }

      features.push(featureVector);
    }

    return features;
  }

  private async generateLocalEmbeddings(
    data: Dataset,
    config: any,
  ): Promise<number[][]> {
    // Simple local embedding using TF-IDF for text or feature scaling for numbers
    const textColumns = data.columns.filter((col) => col.type === "string");

    if (textColumns.length > 0) {
      // Generate text embeddings using TF-IDF
      return this.generateTFIDFEmbeddings(data, textColumns[0].name);
    } else {
      // Use numeric features directly
      const numericColumns = data.columns.filter(
        (col) => col.type === "number" || col.type === "integer",
      );
      return this.extractFeatures(data, {
        ...config,
        features: numericColumns.map((col) => col.name),
      });
    }
  }

  private async generateOpenAIEmbeddings(
    data: Dataset,
    config: any,
  ): Promise<number[][]> {
    // Placeholder for OpenAI embeddings integration
    throw new Error("OpenAI embeddings not implemented in this version");
  }

  private generateTFIDFEmbeddings(
    data: Dataset,
    textColumn: string,
  ): number[][] {
    const columnIndex = data.columns.findIndex(
      (col) => col.name === textColumn,
    );
    if (columnIndex === -1) {
      throw new Error(`Text column '${textColumn}' not found`);
    }

    const documents = data.rows.map((row) =>
      String(row[columnIndex] || "").toLowerCase(),
    );

    // Simple TF-IDF implementation
    const vocabulary = new Set<string>();
    const wordCounts: Map<string, number>[] = [];

    // Build vocabulary and count words
    for (const doc of documents) {
      const words = doc.split(/\s+/).filter((word) => word.length > 2);
      const wordCount = new Map<string, number>();

      for (const word of words) {
        vocabulary.add(word);
        wordCount.set(word, (wordCount.get(word) || 0) + 1);
      }

      wordCounts.push(wordCount);
    }

    const vocabArray = Array.from(vocabulary);
    const docFreq = new Map<string, number>();

    // Calculate document frequencies
    for (const word of vocabArray) {
      let freq = 0;
      for (const wordCount of wordCounts) {
        if (wordCount.has(word)) freq++;
      }
      docFreq.set(word, freq);
    }

    // Generate TF-IDF vectors
    const embeddings: number[][] = [];

    for (let docIndex = 0; docIndex < documents.length; docIndex++) {
      const vector: number[] = [];
      const wordCount = wordCounts[docIndex];
      const docLength = Array.from(wordCount.values()).reduce(
        (sum, count) => sum + count,
        0,
      );

      for (const word of vocabArray) {
        const tf = (wordCount.get(word) || 0) / docLength;
        const idf = Math.log(documents.length / (docFreq.get(word) || 1));
        vector.push(tf * idf);
      }

      embeddings.push(vector);
    }

    return embeddings;
  }

  private normalizeFeatures(features: number[][]): number[][] {
    if (features.length === 0 || features[0].length === 0) return features;

    const numFeatures = features[0].length;
    const means: number[] = new Array(numFeatures).fill(0);
    const stds: number[] = new Array(numFeatures).fill(0);

    // Calculate means
    for (const row of features) {
      for (let i = 0; i < numFeatures; i++) {
        means[i] += row[i];
      }
    }
    for (let i = 0; i < numFeatures; i++) {
      means[i] /= features.length;
    }

    // Calculate standard deviations
    for (const row of features) {
      for (let i = 0; i < numFeatures; i++) {
        stds[i] += Math.pow(row[i] - means[i], 2);
      }
    }
    for (let i = 0; i < numFeatures; i++) {
      stds[i] = Math.sqrt(stds[i] / features.length);
    }

    // Normalize
    return features.map((row) =>
      row.map((value, i) => (stds[i] > 0 ? (value - means[i]) / stds[i] : 0)),
    );
  }

  private calculateQualityMetrics(
    features: number[][],
    clusters: number[],
    centroids?: number[][],
  ): ClusterQualityMetrics {
    const numClusters = Math.max(...clusters) + 1;
    const numPoints = features.length;

    // Calculate silhouette score (simplified version)
    let silhouetteScore = 0;

    // Calculate within and between cluster sum of squares
    let withinSS = 0;
    let betweenSS = 0;

    // Group points by cluster
    const clusterGroups: number[][][] = Array(numClusters)
      .fill(null)
      .map(() => []);
    for (let i = 0; i < features.length; i++) {
      clusterGroups[clusters[i]].push(features[i]);
    }

    // Calculate cluster centers if not provided
    const centers =
      centroids ||
      clusterGroups.map((group) => {
        if (group.length === 0) return new Array(features[0].length).fill(0);

        const center = new Array(features[0].length).fill(0);
        for (const point of group) {
          for (let j = 0; j < point.length; j++) {
            center[j] += point[j];
          }
        }
        return center.map((sum) => sum / group.length);
      });

    // Calculate within-cluster sum of squares
    for (let i = 0; i < numClusters; i++) {
      const center = centers[i];
      for (const point of clusterGroups[i]) {
        withinSS += this.euclideanDistance(point, center) ** 2;
      }
    }

    // Calculate between-cluster sum of squares
    const globalCenter = this.calculateMean(features);
    for (let i = 0; i < numClusters; i++) {
      const center = centers[i];
      const clusterSize = clusterGroups[i].length;
      betweenSS +=
        clusterSize * this.euclideanDistance(center, globalCenter) ** 2;
    }

    // Simplified Davies-Bouldin index
    let daviesBouldinIndex = 0;
    for (let i = 0; i < numClusters; i++) {
      let maxRatio = 0;
      for (let j = 0; j < numClusters; j++) {
        if (i !== j) {
          const avgDistI = this.calculateAvgIntraClusterDistance(
            clusterGroups[i],
            centers[i],
          );
          const avgDistJ = this.calculateAvgIntraClusterDistance(
            clusterGroups[j],
            centers[j],
          );
          const centerDistance = this.euclideanDistance(centers[i], centers[j]);

          if (centerDistance > 0) {
            const ratio = (avgDistI + avgDistJ) / centerDistance;
            maxRatio = Math.max(maxRatio, ratio);
          }
        }
      }
      daviesBouldinIndex += maxRatio;
    }
    daviesBouldinIndex /= numClusters;

    // Simplified silhouette score (using average intra vs inter cluster distances)
    let totalSilhouette = 0;
    for (let i = 0; i < features.length; i++) {
      const clusterIndex = clusters[i];
      const intraDistance = this.calculateAvgIntraClusterDistance(
        [features[i]],
        centers[clusterIndex],
      );

      let minInterDistance = Infinity;
      for (let j = 0; j < numClusters; j++) {
        if (j !== clusterIndex) {
          const interDistance = this.euclideanDistance(features[i], centers[j]);
          minInterDistance = Math.min(minInterDistance, interDistance);
        }
      }

      const silhouette =
        minInterDistance > intraDistance
          ? (minInterDistance - intraDistance) /
            Math.max(minInterDistance, intraDistance)
          : 0;
      totalSilhouette += silhouette;
    }
    silhouetteScore = totalSilhouette / numPoints;

    return {
      silhouetteScore,
      daviesBouldinIndex,
      withinClusterSumOfSquares: withinSS,
      betweenClusterSumOfSquares: betweenSS,
      numClusters,
      numPoints,
    };
  }

  private async generate2DVisualization(
    embeddings: number[][],
    clusters: number[],
  ): Promise<{ x: number[]; y: number[]; colors: string[] }> {
    // Use t-SNE for dimensionality reduction to 2D
    const reduced2D = await this.performDimensionalityReduction(embeddings, {
      method: "pca", // Simplified to PCA for now
      dimensions: 2,
    });

    const colors = this.generateClusterColors(Math.max(...clusters) + 1);

    return {
      x: reduced2D.map((point) => point[0]),
      y: reduced2D.map((point) => point[1]),
      colors: clusters.map((cluster) => colors[cluster]),
    };
  }

  private async renderClusterVisualization(
    width: number,
    height: number,
    margin: any,
  ): Promise<void> {
    if (!this.svg || !this.currentResult?.visualization) return;

    const { x, y, colors } = this.currentResult.visualization;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Clear previous content
    this.svg.selectAll("g").remove();

    const g = this.svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(x) as [number, number])
      .range([0, chartWidth]);

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(y) as [number, number])
      .range([chartHeight, 0]);

    // Add axes
    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale));

    g.append("g").attr("class", "y-axis").call(d3.axisLeft(yScale));

    // Add points
    g.selectAll(".point")
      .data(
        x.map((xVal, i) => ({ x: xVal, y: y[i], color: colors[i], index: i })),
      )
      .enter()
      .append("circle")
      .attr("class", "point")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 4)
      .attr("fill", (d) => d.color)
      .attr("opacity", 0.7)
      .on("mouseover", (event, d) => {
        this.showTooltip(event, d);
      })
      .on("mouseout", () => {
        this.hideTooltip();
      })
      .on("click", (event, d) => {
        this.onInteraction({
          type: "click",
          target: d,
          data: d,
          position: { x: event.clientX, y: event.clientY },
        } as InteractionEvent);
      });

    // Add title
    this.svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Cluster Visualization");

    // Add quality metrics
    if (this.currentResult.metrics) {
      const metricsText = `Silhouette: ${this.currentResult.metrics.silhouetteScore.toFixed(3)} | Clusters: ${this.currentResult.metrics.numClusters}`;
      this.svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "#666")
        .text(metricsText);
    }
  }

  private euclideanDistance(a: number[], b: number[]): number {
    return Math.sqrt(
      a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0),
    );
  }

  private calculateMean(points: number[][]): number[] {
    if (points.length === 0) return [];

    const mean = new Array(points[0].length).fill(0);
    for (const point of points) {
      for (let i = 0; i < point.length; i++) {
        mean[i] += point[i];
      }
    }
    return mean.map((sum) => sum / points.length);
  }

  private calculateAvgIntraClusterDistance(
    clusterPoints: number[][],
    center: number[],
  ): number {
    if (clusterPoints.length === 0) return 0;

    const totalDistance = clusterPoints.reduce(
      (sum, point) => sum + this.euclideanDistance(point, center),
      0,
    );
    return totalDistance / clusterPoints.length;
  }

  private generateClusterColors(numClusters: number): string[] {
    const colors = d3.schemeCategory10;
    if (numClusters <= colors.length) {
      return colors.slice(0, numClusters);
    }

    // Generate additional colors if needed
    const additionalColors: string[] = [];
    for (let i = colors.length; i < numClusters; i++) {
      const hue = (i * 137.5) % 360; // Golden angle for color distribution
      additionalColors.push(`hsl(${hue}, 50%, 50%)`);
    }

    return [...colors, ...additionalColors];
  }

  private showTooltip(event: MouseEvent, data: any): void {
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "cluster-tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("pointer-events", "none");

    tooltip.transition().duration(200).style("opacity", 1);

    tooltip
      .html(
        `Point ${data.index}<br/>Cluster: ${this.currentResult?.clusters[data.index]}`,
      )
      .style("left", event.pageX + 10 + "px")
      .style("top", event.pageY - 28 + "px");
  }

  private hideTooltip(): void {
    d3.selectAll(".cluster-tooltip").remove();
  }
}
