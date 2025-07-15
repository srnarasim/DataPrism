# Semantic Clustering Plugin

The Semantic Clustering plugin provides advanced machine learning-powered clustering capabilities for DataPrism Core, enabling you to discover patterns and group similar data points using state-of-the-art embedding models.

## Features

- **Text Embedding**: Convert text to high-dimensional vectors using pre-trained models
- **Multiple Clustering Algorithms**: K-means, hierarchical, DBSCAN, and more
- **Dimensionality Reduction**: PCA, t-SNE, and UMAP for visualization
- **Similarity Search**: Find similar items based on semantic content
- **Real-time Processing**: Efficient processing of large datasets
- **Customizable Models**: Support for various embedding models
- **Interactive Visualization**: Built-in cluster visualization tools

## Installation

```bash
npm install @dataprism/plugin-semantic-clustering
```

## Quick Start

```typescript
import { DataPrismEngine } from "@dataprism/core";
import { createSemanticClusteringPlugin } from "@dataprism/plugin-semantic-clustering";

const engine = new DataPrismEngine();
const clusteringPlugin = await createSemanticClusteringPlugin();

// Register the plugin
engine.registerPlugin(clusteringPlugin);

// Load your data
const documents = [
  { id: 1, text: "I love machine learning and AI" },
  { id: 2, text: "Data science is fascinating" },
  { id: 3, text: "I enjoy cooking and recipes" },
  { id: 4, text: "Artificial intelligence is the future" },
  { id: 5, text: "Baking bread is my hobby" }
];

engine.loadData(documents, "documents");

// Perform clustering
const clusters = await clusteringPlugin.cluster({
  tableName: "documents",
  textColumn: "text",
  algorithm: "kmeans",
  numClusters: 2
});

console.log("Clusters:", clusters);
```

## Clustering Algorithms

### K-Means Clustering

```typescript
const kmeansClusters = await clusteringPlugin.cluster({
  tableName: "documents",
  textColumn: "content",
  algorithm: "kmeans",
  numClusters: 5,
  maxIterations: 300,
  tolerance: 1e-6
});
```

### Hierarchical Clustering

```typescript
const hierarchicalClusters = await clusteringPlugin.cluster({
  tableName: "documents",
  textColumn: "content",
  algorithm: "hierarchical",
  linkage: "ward", // 'single', 'complete', 'average', 'ward'
  numClusters: 3
});
```

### DBSCAN Clustering

```typescript
const dbscanClusters = await clusteringPlugin.cluster({
  tableName: "documents",
  textColumn: "content",
  algorithm: "dbscan",
  eps: 0.5,
  minSamples: 2
});
```

### Gaussian Mixture Model

```typescript
const gmmClusters = await clusteringPlugin.cluster({
  tableName: "documents",
  textColumn: "content",
  algorithm: "gmm",
  numComponents: 4,
  covarianceType: "full" // 'full', 'tied', 'diag', 'spherical'
});
```

## Embedding Models

### Pre-trained Models

```typescript
// Use different embedding models
const clusters = await clusteringPlugin.cluster({
  tableName: "documents",
  textColumn: "content",
  embeddingModel: "sentence-transformers/all-MiniLM-L6-v2", // Default
  algorithm: "kmeans",
  numClusters: 3
});

// Available models:
// - "sentence-transformers/all-MiniLM-L6-v2" (default, 384 dimensions)
// - "sentence-transformers/all-mpnet-base-v2" (768 dimensions)
// - "text-embedding-ada-002" (OpenAI, 1536 dimensions)
// - "universal-sentence-encoder" (Google, 512 dimensions)
```

### Custom Embeddings

```typescript
// Provide your own embeddings
const customEmbeddings = await generateCustomEmbeddings(textData);

const clusters = await clusteringPlugin.clusterEmbeddings({
  embeddings: customEmbeddings,
  algorithm: "kmeans",
  numClusters: 4
});
```

## Dimensionality Reduction

### PCA (Principal Component Analysis)

```typescript
const pcaResults = await clusteringPlugin.reduceDimensions({
  tableName: "documents",
  textColumn: "content",
  method: "pca",
  numComponents: 2
});
```

### t-SNE

```typescript
const tsneResults = await clusteringPlugin.reduceDimensions({
  tableName: "documents",
  textColumn: "content",
  method: "tsne",
  numComponents: 2,
  perplexity: 30,
  learningRate: 200
});
```

### UMAP

