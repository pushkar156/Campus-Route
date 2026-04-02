#ifndef GRAPH_H
#define GRAPH_H

#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <utility>

using namespace std;

// Edge structure for weighted graph
struct Edge {
    int dest;
    int weight;
};

class Graph {
private:
    int numNodes;
    vector<vector<Edge>> adjList;
    vector<string> nodeNames;
    unordered_map<string, int> nameToIndex;

public:
    Graph();
    Graph(int n);

    // Core operations
    void addNode(int index, const string& name);
    void addEdge(int src, int dest, int weight);
    void loadFromFile(const string& filename);

    // Accessors
    int getNumNodes() const;
    const vector<Edge>& getNeighbors(int node) const;
    string getNodeName(int index) const;
    int getNodeIndex(const string& name) const;
    const vector<string>& getAllNodeNames() const;

    // Display
    void printGraph() const;
};

#endif // GRAPH_H
