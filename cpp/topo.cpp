#include "graph.h"
#include <queue>

// =============================================
// Topological Sort (Kahn's Algorithm — BFS-based)
// Time Complexity: O(V + E)
// Space Complexity: O(V)
//
// NOTE: Topological sort requires a DAG (Directed Acyclic Graph).
// The campus graph is undirected, so we model construction
// dependencies as a separate directed graph for this feature.
// =============================================

struct TopoGraph {
    int numNodes;
    vector<vector<int>> adj;
    vector<string> taskNames;
    vector<int> inDegree;
};

// Build a sample construction dependency DAG for MIT-WPU campus
TopoGraph buildConstructionDAG() {
    TopoGraph tg;
    tg.numNodes = 8;
    tg.adj.resize(tg.numNodes);
    tg.inDegree.resize(tg.numNodes, 0);
    tg.taskNames = {
        "Site Survey",
        "Foundation Work",
        "Road Construction",
        "Building Structure",
        "Electrical Wiring",
        "Plumbing",
        "Interior Finishing",
        "Landscaping"
    };

    // Dependencies: task A must be done before task B
    auto addDep = [&](int from, int to) {
        tg.adj[from].push_back(to);
        tg.inDegree[to]++;
    };

    addDep(0, 1); // Survey → Foundation
    addDep(0, 2); // Survey → Roads
    addDep(1, 3); // Foundation → Building
    addDep(2, 7); // Roads → Landscaping
    addDep(3, 4); // Building → Electrical
    addDep(3, 5); // Building → Plumbing
    addDep(4, 6); // Electrical → Interior
    addDep(5, 6); // Plumbing → Interior

    return tg;
}

// Kahn's Algorithm for topological ordering
vector<int> topologicalSort(const TopoGraph& tg) {
    int n = tg.numNodes;
    vector<int> inDeg = tg.inDegree;
    queue<int> q;
    vector<int> order;

    // Enqueue nodes with in-degree 0
    for (int i = 0; i < n; i++) {
        if (inDeg[i] == 0) q.push(i);
    }

    while (!q.empty()) {
        int u = q.front();
        q.pop();
        order.push_back(u);

        for (int v : tg.adj[u]) {
            inDeg[v]--;
            if (inDeg[v] == 0) q.push(v);
        }
    }

    return order; // If order.size() != n, cycle exists
}

// JSON output for Flask integration
string topoJSON() {
    TopoGraph tg = buildConstructionDAG();
    vector<int> order = topologicalSort(tg);

    string json = "{";
    json += "\"algorithm\":\"Topological Sort (Kahn)\",";
    json += "\"context\":\"Campus Construction Planning\",";

    if ((int)order.size() != tg.numNodes) {
        json += "\"error\":\"Cycle detected — no valid ordering\"";
    } else {
        json += "\"order\":[";
        for (int i = 0; i < (int)order.size(); i++) {
            json += "{\"step\":" + to_string(i + 1) + ",";
            json += "\"task\":\"" + tg.taskNames[order[i]] + "\"}";
            if (i < (int)order.size() - 1) json += ",";
        }
        json += "],";
        json += "\"totalPhases\":" + to_string(order.size());
    }

    json += "}";
    return json;
}
