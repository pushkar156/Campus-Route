# 📌 CampusRoute — MIT-WPU Smart Campus Navigation

**CampusRoute** is an advanced smart navigation and infrastructure planning system designed specifically for the **MIT World Peace University (MIT-WPU)** campus. By modeling the campus as a weighted graph, the system applies core **Design and Analysis of Algorithms (DAA)** concepts to solve real-world logistical challenges.

---

## 📝 One Line Description
A C++ powered algorithmic engine integrated with a Flask backend and modern web frontend for optimized campus navigation and infrastructure planning.

---

## 🎯 Objective
To implement an efficient, offline-first system that uses high-performance graph algorithms (Dijkstra, Prim, Kruskal) to provide shortest-path navigation and cost-effective infrastructure connectivity for the MIT-WPU campus.

---

## 🧩 Problem Statement
Navigating a sprawling campus like MIT-WPU is often challenging for newcomers. Standard mapping tools frequently lack the granularity of internal walkways and building-to-building shortcuts. Furthermore, planning connectivity (cables/pipes) requires algorithms that minimize installation costs—a classic DAA problem.

**Key Challenges:**
- Dependence on internet connectivity for existing maps.
- Lack of accurate internal campus pathway representation.
- Need for cost-efficient infrastructure planning.

---

## 💡 Proposed Solution
The MIT-WPU campus is modeled as a **Weighted Graph**:
- **Nodes**: Buildings and key locations (Main Gate, Library, Engineering Block).
- **Edges**: Pathways and roads connecting these locations.
- **Weights**: Actual walking distances in meters.

The system executes high-performance C++ implementations of DAA algorithms to process user queries via a sleek web interface.

---

# ⚙️ System Architecture

```text
Frontend (HTML5 / CSS3 / ES6)
        ↓  (Fetch API)
Flask Backend (Python 3.x)
        ↓  (Subprocess Execution)
C++ Executable (DAA Algorithm Engine)
```

### 🔄 Data Flow
1. **Input**: User selects source and destination via the web UI.
2. **Request**: Frontend sends an asynchronous REST API call to Flask.
3. **Execution**: Flask triggers the pre-compiled C++ executable with specific parameters.
4. **Processing**: The C++ engine runs the algorithm (e.g., Dijkstra) on the graph data.
5. **Output**: Result is returned as JSON to Flask, which then updates the Frontend UI.

---

# 🛠️ Tech Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Algorithm Engine** | C++ | High-performance DAA implementations |
| **Middleware** | Python (Flask) | API handling and C++ orchestration |
| **User Interface** | HTML, CSS, JavaScript | Premium, responsive web design |
| **Data Storage** | Adjacency List / txt | Graph representation and persistent storage |

---

## 🔹 Data Structures & Algorithms

### 📊 Data Structures
- **Weighted Adjacency List**: Efficient graph representation.
- **Min-Heap (Priority Queue)**: For optimizing Dijkstra and Prim's.
- **AVL Tree**: Self-balancing BST for sorted facility directories.
- **Hash Table**: Instant O(1) lookup for location details.

### 🧠 Core Algorithms
- **Dijkstra’s Algorithm**: Shortest path navigation for students.
- **BFS & DFS**: Exploration of campus connectivity.
- **Prim’s & Kruskal’s**: Minimum Spanning Tree for cost-efficient infrastructure.
- **Topological Sort**: Scheduling dependencies for construction planning.
- **Dynamic Programming (0/1 Knapsack)**: Resource management (Optional).
- **Backtracking (8-Queen)**: Optimization demos (Optional).

---

# 📁 Project Structure

```text
CampusRoute/
│
├── backend/
│   ├── app.py             # Flask API Server
│   └── requirements.txt    # Python dependencies
│
├── cpp/
│   ├── main.cpp           # CLI Driver
│   ├── graph.cpp/.h       # Graph DS implementation
│   ├── dijkstra.cpp       # Navigation Logic
│   ├── bfs_dfs.cpp        # Traversal Logic
│   ├── mst.cpp            # MST Algorithms
│   ├── topo.cpp           # Dependency Logic
│   ├── avl.cpp            # Sorted Storage
│   ├── hash.cpp           # Fast Lookup
│   └── campus.exe         # Compiled Engine
│
├── frontend/
│   ├── index.html         # UI Structure
│   ├── style.css          # Premium Styling
│   └── script.js          # Client-side Logic
│
├── data/
│   └── campus_graph.txt   # Campus Edge List
│
└── README.md              # Project Documentation
```

---

# 🚀 Key Features

- **🚶 Smart Navigation**: Get the absolute shortest walking path between any two campus locations.
- **🏗️ Infrastructure Planner**: Determine the minimum cost to connect university buildings with network cables or pipes.
- **🌐 Connectivity Explorer**: Visualize how buildings are interconnected using graph traversals.
- **🧱 Construction Scheduler**: Plan project phases logically using dependency resolution.
- **🔍 Instant Search**: Lightning-fast building lookup using specialized hashing techniques.

---

# 📚 DAA Syllabus Mapping

| Unit | Concepts Applied |
| :--- | :--- |
| **Unit I** | Time & Space Complexity, Asymptotic Notations |
| **Unit II** | Greedy Strategy (Dijkstra, Prim, Kruskal), Graph Traversals |
| **Unit III** | Dynamic Programming, Tree Balancing (AVL) |
| **Unit IV** | Backtracking & Optimization |
| **Unit V** | Hash Table (Collision handling via Chaining) |

---

# 🔧 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/pushkar156/Campus-Route.git
   cd Campus-Route
   ```

2. **Compile the C++ Engine:**
   ```bash
   cd cpp
   g++ main.cpp graph.cpp dijkstra.cpp bfs_dfs.cpp mst.cpp topo.cpp avl.cpp hash.cpp -o campus.exe
   ```

3. **Setup Flask Backend:**
   ```bash
   cd ../backend
   pip install -r requirements.txt
   python app.py
   ```

4. **Access the UI:**
   Open `http://127.0.0.1:5000` in your browser.

---

## ✨ Developed for DAA Mini Project
**Course**: Design and Analysis of Algorithms (Second Year PBL)
**Institution**: MIT World Peace University (MIT-WPU)
**Developer**: Pushkar (pushkar156)
