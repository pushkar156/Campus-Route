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
    // Skip comment lines
    while (getline(file, line)) {
        if (line.empty() || line[0] == '#') continue;
        break;
    }

    // First non-comment line: numNodes numEdges
    istringstream header(line);
    int numEdges;
    header >> numNodes >> numEdges;

    adjList.resize(numNodes);
    nodeNames.resize(numNodes);

    // Default node names from the campus model
    string defaultNames[] = {
        "Main Gate", "Back Gate", "Main Building", "Engineering Block",
        "MBA Block", "Library", "Canteen", "Food Court",
        "Auditorium", "Sports Complex", "Boys Hostel", "Girls Hostel",
        "Medical Center", "Admin Block", "Innovation Center", "Parking Area"
    };

    for (int i = 0; i < numNodes && i < 16; i++) {
        addNode(i, defaultNames[i]);
    }

    // Read edges
    for (int i = 0; i < numEdges; i++) {
        int src, dest, weight;
        if (file >> src >> dest >> weight) {
            addEdge(src, dest, weight);
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
