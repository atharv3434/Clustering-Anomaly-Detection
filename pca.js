/**
 * pca.js — Principal Component Analysis (PCA)
 *
 * Reduces high-dimensional data to 2D for visualization.
 *
 * Steps:
 *   1. Center data (subtract mean per feature)
 *   2. Compute covariance matrix
 *   3. Eigen-decompose via power iteration (top 2 components)
 *   4. Project data onto PC1 and PC2
 *
 * This is a simplified PCA using the power method suitable for
 * up to ~50 features. For larger datasets, use a proper SVD library.
 */

/**
 * Compute column means of a matrix.
 */
 function columnMeans(matrix) {
    const n    = matrix.length;
    const dims = matrix[0].length;
    const means = new Array(dims).fill(0);
    matrix.forEach(row => row.forEach((v, d) => { means[d] += v / n; }));
    return means;
  }
  
  /**
   * Center the matrix by subtracting column means.
   */
  function centerMatrix(matrix, means) {
    return matrix.map(row => row.map((v, d) => v - means[d]));
  }
  
  /**
   * Compute covariance matrix (dims × dims).
   */
  function covarianceMatrix(centered) {
    const n    = centered.length;
    const dims = centered[0].length;
    const cov  = Array.from({ length: dims }, () => new Array(dims).fill(0));
    centered.forEach(row => {
      for (let i = 0; i < dims; i++) {
        for (let j = 0; j < dims; j++) {
          cov[i][j] += (row[i] * row[j]) / (n - 1);
        }
      }
    });
    return cov;
  }
  
  /**
   * Power iteration to find the dominant eigenvector.
   */
  function powerIteration(cov, iters = 100) {
    const dims = cov.length;
    let v = new Array(dims).fill(1 / Math.sqrt(dims));
    for (let i = 0; i < iters; i++) {
      // Av
      const av = cov.map(row => row.reduce((s, c, j) => s + c * v[j], 0));
      // Normalise
      const norm = Math.sqrt(av.reduce((s, x) => s + x * x, 0)) || 1;
      v = av.map(x => x / norm);
    }
    return v;
  }
  
  /**
   * Deflate matrix: remove contribution of eigenvector u (rank-1 subtraction).
   */
  function deflate(cov, u, eigenvalue) {
    const dims = cov.length;
    return cov.map((row, i) =>
      row.map((c, j) => c - eigenvalue * u[i] * u[j])
    );
  }
  
  /**
   * Project data matrix onto a single eigenvector.
   */
  function project(centered, vec) {
    return centered.map(row => row.reduce((s, v, d) => s + v * vec[d], 0));
  }
  
  /**
   * Explained variance ratio for a component.
   */
  function explainedVariance(cov, eigenvec) {
    const totalVar = cov.reduce((s, row, i) => s + row[i], 0);
    const compVar  = eigenvec.reduce((s, v, i) =>
      s + cov[i].reduce((ss, c, j) => ss + v * c * eigenvec[j], 0), 0);
    return totalVar > 0 ? Math.abs(compVar / totalVar) : 0;
  }
  
  /**
   * Run PCA and reduce to 2 dimensions.
   *
   * @param {number[][]} points - feature vectors (n × d)
   * @returns {{ reduced, pc1, pc2, explainedVariance, means }}
   *   reduced           — n × 2 matrix (PC1, PC2 coordinates)
   *   explainedVariance — [pc1_var%, pc2_var%]
   */
  function pca(points) {
    if (!points || points.length < 2) throw new Error('Need at least 2 points for PCA');
    const dims = points[0].length;
  
    // 1D data — just return as-is with zeros for second dim
    if (dims === 1) {
      const means = columnMeans(points);
      return {
        reduced: points.map(p => [p[0] - means[0], 0]),
        pc1: [1], pc2: [0],
        explainedVariance: [100, 0],
        means,
      };
    }
  
    const means    = columnMeans(points);
    const centered = centerMatrix(points, means);
    const cov      = covarianceMatrix(centered);
  
    // PC1
    const pc1  = powerIteration(cov);
    const ev1  = explainedVariance(cov, pc1);
    const proj1 = project(centered, pc1);
  
    // PC2 (deflate then find next component)
    const totalVar = cov.reduce((s, row, i) => s + row[i], 0);
    const lambda1  = pc1.reduce((s, v, i) => s + cov[i].reduce((ss, c, j) => ss + v * c * pc1[j], 0), 0);
    const deflated = deflate(cov, pc1, lambda1);
    const pc2      = powerIteration(deflated);
    const ev2      = explainedVariance(cov, pc2);
    const proj2    = project(centered, pc2);
  
    const reduced = proj1.map((v, i) => [
      Math.round(v * 10000) / 10000,
      Math.round(proj2[i] * 10000) / 10000,
    ]);
  
    return {
      reduced,
      pc1: pc1.map(v => Math.round(v * 10000) / 10000),
      pc2: pc2.map(v => Math.round(v * 10000) / 10000),
      explainedVariance: [
        Math.round(ev1 * 10000) / 100,
        Math.round(ev2 * 10000) / 100,
      ],
      means: means.map(v => Math.round(v * 10000) / 10000),
    };
  }
  
  module.exports = { pca };