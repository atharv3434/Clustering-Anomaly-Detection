/**
 * kmeans.js — K-Means Clustering (Lloyd's Algorithm)
 *
 * Algorithm:
 *   1. Initialise K centroids using K-Means++ (spread initialisation)
 *   2. Assign each point to nearest centroid (Euclidean distance)
 *   3. Recompute centroids as mean of assigned points
 *   4. Repeat 2-3 until convergence or maxIter
 *
 * Returns cluster labels, centroids, inertia (WCSS), and silhouette score.
 */

const { euclidean, silhouetteScore } = require('../utils/stats');

/**
 * K-Means++ initialisation — spreads initial centroids for better convergence.
 * @param {number[][]} points
 * @param {number} k
 * @returns {number[][]} initial centroids
 */
function initCentroidsKMeansPlusPlus(points, k) {
  const centroids = [];
  // Pick first centroid randomly
  centroids.push(points[Math.floor(Math.random() * points.length)]);

  for (let c = 1; c < k; c++) {
    // Weight each point by squared distance to nearest centroid
    const dists = points.map(p => {
      const minDist = Math.min(...centroids.map(c => euclidean(p, c)));
      return minDist * minDist;
    });
    const total = dists.reduce((s, d) => s + d, 0);
    let r = Math.random() * total;
    for (let i = 0; i < points.length; i++) {
      r -= dists[i];
      if (r <= 0) { centroids.push(points[i]); break; }
    }
    if (centroids.length <= c) centroids.push(points[points.length - 1]);
  }
  return centroids;
}

/**
 * Assign each point to the nearest centroid.
 * @returns {number[]} label array
 */
function assignLabels(points, centroids) {
  return points.map(p => {
    let best = 0, bestDist = Infinity;
    centroids.forEach((c, i) => {
      const d = euclidean(p, c);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    return best;
  });
}

/**
 * Recompute centroids as the mean of all assigned points.
 * @returns {number[][]} new centroids
 */
function recomputeCentroids(points, labels, k, dims) {
  const sums   = Array.from({ length: k }, () => new Array(dims).fill(0));
  const counts = new Array(k).fill(0);

  points.forEach((p, i) => {
    const lbl = labels[i];
    counts[lbl]++;
    p.forEach((v, d) => { sums[lbl][d] += v; });
  });

  return sums.map((s, i) =>
    counts[i] === 0
      ? points[Math.floor(Math.random() * points.length)]  // reinitialise empty cluster
      : s.map(v => v / counts[i])
  );
}

/**
 * Within-cluster sum of squares (inertia).
 */
function computeInertia(points, labels, centroids) {
  return points.reduce((sum, p, i) => {
    const d = euclidean(p, centroids[labels[i]]);
    return sum + d * d;
  }, 0);
}

/**
 * Run K-Means clustering.
 *
 * @param {number[][]} points  - array of feature vectors
 * @param {number}     k       - number of clusters
 * @param {number}     maxIter - maximum iterations (default 300)
 * @param {number}     tol     - convergence tolerance (default 1e-4)
 * @returns {{ labels, centroids, inertia, iterations, silhouette, clusterSizes }}
 */
function kmeans(points, k = 3, maxIter = 300, tol = 1e-4) {
  if (!points || points.length === 0) throw new Error('No data points provided');
  if (k < 1 || k > points.length) throw new Error(`k must be between 1 and ${points.length}`);

  const dims = points[0].length;
  let centroids = initCentroidsKMeansPlusPlus(points, k);
  let labels    = new Array(points.length).fill(0);
  let iterations = 0;

  for (let iter = 0; iter < maxIter; iter++) {
    iterations++;
    const newLabels   = assignLabels(points, centroids);
    const newCentroids = recomputeCentroids(points, newLabels, k, dims);

    // Check convergence
    const shift = centroids.reduce((max, c, i) =>
      Math.max(max, euclidean(c, newCentroids[i])), 0);

    labels    = newLabels;
    centroids = newCentroids;
    if (shift < tol) break;
  }

  const inertia = computeInertia(points, labels, centroids);

  // Cluster sizes
  const clusterSizes = new Array(k).fill(0);
  labels.forEach(l => clusterSizes[l]++);

  // Silhouette score (capped at 500 points for performance)
  const sample    = points.length > 500 ? points.slice(0, 500) : points;
  const sampleLbl = labels.slice(0, sample.length);
  const silhouette = k > 1 ? silhouetteScore(sample, sampleLbl, k) : 0;

  return { labels, centroids, inertia: Math.round(inertia * 100) / 100,
           iterations, silhouette: Math.round(silhouette * 10000) / 10000,
           clusterSizes, k };
}

module.exports = { kmeans };