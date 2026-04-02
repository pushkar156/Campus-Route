# 📍 CampusRoute — MIT-WPU Smart Navigation System

[![Technology: C++](https://img.shields.io/badge/Algorithms-C%2B%2B-blue?logo=cplusplus)](https://isocpp.org/)
[![Backend: Flask](https://img.shields.io/badge/Backend-Flask-lightgrey?logo=flask)](https://flask.palletsprojects.com/)
[![Frontend: React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)](https://reactjs.org/)

**CampusRoute** is a comprehensive campus navigation and infrastructure planning system specifically designed for the **MIT-WPU Pune** campus. Using advanced **Design and Analysis of Algorithms (DAA)** concepts, it solves real-world navigation and cost-optimization problems with a high-performance C++ engine and a sleek React dashboard.

---

## 🚀 Key Modules & Features

### 1. 🚶 Pathfinding (Shortest Path)
Find the quickest walking route between any two campus locations (e.g., Main Gate to Library).
- **Algorithm**: Dijkstra's Algorithm (using Min-Heap priority queue).
- **Complexity**: $O((V + E) \log V)$

### 2. 🌐 Campus Explorer (Traversal)
Visualize the logical discovery and connectivity of campus facilities.
- **Algorithms**: BFS (Breadth-First Search) and DFS (Depth-First Search).
- **Complexity**: $O(V + E)$

### 3. 🏗️ Infrastructure Planner (MST)
Optimize the total cost of installing campus-wide cabling or piping across all 16 major nodes.
- **Algorithms**: Prim's & Kruskal's (Minimum Spanning Tree).
- **Complexity**: $O(E \log E)$ or $O(E \log V)$

### 4. 🧱 Project Timeline (Topological Sort)
Generate a dependency-aware construction timeline for campus build projects.
- **Algorithm**: Kahn’s Algorithm (Topological Sort).
- **Complexity**: $O(V + E)$

### 5. 📑 Location Directory (Hash Table)
Instant, O(1) lookup service for campus information and metadata based on location names.
- **Algorithms**: Hash Table (with djb2 hashing & chaining) and AVL Tree (for sorted listing).

---

## 🛠️ Tech Stack & Architecture

- **Core Engine (C++)**: High-performance implementation of all graph algorithms and data structures.
- **Middleware (Python/Flask)**: Orchestrates the C++ engine via `subprocess` and provides a RESTful API.
- **Frontend (React/Vite)**: Premium Glassmorphism UI with an interactive **SVG-based dynamic graph visualization**.

---

## 📁 Project Structure

```text
Campus-Route/
├── 🧮 cpp/                # Core Algorithm Engine (C++17)
│   ├── main.cpp            # Entry point & command dispatcher
│   ├── graph.cpp           # Adjacency list & graph loading
│   ├── dijkstra.cpp        # Shortest path navigation
│   ├── bfs_dfs.cpp         # Traversal algorithms
│   ├── mst.cpp             # Infrastructure planning (Prim/Kruskal)
│   ├── topo.cpp            # Construction timeline logic
│   └── hash.cpp / avl.cpp  # Location directory structures
├── 🐍 backend/            # Python Flask REST API
│   ├── app.py              # Main API server
│   └── requirements.txt    # Python dependencies
├── ⚛️ frontend/           # React + Vite Dashboard
│   ├── src/                # UI components & logic
│   └── App.jsx             # Main interactive dashboard
└── 📊 data/               # Graph dataset
    └── campus_graph.txt    # MIT-WPU node & edge information
```

---

## 🏁 Get Started Locally

Follow these steps to set up the project on your machine:

### 1. Prerequisite (C++ Compilation)
Ensure you have `g++` installed. Compile the core engine in the `cpp/` directory:
```bash
cd cpp
g++ -std=c++17 main.cpp graph.cpp dijkstra.cpp bfs_dfs.cpp mst.cpp topo.cpp avl.cpp hash.cpp -o campus.exe
cd ..
```

### 2. Start the Backend (Flask)
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate       # On Windows
pip install -r requirements.txt
python app.py
```

### 3. Start the Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

---

## 🗺️ Campus Graph Model
The system models 16 nodes (Main Gate, Main Building, Engineering Block, etc.) and 24 bidirectional edges based on the actual physical pathways of the MIT-WPU campus.

---

## 👨‍💻 Created for:
**Course**: Design and Analysis of Algorithms (DAA) — PBL Project  
**Affiliation**: MIT World Peace University (MIT-WPU), Pune
