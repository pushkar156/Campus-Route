#include "graph.h"
#include <queue>
#include <stack>

// BFS — Breadth First Search
// Time Complexity: O(V + E)
// Space Complexity: O(V)

vector<int> bfs(const Graph& graph, int start) {
    int n = graph.getNumNodes();
    vector<bool> visited(n, false);
    vector<int> order;
    queue<int> q;

    visited[start] = true;
    q.push(start);

    while (!q.empty()) {
        int u = q.front();
        q.pop();
        order.push_back(u);

        for (const auto& edge : graph.getNeighbors(u)) {
            if (!visited[edge.dest]) {
                visited[edge.dest] = true;
                q.push(edge.dest);
            }
        }
    }
    return order;
}

// DFS — Depth First Search (Iterative)
// Time Complexity: O(V + E)
// Space Complexity: O(V)

vector<int> dfs(const Graph& graph, int start) {
    int n = graph.getNumNodes();
    vector<bool> visited(n, false);
    vector<int> order;
    stack<int> s;

    s.push(start);

    while (!s.empty()) {
        int u = s.top();
        s.pop();

        if (visited[u]) continue;
        visited[u] = true;
        order.push_back(u);

        // Push neighbors in reverse for consistent ordering
        const auto& neighbors = graph.getNeighbors(u);
        for (int i = (int)neighbors.size() - 1; i >= 0; i--) {
            if (!visited[neighbors[i].dest]) {
                s.push(neighbors[i].dest);
            }
        }
    }
    return order;
}

// JSON output for Flask integration
string bfsDfsJSON(const Graph& graph, int start, const string& type) {
    vector<int> order;
    if (type == "bfs") {
        order = bfs(graph, start);
    } else {
        order = dfs(graph, start);
    }

    string json = "{";
    json += "\"algorithm\":\"" + (type == "bfs" ? string("BFS") : string("DFS")) + "\",";
    json += "\"start\":\"" + graph.getNodeName(start) + "\",";
    json += "\"traversal\":[";
    for (int i = 0; i < (int)order.size(); i++) {
        json += "\"" + graph.getNodeName(order[i]) + "\"";
        if (i < (int)order.size() - 1) json += ",";
    }
    json += "],";
    json += "\"nodesVisited\":" + to_string(order.size());
    json += "}";
    return json;
}