```typescript
const umapResults = await clusteringPlugin.reduceDimensions({
  tableName: "documents",
  textColumn: "content",
  method: "umap",
  numComponents: 2,
  numNeighbors: 15,
  minDistance: 0.1
});
```

## Similarity Search

### Find Similar Items

```typescript
// Find items similar to a query
const similarItems = await clusteringPlugin.findSimilar({
  tableName: "documents",
  textColumn: "content",
  query: "machine learning applications",
  numResults: 5,
  threshold: 0.7
});
```

### Similarity Matrix

```typescript
// Compute similarity matrix for all items
const similarityMatrix = await clusteringPlugin.computeSimilarityMatrix({
  tableName: "documents",
  textColumn: "content",
  metric: "cosine" // 'cosine', 'euclidean', 'manhattan'
});
```

## Visualization

### Cluster Visualization

```typescript
// Create interactive cluster visualization
const visualization = await clusteringPlugin.visualizeClusters({
  tableName: "documents",
  textColumn: "content",
  algorithm: "kmeans",
  numClusters: 3,
  reduction: "tsne",
  showLabels: true,
  colorScheme: "category10"
});

// Render to DOM
document.getElementById("cluster-viz").appendChild(visualization);
```

### Dendrogram (for hierarchical clustering)

```typescript
const dendrogram = await clusteringPlugin.createDendrogram({
  tableName: "documents",
  textColumn: "content",
  linkage: "ward",
  maxDepth: 10
});
```

## Configuration Options

### Clustering Configuration

```typescript
interface ClusteringConfig {
  tableName: string;
  textColumn: string;
  algorithm: "kmeans" | "hierarchical" | "dbscan" | "gmm";
  embeddingModel?: string;
  numClusters?: number;
  
  // K-means specific
  maxIterations?: number;
  tolerance?: number;
  
  // Hierarchical specific
  linkage?: "single" | "complete" | "average" | "ward";
  
  // DBSCAN specific
  eps?: number;
  minSamples?: number;
  
  // GMM specific
  numComponents?: number;
  covarianceType?: "full" | "tied" | "diag" | "spherical";
  
  // General options
  randomSeed?: number;
  normalize?: boolean;
  onProgress?: (progress: ClusteringProgress) => void;
}
```

### Plugin Options

```typescript
const clusteringPlugin = await createSemanticClusteringPlugin({
  modelCache: {
    enabled: true,
    maxSize: 100 * 1024 * 1024, // 100MB
    ttl: 3600000 // 1 hour
  },
  embeddingOptions: {
    batchSize: 32,
    maxLength: 512,
    truncate: true
  },
  computeOptions: {
    useWebWorkers: true,
    maxWorkers: 4
  }
});
```

## Performance Optimization

### Batch Processing

```typescript
const clusters = await clusteringPlugin.cluster({
  tableName: "large_documents",
  textColumn: "content",
  algorithm: "kmeans",
  numClusters: 10,
  batchSize: 100, // Process in batches
  onProgress: (progress) => {
    console.log(`Processing: ${progress.percentage}%`);
  }
});
```

### Caching

```typescript
// Enable embedding cache for repeated operations
const clusters = await clusteringPlugin.cluster({
  tableName: "documents",
  textColumn: "content",
  algorithm: "kmeans",
  numClusters: 3,
  cacheEmbeddings: true,
  cacheKey: "my_documents_v1"
});
```

## Advanced Features

### Multi-column Clustering

```typescript
// Cluster based on multiple text columns
const multiColumnClusters = await clusteringPlugin.cluster({
  tableName: "products",
  textColumns: ["title", "description", "category"],
  weights: [0.4, 0.4, 0.2], // Weight each column
  algorithm: "kmeans",
  numClusters: 5
});
```

### Incremental Clustering

```typescript
// Add new data to existing clusters
const initialClusters = await clusteringPlugin.cluster({
  tableName: "documents",
  textColumn: "content",
  algorithm: "kmeans",
  numClusters: 3
});

// Add new documents
engine.loadData(newDocuments, "new_documents");

const updatedClusters = await clusteringPlugin.incrementalCluster({
  existingModel: initialClusters.model,
  newDataTable: "new_documents",
  textColumn: "content"
});
```

### Cluster Evaluation

```typescript
// Evaluate clustering quality
const evaluation = await clusteringPlugin.evaluateClusters({
  tableName: "documents",
  textColumn: "content",
  clusters: clusterResults.clusters,
  metrics: ["silhouette", "calinski_harabasz", "davies_bouldin"]
});

console.log("Silhouette Score:", evaluation.silhouette);
console.log("Calinski-Harabasz Index:", evaluation.calinski_harabasz);
console.log("Davies-Bouldin Index:", evaluation.davies_bouldin);
```

