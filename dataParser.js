/**
 * dataParser.js — CSV / JSON data ingestion and validation
 */

/**
 * Parse CSV text into a 2D array of numbers.
 * Handles optional header row, comma/semicolon/tab delimiters.
 *
 * @param {string} csvText - raw CSV string
 * @param {boolean} hasHeader - skip first row if true
 * @returns {{ points, headers, errors }}
 */
function parseCsv(csvText, hasHeader = true) {
    const errors  = [];
    const lines   = csvText.trim().split(/\r?\n/).filter(l => l.trim());
  
    if (lines.length === 0) return { points: [], headers: [], errors: ['Empty CSV'] };
  
    // Auto-detect delimiter
    const delimiters = [',', ';', '\t', '|'];
    const delimiter  = delimiters.find(d => lines[0].includes(d)) || ',';
  
    let headers = [];
    let startRow = 0;
  
    if (hasHeader) {
      headers  = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
      startRow = 1;
    }
  
    const points = [];
    for (let r = startRow; r < lines.length; r++) {
      const cells = lines[r].split(delimiter).map(c => c.trim().replace(/^"|"$/g, ''));
      const row   = cells.map(c => {
        const n = parseFloat(c);
        return isNaN(n) ? null : n;
      });
  
      if (row.some(v => v === null)) {
        errors.push(`Row ${r + 1}: non-numeric values skipped`);
        continue;
      }
      points.push(row);
    }
  
    return { points, headers, errors };
  }
  
  /**
   * Validate that points are a well-formed 2D numeric array.
   */
  function validatePoints(points) {
    const errors = [];
  
    if (!Array.isArray(points)) return { valid: false, errors: ['points must be an array'] };
    if (points.length === 0)    return { valid: false, errors: ['points array is empty'] };
    if (points.length < 2)      errors.push('Warning: fewer than 2 points');
  
    const dims = points[0].length;
    if (dims === 0) return { valid: false, errors: ['Points have no features'] };
  
    for (let i = 0; i < points.length; i++) {
      if (!Array.isArray(points[i])) {
        errors.push(`Row ${i}: not an array`); continue;
      }
      if (points[i].length !== dims) {
        errors.push(`Row ${i}: dimension mismatch (expected ${dims}, got ${points[i].length})`);
      }
      if (points[i].some(v => typeof v !== 'number' || isNaN(v) || !isFinite(v))) {
        errors.push(`Row ${i}: contains non-finite values`);
      }
    }
  
    return { valid: errors.every(e => !e.startsWith('Row')), errors };
  }
  
  /**
   * Built-in sample datasets for demonstration.
   */
  function getSampleDataset(name) {
    switch (name) {
      case 'blobs':
        return generateBlobs(3, 80);
      case 'circles':
        return generateCircles(2, 100);
      case 'moons':
        return generateMoons(100);
      case 'anomalies':
        return generateWithAnomalies(150, 15);
      default:
        return generateBlobs(3, 80);
    }
  }
  
  function generateBlobs(k, pointsPerCluster) {
    const centers = [[2,2],[8,3],[5,8]].slice(0,k);
    const points  = [];
    centers.forEach(([cx,cy]) => {
      for (let i = 0; i < pointsPerCluster; i++) {
        points.push([
          cx + (Math.random()-0.5)*2,
          cy + (Math.random()-0.5)*2,
        ]);
      }
    });
    return shuffleArray(points);
  }
  
  function generateCircles(numCircles, pointsPerCircle) {
    const points = [];
    for (let c = 0; c < numCircles; c++) {
      const r = (c + 1) * 2;
      for (let i = 0; i < pointsPerCircle; i++) {
        const angle = (i / pointsPerCircle) * 2 * Math.PI;
        points.push([
          5 + r * Math.cos(angle) + (Math.random()-0.5)*0.4,
          5 + r * Math.sin(angle) + (Math.random()-0.5)*0.4,
        ]);
      }
    }
    return points;
  }
  
  function generateMoons(n) {
    const points = [];
    for (let i = 0; i < n; i++) {
      const angle = Math.PI * i / n;
      if (i < n/2) {
        points.push([Math.cos(angle)*3+5, Math.sin(angle)*3+5 + (Math.random()-0.5)*0.3]);
      } else {
        points.push([Math.cos(angle)*3+6, -Math.sin(angle)*3+5 + (Math.random()-0.5)*0.3]);
      }
    }
    return points;
  }
  
  function generateWithAnomalies(n, numAnomalies) {
    const points = generateBlobs(3, Math.floor(n / 3));
    // Inject anomalies at extreme positions
    for (let i = 0; i < numAnomalies; i++) {
      points.push([
        Math.random() * 20 - 2,
        Math.random() * 20 - 2,
      ]);
    }
    return shuffleArray(points);
  }
  
  function shuffleArray(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }
  
  module.exports = { parseCsv, validatePoints, getSampleDataset };