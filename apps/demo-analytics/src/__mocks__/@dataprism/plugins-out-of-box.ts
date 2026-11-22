import { vi } from "vitest";

export const SemanticClusteringPlugin = vi.fn().mockImplementation(() => ({
  initialize: vi.fn().mockResolvedValue(undefined),
  performClustering: vi.fn().mockResolvedValue({
    clusters: [0, 1, 0],
    centroids: [[0, 0], [1, 1]],
    metrics: { silhouetteScore: 0.7, daviesBouldinIndex: 0.5, withinClusterSumOfSquares: 1, betweenClusterSumOfSquares: 2, numClusters: 2, numPoints: 3 },
    embeddings: [[0.1, 0.2], [0.3, 0.4], [0.1, 0.2]],
    visualization: { x: [0, 1, 0], y: [0, 1, 0], colors: ["#1f77b4", "#ff7f0e", "#1f77b4"] },
  }),
  render: vi.fn().mockResolvedValue(undefined),
  cleanup: vi.fn().mockResolvedValue(undefined),
}));
