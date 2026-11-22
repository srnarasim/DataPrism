// Pure clustering and dimensionality reduction functions — no DOM/Worker dependencies.
// Imported by clustering-worker.js and directly by tests.

export function performClustering(data) {
  const { algorithm, features, config } = data;
  if (algorithm === "kmeans") return performKMeans(features, config);
  if (algorithm === "dbscan") return performDBSCAN(features, config);
  throw new Error(`Unknown clustering algorithm: ${algorithm}`);
}

export function performKMeans(features, config) {
  let { numClusters } = config;
  // Clamp to avoid k > n which would leave empty centroids
  numClusters = Math.min(numClusters, features.length);
  const maxIterations = 100;
  const tolerance = 1e-4;

  if (features.length === 0 || numClusters <= 0) {
    throw new Error("Invalid input parameters for K-means");
  }

  const numPoints = features.length;
  let centroids = initializeCentroidsKMeansPlusPlus(features, numClusters);
  let labels = new Array(numPoints);
  let converged = false;

  for (let iteration = 0; iteration < maxIterations && !converged; iteration++) {
    const newLabels = new Array(numPoints);
    for (let i = 0; i < numPoints; i++) {
      let minDistance = Infinity;
      let closestCentroid = 0;
      for (let j = 0; j < numClusters; j++) {
        const distance = euclideanDistance(features[i], centroids[j]);
        if (distance < minDistance) {
          minDistance = distance;
          closestCentroid = j;
        }
      }
      newLabels[i] = closestCentroid;
    }

    const newCentroids = new Array(numClusters);
    for (let j = 0; j < numClusters; j++) {
      const clusterPoints = [];
      for (let i = 0; i < numPoints; i++) {
        if (newLabels[i] === j) clusterPoints.push(features[i]);
      }
      newCentroids[j] = clusterPoints.length > 0
        ? calculateCentroid(clusterPoints)
        : centroids[j];
    }

    converged = true;
    for (let j = 0; j < numClusters; j++) {
      if (euclideanDistance(centroids[j], newCentroids[j]) > tolerance) {
        converged = false;
        break;
      }
    }
    labels = newLabels;
    centroids = newCentroids;
  }

  return { clusters: labels, centroids };
}

export function performDBSCAN(features, config) {
  const { eps = 0.5, minPoints = 5 } = config;
  const numPoints = features.length;
  const labels = new Array(numPoints).fill(-1);
  let clusterId = 0;

  for (let i = 0; i < numPoints; i++) {
    if (labels[i] !== -1) continue;
    const neighbors = getNeighbors(features, i, eps);
    if (neighbors.length < minPoints) {
      labels[i] = -1;
    } else {
      expandCluster(features, labels, i, neighbors, clusterId, eps, minPoints);
      clusterId++;
    }
  }

  const centroids = [];
  for (let c = 0; c < clusterId; c++) {
    const clusterPoints = features.filter((_, i) => labels[i] === c);
    if (clusterPoints.length > 0) centroids.push(calculateCentroid(clusterPoints));
  }

  return { clusters: labels, centroids };
}

/**
 * PCA via power iteration.
 * Reduces features (n × d) to (n × dimensions).
 * 10 iterations per eigenvector — sufficient for visualization at ≤500 rows.
 */
export function performPCA(features, dimensions) {
  const n = features.length;
  if (n === 0) return [];
  const d = features[0].length;
  const outDims = Math.min(dimensions, d);

  // Centre each column
  const means = new Array(d).fill(0);
  for (const row of features) {
    for (let j = 0; j < d; j++) means[j] += row[j];
  }
  for (let j = 0; j < d; j++) means[j] /= n;

  const X = features.map((row) => row.map((v, j) => v - means[j]));

  // Covariance matrix (d × d) = X^T X / (n-1)
  const denom = Math.max(n - 1, 1);
  const cov = Array.from({ length: d }, () => new Array(d).fill(0));
  for (const row of X) {
    for (let i = 0; i < d; i++) {
      for (let j = 0; j < d; j++) {
        cov[i][j] += (row[i] * row[j]) / denom;
      }
    }
  }

  // Power iteration for top-outDims eigenvectors with deflation
  const eigenvectors = [];
  const workCov = cov.map((row) => [...row]);

  for (let e = 0; e < outDims; e++) {
    let v = new Array(d).fill(0);
    v[e % d] = 1;

    for (let iter = 0; iter < 10; iter++) {
      const w = new Array(d).fill(0);
      for (let i = 0; i < d; i++) {
        for (let j = 0; j < d; j++) {
          w[i] += workCov[i][j] * v[j];
        }
      }
      const norm = Math.sqrt(w.reduce((s, x) => s + x * x, 0)) || 1;
      v = w.map((x) => x / norm);
    }
    eigenvectors.push(v);

    // Deflate
    let eigenvalue = 0;
    for (let i = 0; i < d; i++) {
      let tmp = 0;
      for (let j = 0; j < d; j++) tmp += workCov[i][j] * v[j];
      eigenvalue += v[i] * tmp;
    }
    for (let i = 0; i < d; i++) {
      for (let j = 0; j < d; j++) {
        workCov[i][j] -= eigenvalue * v[i] * v[j];
      }
    }
  }

  return X.map((row) =>
    eigenvectors.map((ev) => row.reduce((s, x, j) => s + x * ev[j], 0)),
  );
}

// ── helpers ──────────────────────────────────────────────────────────────────

function initializeCentroidsKMeansPlusPlus(features, numClusters) {
  const centroids = [];
  const numPoints = features.length;
  centroids.push([...features[Math.floor(Math.random() * numPoints)]]);

  for (let c = 1; c < numClusters; c++) {
    const distances = new Array(numPoints);
    let totalDistance = 0;
    for (let i = 0; i < numPoints; i++) {
      let minDist = Infinity;
      for (const centroid of centroids) {
        minDist = Math.min(minDist, euclideanDistance(features[i], centroid));
      }
      distances[i] = minDist * minDist;
      totalDistance += distances[i];
    }
    let randomValue = Math.random() * totalDistance;
    let cumulative = 0;
    for (let i = 0; i < numPoints; i++) {
      cumulative += distances[i];
      if (cumulative >= randomValue) {
        centroids.push([...features[i]]);
        break;
      }
    }
  }
  return centroids;
}

function expandCluster(features, labels, pointIndex, neighbors, clusterId, eps, minPoints) {
  labels[pointIndex] = clusterId;
  const queue = [...neighbors];
  let i = 0;
  while (i < queue.length) {
    const currentPoint = queue[i];
    if (labels[currentPoint] === -1) {
      labels[currentPoint] = clusterId;
    } else if (labels[currentPoint] !== -1) {
      i++;
      continue;
    } else {
      labels[currentPoint] = clusterId;
      const currentNeighbors = getNeighbors(features, currentPoint, eps);
      if (currentNeighbors.length >= minPoints) {
        for (const neighbor of currentNeighbors) {
          if (!queue.includes(neighbor)) queue.push(neighbor);
        }
      }
    }
    i++;
  }
}

function getNeighbors(features, pointIndex, eps) {
  return features
    .map((_, i) => i)
    .filter((i) => i !== pointIndex && euclideanDistance(features[pointIndex], features[i]) <= eps);
}

function euclideanDistance(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

function calculateCentroid(points) {
  if (points.length === 0) return [];
  const numFeatures = points[0].length;
  const centroid = new Array(numFeatures).fill(0);
  for (const point of points) {
    for (let i = 0; i < numFeatures; i++) centroid[i] += point[i];
  }
  return centroid.map((s) => s / points.length);
}
