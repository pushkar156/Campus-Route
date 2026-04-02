#include "graph.h"
#include <algorithm>

// =============================================
// AVL Tree — Height-Balanced Binary Search Tree
// Time Complexity: O(log n) insert, search, delete
// Space Complexity: O(n)
// =============================================

struct AVLNode {
    string name;
    int index;
    AVLNode* left;
    AVLNode* right;
    int height;

    AVLNode(const string& n, int idx)
        : name(n), index(idx), left(nullptr), right(nullptr), height(1) {}
};

class AVLTree {
private:
    AVLNode* root;

    int height(AVLNode* node) {
        return node ? node->height : 0;
    }

    int balanceFactor(AVLNode* node) {
        return node ? height(node->left) - height(node->right) : 0;
    }

    void updateHeight(AVLNode* node) {
        if (node)
            node->height = 1 + max(height(node->left), height(node->right));
    }

    // Right rotation (LL case)
    AVLNode* rotateRight(AVLNode* y) {
        AVLNode* x = y->left;
        AVLNode* T2 = x->right;
        x->right = y;
        y->left = T2;
        updateHeight(y);
        updateHeight(x);
        return x;
    }

    // Left rotation (RR case)
    AVLNode* rotateLeft(AVLNode* x) {
        AVLNode* y = x->right;
        AVLNode* T2 = y->left;
        y->left = x;
        x->right = T2;
        updateHeight(x);
        updateHeight(y);
        return y;
    }

    // Balance the node after insertion
    AVLNode* balance(AVLNode* node) {
        updateHeight(node);
        int bf = balanceFactor(node);

        // Left-Left case
        if (bf > 1 && balanceFactor(node->left) >= 0)
            return rotateRight(node);

        // Left-Right case
        if (bf > 1 && balanceFactor(node->left) < 0) {
            node->left = rotateLeft(node->left);
            return rotateRight(node);
        }

        // Right-Right case
        if (bf < -1 && balanceFactor(node->right) <= 0)
            return rotateLeft(node);

        // Right-Left case
        if (bf < -1 && balanceFactor(node->right) > 0) {
            node->right = rotateRight(node->right);
            return rotateLeft(node);
        }

        return node;
    }

    AVLNode* insert(AVLNode* node, const string& name, int index) {
        if (!node) return new AVLNode(name, index);

        if (name < node->name)
            node->left = insert(node->left, name, index);
        else if (name > node->name)
            node->right = insert(node->right, name, index);
        else
            return node; // Duplicate

        return balance(node);
    }

    // In-order traversal → sorted output
    void inorder(AVLNode* node, vector<pair<string, int>>& result) {
        if (!node) return;
        inorder(node->left, result);
        result.push_back({node->name, node->index});
        inorder(node->right, result);
    }

    void destroy(AVLNode* node) {
        if (!node) return;
        destroy(node->left);
        destroy(node->right);
        delete node;
    }

public:
    AVLTree() : root(nullptr) {}
    ~AVLTree() { destroy(root); }

    void insert(const string& name, int index) {
        root = insert(root, name, index);
    }

    vector<pair<string, int>> getSorted() {
        vector<pair<string, int>> result;
        inorder(root, result);
        return result;
    }
};

// Build AVL tree from graph node names
AVLTree buildCampusAVL(const Graph& graph) {
    AVLTree tree;
    for (int i = 0; i < graph.getNumNodes(); i++) {
        tree.insert(graph.getNodeName(i), i);
    }
    return tree;
}

// JSON output for Flask integration
string avlSortedJSON(const Graph& graph) {
    AVLTree tree = buildCampusAVL(graph);
    auto sorted = tree.getSorted();

    string json = "{";
    json += "\"algorithm\":\"AVL Tree (In-Order Traversal)\",";
    json += "\"sorted\":[";
    for (int i = 0; i < (int)sorted.size(); i++) {
        json += "{\"name\":\"" + sorted[i].first + "\",";
        json += "\"index\":" + to_string(sorted[i].second) + "}";
        if (i < (int)sorted.size() - 1) json += ",";
    }
    json += "],";
    json += "\"totalLocations\":" + to_string(sorted.size());
    json += "}";
    return json;
}
