/**
 * stats.js — Statistical helper functions
 */

/**
 * Euclidean distance between two vectors.
 */
function euclidean(a, b) {
    return Math.sqrt(a.reduce((sum, v, i) => sum + (v - b[i]) ** 2, 0));
  }
  
  /**
   * Manhattan distance between two vectors.
   */
  function manhattan(a, b) {
    return a.reduce((sum, v, i) => sum + Math.abs(v - b[i]), 0);
  }
  
  /**
   * Mean of a numeric array.
   */
  function mean(arr) {
    return arr.reduce((s, v) => s + v, 0) / arr.length;
  }
  
  /**
   * Standard deviation of a numeric array.
   */
  function std(arr) {
    const m = mean(arr);
    return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
  }
  
  /**
   * Normalise a dataset to [0, 1] range per feature (min-max scaling).
   * @param {number[][]} points
   * @returns {{ normalised, mins, maxs }}
   */
  function minMaxNormalise(points) {
    const dims = points[0].length;
    const mins = new Array(dims).fill(Infinity);
    const maxs = new Array(dims).fill(-Infinity);
  
    points.forEach(p => p.forEach((v, d) => {
      if (v < mins[d]) mins[d] = v;
      if (v > maxs[d]) maxs[d] = v;
    }));
  
    const normalised = points.map(p =>
      p.map((v, d) => {
        const range = maxs[d] - mins[d];
        return range === 0 ? 0 : (v - mins[d]) / range;
      })
    );
    return { normalised, mins, maxs };
  }
  
  /**
   * Silhouette score for clustering quality.
   * Ranges from -1 (wrong cluster) to +1 (well-separated).
   *
   * @param {number[][]} points
   * @param {number[]}   labels
   * @param {number}     k
   */
  function silhouetteScore(points, labels, k) {
    if (k <= 1) return 0;
    const n = points.length;
    let total = 0;
  
    for (let i = 0; i < n; i++) {
      const myCluster = labels[i];
      const clusterPoints = points.filter((_, j) => labels[j] === myCluster);
  
      if (clusterPoints.length <= 1) { total += 0; continue; }
  
      // a(i) — mean distance to same-cluster points
      const a = clusterPoints.reduce((s, p) => s + euclidean(points[i], p), 0)
                / (clusterPoints.length - 1);
  
      // b(i) — min mean distance to other clusters
      let b = Infinity;
      for (let c = 0; c < k; c++) {
        if (c === myCluster) continue;
        const otherPts = points.filter((_, j) => labels[j] === c);
        if (otherPts.length === 0) continue;
        const avgDist = otherPts.reduce((s, p) => s + euclidean(points[i], p), 0) / otherPts.length;
        if (avgDist < b) b = avgDist;
      }
  
      if (b === Infinity) { total += 0; continue; }
      total += (b - a) / Math.max(a, b);
    }
    return total / n;
  }
  
  /**
   * Descriptive statistics for a dataset.
   */
  function describeDataset(points) {
    if (!points || points.length === 0) return {};
    const dims = points[0].length;
    const features = [];
  
    for (let d = 0; d < dims; d++) {
      const vals = points.map(p => p[d]).sort((a, b) => a - b);
      features.push({
        feature: d,
        min:    Math.round(vals[0] * 1000) / 1000,
        max:    Math.round(vals[vals.length - 1] * 1000) / 1000,
        mean:   Math.round(mean(vals) * 1000) / 1000,
        std:    Math.round(std(vals) * 1000) / 1000,
        median: Math.round(vals[Math.floor(vals.length / 2)] * 1000) / 1000,
      });
    }
    return {
      numPoints:    points.length,
      numFeatures:  dims,
      features,
    };
  }
  
  module.exports = { euclidean, manhattan, mean, std, minMaxNormalise,
                     silhouetteScore, describeDataset };