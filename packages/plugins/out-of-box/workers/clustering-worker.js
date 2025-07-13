// Clustering Web Worker
// Handles CPU-intensive clustering operations with built-in algorithms

self.onmessage = function (event) {
  const { type, task } = event.data;

  if (type === "task") {
    try {
      const result = performClustering(task.data);
      self.postMessage({
        type: "task-complete",
        taskId: task.id,
        result,
      });
    } catch (error) {
      self.postMessage({
        type: "task-complete",
        taskId: task.id,
        error: error.message,
      });
    }
  } else if (type === "terminate") {
    self.postMessage({ type: "terminated" });
    self.close();
  }
};

function performClustering(data) {
  const { algorithm, features, config } = data;

  if (algorithm === "kmeans") {
    return performKMeans(features, config);
  } else if (algorithm === "dbscan") {
    return performDBSCAN(features, config);
  } else {
    throw new Error(`Unknown clustering algorithm: ${algorithm}`);
  }
}

function performKMeans(features, config) {
  const { numClusters } = config;
  const maxIterations = 100;
  const tolerance = 1e-4;

  if (features.length === 0 || numClusters <= 0) {
    throw new Error("Invalid input parameters for K-means");
  }

  const numFeatures = features[0].length;
  const numPoints = features.length;

  // Initialize centroids using k-means++ method
  let centroids = initializeCentroidsKMeansPlusPlus(features, numClusters);
  let labels = new Array(numPoints);
  let converged = false;

  for (
    let iteration = 0;
    iteration < maxIterations && !converged;
    iteration++
  ) {
    // Assign points to nearest centroid
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

    // Update centroids
    const newCentroids = new Array(numClusters);
    for (let j = 0; j < numClusters; j++) {
      const clusterPoints = [];
      for (let i = 0; i < numPoints; i++) {
        if (newLabels[i] === j) {
          clusterPoints.push(features[i]);
        }
      }

      if (clusterPoints.length > 0) {
        newCentroids[j] = calculateCentroid(clusterPoints);
      } else {
        // Keep the old centroid if no points assigned
        newCentroids[j] = centroids[j];
      }
    }

    // Check for convergence
    converged = true;
    for (let j = 0; j < numClusters; j++) {
      const distance = euclideanDistance(centroids[j], newCentroids[j]);
      if (distance > tolerance) {
        converged = false;
        break;
      }
    }

    labels = newLabels;
    centroids = newCentroids;
  }

  return {
    clusters: labels,
    centroids: centroids,
  };
}

function performDBSCAN(features, config) {
  const { eps = 0.5, minPoints = 5 } = config;
  const numPoints = features.length;
  const labels = new Array(numPoints).fill(-1); // -1 means unclassified
  let clusterId = 0;

  for (let i = 0; i < numPoints; i++) {
    if (labels[i] !== -1) continue; // Already processed

    const neighbors = getNeighbors(features, i, eps);

    if (neighbors.length < minPoints) {
      labels[i] = -1; // Mark as noise
    } else {
      // Start a new cluster
      expandCluster(features, labels, i, neighbors, clusterId, eps, minPoints);
      clusterId++;
    }
  }

  // Calculate centroids for each cluster
  const centroids = [];
  for (let c = 0; c < clusterId; c++) {
    const clusterPoints = [];
    for (let i = 0; i < numPoints; i++) {
      if (labels[i] === c) {
        clusterPoints.push(features[i]);
      }
    }
    if (clusterPoints.length > 0) {
      centroids.push(calculateCentroid(clusterPoints));
    }
  }

  return {
    clusters: labels,
    centroids: centroids,
  };
}

function initializeCentroidsKMeansPlusPlus(features, numClusters) {
  const centroids = [];
  const numPoints = features.length;

  // Choose first centroid randomly
  const firstIndex = Math.floor(Math.random() * numPoints);
  centroids.push([...features[firstIndex]]);

  // Choose remaining centroids using k-means++
  for (let c = 1; c < numClusters; c++) {
    const distances = new Array(numPoints);
    let totalDistance = 0;

    // Calculate distance to nearest centroid for each point
    for (let i = 0; i < numPoints; i++) {
      let minDistance = Infinity;
      for (let j = 0; j < centroids.length; j++) {
        const distance = euclideanDistance(features[i], centroids[j]);
        minDistance = Math.min(minDistance, distance);
      }
      distances[i] = minDistance * minDistance; // Square the distance
      totalDistance += distances[i];
    }

    // Choose next centroid with probability proportional to squared distance
    let randomValue = Math.random() * totalDistance;
    let cumulativeDistance = 0;

    for (let i = 0; i < numPoints; i++) {
      cumulativeDistance += distances[i];
      if (cumulativeDistance >= randomValue) {
        centroids.push([...features[i]]);
        break;
      }
    }
  }

  return centroids;
}

function expandCluster(
  features,
  labels,
  pointIndex,
  neighbors,
  clusterId,
  eps,
  minPoints,
) {
  labels[pointIndex] = clusterId;

  const queue = [...neighbors];
  let i = 0;

  while (i < queue.length) {
    const currentPoint = queue[i];

    if (labels[currentPoint] === -1) {
      // Change noise to border point
      labels[currentPoint] = clusterId;
    } else if (labels[currentPoint] !== -1) {
      // Already processed
      i++;
      continue;
    } else {
      // Unclassified point
      labels[currentPoint] = clusterId;

      const currentNeighbors = getNeighbors(features, currentPoint, eps);
      if (currentNeighbors.length >= minPoints) {
        // Add new neighbors to queue
        for (const neighbor of currentNeighbors) {
          if (!queue.includes(neighbor)) {
            queue.push(neighbor);
          }
        }
      }
    }
    i++;
  }
}

function getNeighbors(features, pointIndex, eps) {
  const neighbors = [];
  const targetPoint = features[pointIndex];

  for (let i = 0; i < features.length; i++) {
    if (i !== pointIndex) {
      const distance = euclideanDistance(targetPoint, features[i]);
      if (distance <= eps) {
        neighbors.push(i);
      }
    }
  }

  return neighbors;
}

function euclideanDistance(point1, point2) {
  let sum = 0;
  for (let i = 0; i < point1.length; i++) {
    const diff = point1[i] - point2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

function calculateCentroid(points) {
  if (points.length === 0) return [];

  const numFeatures = points[0].length;
  const centroid = new Array(numFeatures).fill(0);

  for (const point of points) {
    for (let i = 0; i < numFeatures; i++) {
      centroid[i] += point[i];
    }
  }

  for (let i = 0; i < numFeatures; i++) {
    centroid[i] /= points.length;
  }

  return centroid;
}

// Error handling for uncaught exceptions
self.onerror = function (error) {
  self.postMessage({
    type: "error",
    error: error.message,
  });
};
