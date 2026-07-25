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