## Integration with DataPrism

### Query Clustered Data

```typescript
// Perform clustering
const clusters = await clusteringPlugin.cluster({
  tableName: "documents",
  textColumn: "content",
  algorithm: "kmeans",
  numClusters: 3,
  outputTable: "document_clusters"
});

// Query clustered data
const clusterAnalysis = await engine.query(`
  SELECT 
    cluster_id,
    COUNT(*) as document_count,
    AVG(confidence) as avg_confidence
  FROM document_clusters
  GROUP BY cluster_id
  ORDER BY document_count DESC
`);
```

### Combine with Other Plugins

```typescript
// Cluster documents and visualize
const clusters = await clusteringPlugin.cluster({
  tableName: "documents",
  textColumn: "content",
  algorithm: "kmeans",
  numClusters: 5
});

// Use visualization plugin to create charts
const chart = await visualizationPlugin.createChart({
  type: "scatter",
  data: clusters.points,
  x: "x",
  y: "y",
  fill: "cluster_id",
  title: "Document Clusters"
});
```

## API Reference

### Methods

#### `cluster(config: ClusteringConfig): Promise<ClusteringResult>`

Perform clustering on text data.

#### `clusterEmbeddings(config: EmbeddingClusteringConfig): Promise<ClusteringResult>`

Perform clustering on pre-computed embeddings.

#### `reduceDimensions(config: DimensionalityReductionConfig): Promise<DimensionalityReductionResult>`

Reduce dimensionality of embeddings for visualization.

#### `findSimilar(config: SimilarityConfig): Promise<SimilarityResult>`

Find similar items based on semantic content.

#### `computeSimilarityMatrix(config: SimilarityMatrixConfig): Promise<number[][]>`

Compute similarity matrix for all items.

#### `visualizeClusters(config: VisualizationConfig): Promise<HTMLElement>`

Create interactive cluster visualization.

#### `evaluateClusters(config: EvaluationConfig): Promise<EvaluationResult>`

Evaluate clustering quality using various metrics.

### Types

```typescript
interface ClusteringResult {
  clusters: ClusterInfo[];
  points: ClusterPoint[];
  centroids: number[][];
  inertia: number;
  silhouetteScore: number;
  model: ClusteringModel;
}

interface ClusterInfo {
  id: number;
  size: number;
  center: number[];
  topTerms: string[];
  samples: any[];
}

interface ClusterPoint {
  id: any;
  cluster_id: number;
  confidence: number;
  distance_to_center: number;
  x?: number; // For visualization
  y?: number; // For visualization
}
```

## Examples

### Customer Feedback Analysis

```typescript
// Cluster customer feedback
const feedbackClusters = await clusteringPlugin.cluster({
  tableName: "customer_feedback",
  textColumn: "comment",
  algorithm: "kmeans",
  numClusters: 5
});

// Analyze each cluster
for (const cluster of feedbackClusters.clusters) {
  console.log(`Cluster ${cluster.id}: ${cluster.size} comments`);
  console.log("Top terms:", cluster.topTerms);
  console.log("Sample comments:", cluster.samples.slice(0, 3));
}
```

### Document Organization

```typescript
// Organize documents by topic
const docClusters = await clusteringPlugin.cluster({
  tableName: "documents",
  textColumn: "content",
  algorithm: "hierarchical",
  linkage: "ward",
  numClusters: 8
});

// Create topic labels
const topics = docClusters.clusters.map(cluster => ({
  id: cluster.id,
  topic: cluster.topTerms.slice(0, 3).join(", "),
  documents: cluster.size
}));
```

## Troubleshooting

### Common Issues

**Out of memory errors**
- Reduce batch size
- Use smaller embedding models
- Enable embedding caching

**Poor clustering quality**
- Try different algorithms
- Experiment with number of clusters
- Preprocess text data (remove stop words, etc.)

**Slow performance**
- Enable web workers
- Use smaller embedding models
- Reduce data size or use sampling

**Visualization not rendering**
- Check container dimensions
- Verify data format
- Enable dimensionality reduction

## Contributing

Contributions are welcome! Please see our [Contributing Guide](https://github.com/srnarasim/DataPrism/blob/main/CONTRIBUTING.md) for details.

## License

MIT License. See [LICENSE](https://github.com/srnarasim/DataPrism/blob/main/LICENSE) for details.
