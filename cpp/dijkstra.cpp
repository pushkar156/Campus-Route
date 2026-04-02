#include "graph.h"
#include <queue>
#include <climits>
#include <algorithm>

// Dijkstra's Algorithm — Shortest Path
// Time Complexity: O((V + E) log V) using min-heap
// Space Complexity: O(V)

struct DijkstraResult {
    vector<int> dist;
    vector<int> parent;
};

DijkstraResult dijkstra(const Graph& graph, int source) {
    int n = graph.getNumNodes();
    vector<int> dist(n, INT_MAX);
    vector<int> parent(n, -1);
    // Min-heap: (distance, node)
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;

    dist[source] = 0;
    pq.push({0, source});

    while (!pq.empty()) {
        pair<int, int> top = pq.top();
        int d = top.first;
        int u = top.second;
        pq.pop();

        if (d > dist[u]) continue; // Skip outdated entries

        for (const auto& edge : graph.getNeighbors(u)) {
            int v = edge.dest;
            int w = edge.weight;
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                parent[v] = u;
                pq.push({dist[v], v});
            }
        }
    }

    return {dist, parent};
}

// Reconstruct path from source to destination
vector<int> reconstructPath(const vector<int>& parent, int dest) {
    vector<int> path;
    for (int v = dest; v != -1; v = parent[v]) {
        path.push_back(v);
    }
    reverse(path.begin(), path.end());
    return path;
}

// JSON output for Flask integration
string dijkstraJSON(const Graph& graph, int source, int dest) {
    DijkstraResult result = dijkstra(graph, source);

    string json = "{";
    json += "\"algorithm\":\"Dijkstra\",";
    json += "\"source\":\"" + graph.getNodeName(source) + "\",";
    json += "\"destination\":\"" + graph.getNodeName(dest) + "\",";

    if (result.dist[dest] == INT_MAX) {
        json += "\"distance\":-1,";
        json += "\"path\":[],";
        json += "\"message\":\"No path exists\"";
    } else {
        json += "\"distance\":" + to_string(result.dist[dest]) + ",";
        vector<int> path = reconstructPath(result.parent, dest);
        json += "\"path\":[";
        for (int i = 0; i < (int)path.size(); i++) {
            json += "\"" + graph.getNodeName(path[i]) + "\"";
            if (i < (int)path.size() - 1) json += ",";
        }
        json += "],";
        json += "\"message\":\"Shortest path found\"";
    }

    json += "}";
    return json;
}
