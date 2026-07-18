/**
 * zscore.js — Z-Score Statistical Anomaly Detection
 *
 * For each feature, compute mean and standard deviation.
 * A point is an anomaly if |z| > threshold for ANY feature.
 * Also computes a combined Mahalanobis-style anomaly score.
 */

/**
 * Run Z-Score anomaly detection.
 *
 * @param {number[][]} points      - feature vectors
 * @param {number}     threshold   - |z| threshold (default 3.0 = 99.7% rule)
 * @returns {{ scores, labels, zScores, featureStats, anomalyIndices }}
 */
function zscoreDetection(points, threshold = 3.0) {
    if (!points || points.length === 0) throw new Error('No data points provided');
  
    const n    = points.length;
    const dims = points[0].length;
  
    // Compute per-feature mean and std
    const means = new Array(dims).fill(0);
    const stds  = new Array(dims).fill(0);
  
    points.forEach(p => p.forEach((v, d) => { means[d] += v; }));
    means.forEach((_, d) => { means[d] /= n; });
  
    points.forEach(p => p.forEach((v, d) => {
      const diff = v - means[d];
      stds[d] += diff * diff;
    }));
    stds.forEach((_, d) => { stds[d] = Math.sqrt(stds[d] / n) || 1e-10; });
  
    // Z-score for each point × feature
    const zScores = points.map(p =>
      p.map((v, d) => Math.abs((v - means[d]) / stds[d]))
    );
  
    // Combined score = max z across features (conservative)
    const scores = zScores.map(zs => Math.max(...zs));
  
    const labels         = scores.map(s => (s > threshold ? 1 : 0));
    const anomalyIndices = labels.reduce((acc, l, i) => l === 1 ? [...acc, i] : acc, []);
  
    const featureStats = means.map((m, d) => ({
      feature: d,
      mean:    Math.round(m * 10000) / 10000,
      std:     Math.round(stds[d] * 10000) / 10000,
    }));
  
    return {
      scores:         scores.map(s => Math.round(s * 10000) / 10000),
      labels,
      zScores:        zScores.map(zs => zs.map(z => Math.round(z * 100) / 100)),
      featureStats,
      threshold,
      anomalyIndices,
      anomalies:      anomalyIndices.length,
      anomalyRate:    Math.round((anomalyIndices.length / n) * 10000) / 100,
    };
  }
  
  module.exports = { zscoreDetection };