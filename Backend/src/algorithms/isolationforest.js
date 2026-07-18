/**
 * isolationForest.js — Isolation Forest Anomaly Detection
 *
 * Principle:
 *   Anomalies are "isolated" with fewer random splits than normal points.
 *   Build an ensemble of random isolation trees; average path length
 *   across trees gives an anomaly score in (0, 1].
 *   Score → 1.0 means more anomalous; → 0.0 means more normal.
 *
 * Algorithm per tree:
 *   1. Subsample the data
 *   2. Recursively split on a random feature with a random threshold
 *   3. Record the depth at which each point is isolated
 *
 * Reference: Liu, Ting & Zhou (2008) — "Isolation Forest"
 */

/**
 * Expected average path length for a BST of n points.
 * Used to normalise path lengths into scores.
 */
function avgPathLength(n) {
    if (n <= 1) return 0;
    if (n === 2) return 1;
    // Approximation: 2 * H(n-1) - (2*(n-1)/n) where H is harmonic number
    const H = Math.log(n - 1) + 0.5772156649;
    return 2 * H - (2 * (n - 1) / n);
  }
  
  /**
   * Build one isolation tree on a subsample of points.
   * Returns a recursive node structure.
   */
  function buildTree(points, indices, depth, maxDepth) {
    if (depth >= maxDepth || indices.length <= 1) {
      return { type: 'leaf', size: indices.length };
    }
  
    const dims = points[0].length;
    const feat = Math.floor(Math.random() * dims);
  
    const vals = indices.map(i => points[i][feat]);
    const min  = Math.min(...vals);
    const max  = Math.max(...vals);
  
    if (min === max) return { type: 'leaf', size: indices.length };
  
    const threshold = min + Math.random() * (max - min);
  
    const left  = indices.filter(i => points[i][feat] <  threshold);
    const right = indices.filter(i => points[i][feat] >= threshold);
  
    return {
      type:      'node',
      feat,
      threshold,
      left:  buildTree(points, left,  depth + 1, maxDepth),
      right: buildTree(points, right, depth + 1, maxDepth),
    };
  }
  
  /**
   * Compute path length for a single point through one tree.
   */
  function pathLength(point, node, depth = 0) {
    if (node.type === 'leaf') {
      return depth + avgPathLength(node.size);
    }
    if (point[node.feat] < node.threshold) {
      return pathLength(point, node.left,  depth + 1);
    }
    return pathLength(point, node.right, depth + 1);
  }
  
  /**
   * Run Isolation Forest.
   *
   * @param {number[][]} points         - feature vectors
   * @param {number}     numTrees       - number of trees in ensemble (default 100)
   * @param {number}     subsampleSize  - subsample per tree (default 256)
   * @param {number}     contamination  - expected fraction of anomalies (default 0.1)
   * @returns {{ scores, labels, threshold, anomalyIndices, anomalies }}
   */
  function isolationForest(points, numTrees = 100, subsampleSize = 256, contamination = 0.1) {
    if (!points || points.length === 0) throw new Error('No data points provided');
  
    const n       = points.length;
    const sSize   = Math.min(subsampleSize, n);
    const maxDepth = Math.ceil(Math.log2(sSize));
  
    // Build forest
    const trees = [];
    for (let t = 0; t < numTrees; t++) {
      // Random subsample (without replacement)
      const shuffled = [...Array(n).keys()].sort(() => Math.random() - 0.5);
      const indices  = shuffled.slice(0, sSize);
      trees.push(buildTree(points, indices, 0, maxDepth));
    }
  
    // Score each point
    const c    = avgPathLength(sSize);
    const scores = points.map(p => {
      const avgLen = trees.reduce((sum, tree) => sum + pathLength(p, tree), 0) / numTrees;
      // Normalised score: 0.5 = normal, → 1.0 = anomalous
      return Math.pow(2, -avgLen / c);
    });
  
    // Threshold based on contamination
    const sorted    = [...scores].sort((a, b) => b - a);
    const cutIdx    = Math.floor(n * contamination);
    const threshold = sorted[Math.min(cutIdx, sorted.length - 1)];
  
    const labels         = scores.map(s => (s >= threshold ? 1 : 0));  // 1 = anomaly
    const anomalyIndices = labels.reduce((acc, l, i) => l === 1 ? [...acc, i] : acc, []);
  
    return {
      scores:         scores.map(s => Math.round(s * 10000) / 10000),
      labels,
      threshold:      Math.round(threshold * 10000) / 10000,
      anomalyIndices,
      anomalies:      anomalyIndices.length,
      anomalyRate:    Math.round((anomalyIndices.length / n) * 10000) / 100,
      numTrees,
      contamination,
    };
  }
  
  module.exports = { isolationForest };