#include "graph.h"
#include <queue>
#include <climits>
#include <algorithm>

// =============================================
// Prim's Algorithm — Minimum Spanning Tree
// Time Complexity: O((V + E) log V) with min-heap
// Space Complexity: O(V + E)
// =============================================

struct MSTEdge {
    int src, dest, weight;
};

vector<MSTEdge> primMST(const Graph& graph) {
    int n = graph.getNumNodes();
    vector<bool> inMST(n, false);
    vector<int> key(n, INT_MAX);
    vector<int> parent(n, -1);
    vector<MSTEdge> mstEdges;

    // Min-heap: (weight, node)
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;

    key[0] = 0;
    pq.push({0, 0});

    while (!pq.empty()) {
        int u = pq.top().second;
        pq.pop();

        if (inMST[u]) continue;
        inMST[u] = true;

        if (parent[u] != -1) {
            mstEdges.push_back({parent[u], u, key[u]});
        }

        for (const auto& edge : graph.getNeighbors(u)) {
            int v = edge.dest;
            int w = edge.weight;
            if (!inMST[v] && w < key[v]) {
                key[v] = w;
                parent[v] = u;
                pq.push({w, v});
            }
        }
    }
    return mstEdges;
}

// =============================================
// Kruskal's Algorithm — Minimum Spanning Tree
// Uses Union-Find (Disjoint Set Union)
// Time Complexity: O(E log E)
// Space Complexity: O(V + E)
// =============================================

class UnionFind {
    vector<int> parent, rank_;
public:
    UnionFind(int n) : parent(n), rank_(n, 0) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }

    int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]); // Path compression
        return parent[x];
    }

    bool unite(int x, int y) {
        int px = find(x), py = find(y);
        if (px == py) return false;
        if (rank_[px] < rank_[py]) swap(px, py); // Union by rank
        parent[py] = px;
        if (rank_[px] == rank_[py]) rank_[px]++;
        return true;
    }
};

vector<MSTEdge> kruskalMST(const Graph& graph) {
    int n = graph.getNumNodes();
    vector<MSTEdge> allEdges, mstEdges;

    // Collect all edges (avoid duplicates for undirected graph)
    for (int u = 0; u < n; u++) {
        for (const auto& edge : graph.getNeighbors(u)) {
            if (u < edge.dest) {
                allEdges.push_back({u, edge.dest, edge.weight});
            }
        }
    }

    // Sort edges by weight (Greedy choice)
    sort(allEdges.begin(), allEdges.end(),
         [](const MSTEdge& a, const MSTEdge& b) { return a.weight < b.weight; });

    UnionFind uf(n);

    for (const auto& edge : allEdges) {
        if (uf.unite(edge.src, edge.dest)) {
            mstEdges.push_back(edge);
            if ((int)mstEdges.size() == n - 1) break;
        }
    }
    return mstEdges;
}

// JSON output for Flask integration
string mstJSON(const Graph& graph, const string& algo) {
    vector<MSTEdge> edges;
    if (algo == "prim") {
        edges = primMST(graph);
    } else {
        edges = kruskalMST(graph);
    }

    int totalCost = 0;
    for (const auto& e : edges) totalCost += e.weight;

    string json = "{";
    json += "\"algorithm\":\"" + (algo == "prim" ? string("Prim") : string("Kruskal")) + "\",";
    json += "\"totalCost\":" + to_string(totalCost) + ",";
    json += "\"edges\":[";
    for (int i = 0; i < (int)edges.size(); i++) {
        json += "{\"from\":\"" + graph.getNodeName(edges[i].src) + "\",";
        json += "\"to\":\"" + graph.getNodeName(edges[i].dest) + "\",";
        json += "\"weight\":" + to_string(edges[i].weight) + "}";
        if (i < (int)edges.size() - 1) json += ",";
    }
    json += "],";
    json += "\"edgeCount\":" + to_string(edges.size());
    json += "}";
    return json;
}
