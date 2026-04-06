#include "graph.h"
#include <fstream>
#include <sstream>

Graph::Graph() : numNodes(0) {}

Graph::Graph(int n) : numNodes(n), adjList(n), nodeNames(n) {}

void Graph::addNode(int index, const string& name) {
    if (index >= 0 && index < numNodes) {
        nodeNames[index] = name;
        nameToIndex[name] = index;
    }
}

void Graph::addEdge(int src, int dest, int weight) {
    if (src >= 0 && src < numNodes && dest >= 0 && dest < numNodes) {
        adjList[src].push_back({dest, weight});
        adjList[dest].push_back({src, weight}); // Undirected graph
    }
}

void Graph::loadFromFile(const string& filename) {
    ifstream file(filename);
    if (!file.is_open()) {
        cerr << "Error: Could not open file " << filename << endl;
        return;
    }

    string line;
    // Skip comment lines to find header
    while (getline(file, line)) {
        if (line.empty() || line[0] == '#') continue;
        break;
    }

    // First non-comment line: numNodes numEdges
    istringstream header(line);
    int numEdges;
    if (!(header >> numNodes >> numEdges)) {
        cerr << "Error: Invalid header in " << filename << endl;
        return;
    }

    adjList.clear();
    adjList.resize(numNodes);
    nodeNames.clear();
    nodeNames.resize(numNodes);
    nameToIndex.clear();

    // Read node mappings
    int nodesRead = 0;
    while (nodesRead < numNodes && getline(file, line)) {
        if (line.empty() || line[0] == '#') continue;
        
        istringstream iss(line);
        int idx;
        if (iss >> idx) {
            string name;
            getline(iss, name);
            // Extract text between quotes if present
            size_t first = name.find_first_of("\"");
            size_t last = name.find_last_of("\"");
            if (first != string::npos && last != string::npos && last > first) {
                name = name.substr(first + 1, last - first - 1);
            } else {
                // Trim whitespace
                name.erase(0, name.find_first_not_of(" \t"));
                name.erase(name.find_last_not_of(" \t") + 1);
            }
            addNode(idx, name);
            nodesRead++;
        }
    }

    // Read edges
    int edgesRead = 0;
    while (edgesRead < numEdges && getline(file, line)) {
        if (line.empty() || line[0] == '#') continue;
        
        istringstream iss(line);
        int src, dest, weight;
        if (iss >> src >> dest >> weight) {
            addEdge(src, dest, weight);
            edgesRead++;
        }
    }

    file.close();
}


int Graph::getNumNodes() const {
    return numNodes;
}

const vector<Edge>& Graph::getNeighbors(int node) const {
    return adjList[node];
}

string Graph::getNodeName(int index) const {
    if (index >= 0 && index < numNodes) {
        return nodeNames[index];
    }
    return "Unknown";
}

int Graph::getNodeIndex(const string& name) const {
    auto it = nameToIndex.find(name);
    if (it != nameToIndex.end()) {
        return it->second;
    }
    return -1;
}

const vector<string>& Graph::getAllNodeNames() const {
    return nodeNames;
}

void Graph::printGraph() const {
    for (int i = 0; i < numNodes; i++) {
        cout << nodeNames[i] << " (" << i << "): ";
        for (const auto& edge : adjList[i]) {
            cout << nodeNames[edge.dest] << "(" << edge.weight << "m) ";
        }
        cout << endl;
    }
}
