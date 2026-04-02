#include <iostream>
#include <string>
#include <cstring>
#include "graph.h"

// Forward declarations from algorithm modules
string dijkstraJSON(const Graph& graph, int source, int dest);
string bfsDfsJSON(const Graph& graph, int start, const string& type);
string mstJSON(const Graph& graph, const string& algo);
string topoJSON();
string hashSearchJSON(const Graph& graph, const string& query);
string hashAllJSON(const Graph& graph);
string avlSortedJSON(const Graph& graph);

// =============================================
// CampusRoute CLI Driver
// Usage:
//   campus.exe dijkstra <source_idx> <dest_idx>
//   campus.exe bfs <start_idx>
//   campus.exe dfs <start_idx>
//   campus.exe mst <prim|kruskal>
//   campus.exe topo
//   campus.exe search <location_name>
//   campus.exe sorted
//   campus.exe locations
// =============================================

void printUsage() {
    cout << "{\"error\":\"Invalid arguments\","
         << "\"usage\":["
         << "\"campus.exe dijkstra <src> <dest>\","
         << "\"campus.exe bfs <start>\","
         << "\"campus.exe dfs <start>\","
         << "\"campus.exe mst <prim|kruskal>\","
         << "\"campus.exe topo\","
         << "\"campus.exe search <location_name>\","
         << "\"campus.exe sorted\","
         << "\"campus.exe locations\""
         << "]}" << endl;
}

string locationsJSON(const Graph& graph) {
    string json = "{\"locations\":[";
    for (int i = 0; i < graph.getNumNodes(); i++) {
        json += "{\"index\":" + to_string(i) + ",";
        json += "\"name\":\"" + graph.getNodeName(i) + "\"}";
        if (i < graph.getNumNodes() - 1) json += ",";
    }
    json += "]}";
    return json;
}

int main(int argc, char* argv[]) {
    if (argc < 2) {
        printUsage();
        return 1;
    }

    // Load campus graph
    Graph graph;
    graph.loadFromFile("../data/campus_graph.txt");

    string command = argv[1];

    if (command == "dijkstra" && argc == 4) {
        int src = stoi(argv[2]);
        int dest = stoi(argv[3]);
        cout << dijkstraJSON(graph, src, dest) << endl;

    } else if (command == "bfs" && argc == 3) {
        int start = stoi(argv[2]);
        cout << bfsDfsJSON(graph, start, "bfs") << endl;

    } else if (command == "dfs" && argc == 3) {
        int start = stoi(argv[2]);
        cout << bfsDfsJSON(graph, start, "dfs") << endl;

    } else if (command == "mst" && argc == 3) {
        string algo = argv[2];
        cout << mstJSON(graph, algo) << endl;

    } else if (command == "topo") {
        cout << topoJSON() << endl;

    } else if (command == "search" && argc >= 3) {
        // Reconstruct multi-word location name
        string query = argv[2];
        for (int i = 3; i < argc; i++) {
            query += " " + string(argv[i]);
        }
        cout << hashSearchJSON(graph, query) << endl;

    } else if (command == "sorted") {
        cout << avlSortedJSON(graph) << endl;

    } else if (command == "locations") {
        cout << locationsJSON(graph) << endl;

    } else {
        printUsage();
        return 1;
    }

    return 0;
}
