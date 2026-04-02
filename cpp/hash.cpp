#include "graph.h"

// =============================================
// Hash Table with Chaining
// Time Complexity: O(1) average lookup, O(n) worst case
// Space Complexity: O(n + TABLE_SIZE)
// =============================================

const int TABLE_SIZE = 17; // Prime number for better distribution

struct HashEntry {
    string key;     // Location name
    int index;      // Node index in graph
    string info;    // Additional info
    HashEntry* next;

    HashEntry(const string& k, int idx, const string& i)
        : key(k), index(idx), info(i), next(nullptr) {}
};

class HashTable {
private:
    HashEntry* table[TABLE_SIZE];

    // Hash function — djb2 variant
    int hashFunction(const string& key) const {
        unsigned long hash = 5381;
        for (char c : key) {
            hash = ((hash << 5) + hash) + c; // hash * 33 + c
        }
        return hash % TABLE_SIZE;
    }

public:
    HashTable() {
        for (int i = 0; i < TABLE_SIZE; i++)
            table[i] = nullptr;
    }

    ~HashTable() {
        for (int i = 0; i < TABLE_SIZE; i++) {
            HashEntry* curr = table[i];
            while (curr) {
                HashEntry* temp = curr;
                curr = curr->next;
                delete temp;
            }
        }
    }

    void insert(const string& key, int index, const string& info) {
        int h = hashFunction(key);
        HashEntry* entry = new HashEntry(key, index, info);
        entry->next = table[h];
        table[h] = entry; // Insert at head (chaining)
    }

    HashEntry* search(const string& key) const {
        int h = hashFunction(key);
        HashEntry* curr = table[h];
        while (curr) {
            if (curr->key == key) return curr;
            curr = curr->next;
        }
        return nullptr;
    }

    // Get all entries for display
    vector<pair<string, string>> getAllEntries() const {
        vector<pair<string, string>> entries;
        for (int i = 0; i < TABLE_SIZE; i++) {
            HashEntry* curr = table[i];
            while (curr) {
                entries.push_back({curr->key, curr->info});
                curr = curr->next;
            }
        }
        return entries;
    }
};

// Build hash table from graph with campus info
HashTable buildCampusHashTable(const Graph& graph) {
    HashTable ht;

    string descriptions[] = {
        "Primary entrance to MIT-WPU campus",
        "Secondary entrance near hostels",
        "Central administrative and academic hub",
        "Houses B.Tech departments and labs",
        "MBA and management studies wing",
        "Central library with digital resources",
        "Main student cafeteria",
        "Multi-cuisine food court area",
        "Events and cultural programme venue",
        "Ground, gym, and recreational facilities",
        "Male student residential block",
        "Female student residential block",
        "First aid and health services center",
        "Administrative offices and registrar",
        "Research and startup incubation center",
        "Vehicle parking and drop-off zone"
    };

    for (int i = 0; i < graph.getNumNodes() && i < 16; i++) {
        ht.insert(graph.getNodeName(i), i, descriptions[i]);
    }

    return ht;
}

// JSON output for Flask integration
string hashSearchJSON(const Graph& graph, const string& query) {
    HashTable ht = buildCampusHashTable(graph);
    HashEntry* result = ht.search(query);

    string json = "{";
    json += "\"algorithm\":\"Hash Table Lookup\",";
    json += "\"query\":\"" + query + "\",";

    if (result) {
        json += "\"found\":true,";
        json += "\"location\":\"" + result->key + "\",";
        json += "\"index\":" + to_string(result->index) + ",";
        json += "\"description\":\"" + result->info + "\"";
    } else {
        json += "\"found\":false,";
        json += "\"message\":\"Location not found in campus directory\"";
    }

    json += "}";
    return json;
}

string hashAllJSON(const Graph& graph) {
    HashTable ht = buildCampusHashTable(graph);
    auto entries = ht.getAllEntries();

    string json = "{";
    json += "\"algorithm\":\"Hash Table\",";
    json += "\"entries\":[";
    for (int i = 0; i < (int)entries.size(); i++) {
        json += "{\"name\":\"" + entries[i].first + "\",";
        json += "\"description\":\"" + entries[i].second + "\"}";
        if (i < (int)entries.size() - 1) json += ",";
    }
    json += "],";
    json += "\"totalEntries\":" + to_string(entries.size());
    json += "}";
    return json;
}
