# 🔍 Clustering & Anomaly Detection Platform

A full-stack ML platform for clustering data and detecting anomalies,
built with Express.js + React.

---

## ✨ Features

| Algorithm | Type | Use Case |
|-----------|------|----------|
| **K-Means** | Clustering | Partition data into K groups |
| **DBSCAN** | Clustering + Anomaly | Density-based clusters, noise = anomalies |
| **Isolation Forest** | Anomaly Detection | Score each point's isolation depth |
| **Z-Score** | Anomaly Detection | Statistical outlier detection |
| **PCA** | Dimensionality Reduction | Reduce to 2D for visualization |

---

## 🚀 Quick Start

### Backend
```bash
cd backend
npm install
npm start          # → http://localhost:5000
npm test           # run Jest tests
```

### Frontend
```bash
cd frontend
npm install
npm start          # → http://localhost:3000
```

---

## 📁 Project Structure

```
cluster-anomaly/
├── backend/
│   ├── src/
│   │   ├── server.js               # Express entry point
│   │   ├── algorithms/
│   │   │   ├── kmeans.js           # K-Means clustering
│   │   │   ├── dbscan.js           # DBSCAN clustering
│   │   │   ├── isolationForest.js  # Isolation Forest
│   │   │   ├── zscore.js           # Z-Score anomaly detection
│   │   │   └── pca.js              # PCA dimensionality reduction
│   │   ├── api/
│   │   │   └── routes.js           # All API routes
│   │   └── utils/
│   │       ├── dataParser.js       # CSV / JSON parser
│   │       └── stats.js            # Statistical helpers
│   ├── tests/
│   │   └── algorithms.test.js      # Jest unit tests
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── ClusterPage.jsx
    │   │   └── AnomalyPage.jsx
    │   ├── components/
    │   │   ├── ScatterPlot.jsx     # D3 scatter plot
    │   │   ├── DataUpload.jsx      # CSV upload
    │   │   ├── AlgoConfig.jsx      # Algorithm settings
    │   │   ├── ResultsPanel.jsx    # Stats summary
    │   │   └── Navbar.jsx
    │   ├── hooks/
    │   │   └── useApi.js           # API calls
    │   └── utils/
    │       └── colors.js           # Cluster color palette
    └── package.json
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/cluster/kmeans` | K-Means clustering |
| `POST` | `/api/cluster/dbscan` | DBSCAN clustering |
| `POST` | `/api/anomaly/isolation-forest` | Isolation Forest |
| `POST` | `/api/anomaly/zscore` | Z-Score detection |
| `POST` | `/api/reduce/pca` | PCA reduction |
| `POST` | `/api/analyze` | Full pipeline (cluster + anomaly) |
| `GET`  | `/api/samples` | Load sample datasets |
| `GET`  | `/health` | Health check |