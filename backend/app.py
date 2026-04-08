import subprocess
import json
import os
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Path to the C++ executable
# Note: Use absolute path logic to ensure it works regardless of where the script is run from
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CPP_EXE = os.path.join(BASE_DIR, "..", "cpp", "campus.exe")

def run_cpp_command(args):
    """Utility to run the C++ executable and return parsed JSON results."""
    try:
        if not os.path.exists(CPP_EXE):
            return {"error": "C++ executable not found. Please compile it first in the cpp/ directory."}
            
        # Construct command
        command = [CPP_EXE] + args
        # Execute and capture output from the cpp directory (to resolve relative data paths)
        result = subprocess.run(
            command, 
            capture_output=True, 
            text=True, 
            cwd=os.path.join(BASE_DIR, "..", "cpp")
        )
        
        if not result.stdout.strip():
            return {"error": "C++ produced no output", "stderr": result.stderr}
            
        return json.loads(result.stdout)
    except subprocess.CalledProcessError as e:
        return {"error": "C++ execution failed", "details": str(e.stderr)}
    except json.JSONDecodeError as e:
        return {"error": "Failed to parse C++ output as JSON", "raw": result.stdout, "details": str(e)}
    except Exception as e:
        return {"error": "Backend script error", "details": str(e)}

@app.route('/')
def health_check():
    return jsonify({
        "status": "CampusRoute API is running",
        "endpoints": {
            "shortest-path": "/shortest-path?src=0&dest=5",
            "explore": "/explore?start=0&mode=bfs",
            "mst": "/mst?algo=prim",
            "locations": "/locations"
        }
    })

@app.route('/shortest-path', methods=['GET'])
def shortest_path():
    src = request.args.get('src', '0')
    dest = request.args.get('dest', '0')
    return jsonify(run_cpp_command(["dijkstra", src, dest]))

@app.route('/explore', methods=['GET'])
def explore():
    start = request.args.get('start', '0')
    mode = request.args.get('mode', 'bfs') # 'bfs' or 'dfs'
    return jsonify(run_cpp_command([mode, start]))

@app.route('/mst', methods=['GET'])
def mst():
    algo = request.args.get('algo', 'prim') # 'prim' or 'kruskal'
    return jsonify(run_cpp_command(["mst", algo]))


@app.route('/locations', methods=['GET'])
def get_locations():
    return jsonify(run_cpp_command(["locations"]))

@app.route('/graph-data', methods=['GET'])
def get_graph_data():
    try:
        # Load locations
        with open(os.path.join(BASE_DIR, "..", "data", "campus_locations.json"), 'r') as f:
            locations_data = json.load(f)
        
        # Load edges
        with open(os.path.join(BASE_DIR, "..", "data", "campus_edges.json"), 'r') as f:
            edges_data = json.load(f)
            
        return jsonify({
            "nodes": locations_data["locations"],
            "edges": edges_data["edges"]
        })
    except Exception as e:
        return jsonify({"error": str(e)})


if __name__ == '__main__':
    # Running on 5000 is standard for Flask
    app.run(debug=True, port=5000)
