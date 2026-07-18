/**
 * dbscan.js — Density-Based Spatial Clustering of Applications with Noise
 *
 * Algorithm:
 *   For each unvisited point P:
 *     Find all neighbours within epsilon radius
 *     If neighbours >= minPts  → expand cluster (core point)
 *     Else mark as noise (-1)  → ANOMALY
 *
 * Key advantage: automatically detects anomalies as noise points (label = -1),
 * and discovers clusters of arbitrary shape without needing to specify K.
 *
 * Time complexity: O(n²) naive; O(n log n) with spatial index.
 */

const { euclidean } = require('../utils/stats');

const NOISE     = -1;
const UNVISITED = -2;

/**
 * Find all points within epsilon of the query point.
 * @returns {number[]} indices of neighbours
 */
function rangeQuery(points, idx, epsilon) {
  const neighbours = [];
  const q = points[idx];
  for (let i = 0; i < points.length; i++) {
    if (euclidean(q, points[i]) <= epsilon) {
      neighbours.push(i);
    }
  }
  return neighbours;
}

/**
 * Expand a cluster from a core point by adding density-reachable points.
 */
function expandCluster(points, labels, idx, neighbours, clusterId, epsilon, minPts) {
  labels[idx] = clusterId;
  let i = 0;
  while (i < neighbours.length) {
    const nIdx = neighbours[i];
    if (labels[nIdx] === NOISE) {
      labels[nIdx] = clusterId;   // border point — add to cluster
    }
    if (labels[nIdx] === UNVISITED) {
      labels[nIdx] = clusterId;
      const nNeighbours = rangeQuery(points, nIdx, epsilon);
      if (nNeighbours.length >= minPts) {
        // nIdx is also a core point — add its neighbours
        neighbours.push(...nNeighbours.filter(n => !neighbours.includes(n)));
      }
    }
    i++;
  }
}

/**
 * Run DBSCAN.
 *
 * @param {number[][]} points   - feature vectors
 * @param {number}     epsilon  - neighbourhood radius (default 0.5)
 * @param {number}     minPts   - minimum neighbours to be a core point (default 5)
 * @returns {{ labels, numClusters, anomalies, anomalyIndices, clusterSizes }}
 */
function dbscan(points, epsilon = 0.5, minPts = 5) {
  if (!points || points.length === 0) throw new Error('No data points provided');
  if (epsilon <= 0) throw new Error('epsilon must be > 0');
  if (minPts < 1)   throw new Error('minPts must be >= 1');

  const labels = new Array(points.length).fill(UNVISITED);
  let   clusterId = 0;

  for (let i = 0; i < points.length; i++) {
    if (labels[i] !== UNVISITED) continue;

    const neighbours = rangeQuery(points, i, epsilon);

    if (neighbours.length < minPts) {
      labels[i] = NOISE;   // noise / anomaly
    } else {
      expandCluster(points, labels, i, neighbours, clusterId, epsilon, minPts);
      clusterId++;
    }
  }

  const numClusters    = clusterId;
  const anomalyIndices = labels.reduce((acc, l, i) => l === NOISE ? [...acc, i] : acc, []);
  const anomalies      = anomalyIndices.length;

  // Cluster sizes (excluding noise)
  const clusterSizes = new Array(numClusters).fill(0);
  labels.forEach(l => { if (l >= 0) clusterSizes[l]++; });

  return {
    labels,        // -1 = anomaly, 0..N = cluster ID
    numClusters,
    anomalies,
    anomalyIndices,
    clusterSizes,
    epsilon,
    minPts,
    anomalyRate: Math.round((anomalies / points.length) * 10000) / 100,
  };
}

module.exports = { dbscan };