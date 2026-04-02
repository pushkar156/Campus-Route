import React, { useState, useEffect, useRef } from 'react';
import { 
  Navigation, 
  Globe, 
  TowerControl, 
  Map as MapIcon, 
  Search, 
  Terminal, 
  ArrowRight, 
  RefreshCcw,
  Zap,
  HardHat,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const API_BASE = 'http://127.0.0.1:5000';

// MIT-WPU Campus Data
const COORDINATES = [
  { x: 100, y: 500, name: "Main Gate" },
  { x: 700, y: 100, name: "Back Gate" },
  { x: 250, y: 400, name: "Main Building" },
  { x: 300, y: 250, name: "Engineering Block" },
  { x: 450, y: 200, name: "MBA Block" },
  { x: 500, y: 350, name: "Library" },
  { x: 600, y: 400, name: "Canteen" },
  { x: 680, y: 450, name: "Food Court" },
  { x: 200, y: 150, name: "Auditorium" },
  { x: 720, y: 300, name: "Sports Complex" },
  { x: 600, y: 50, name: "Boys Hostel" },
  { x: 500, y: 50, name: "Girls Hostel" },
  { x: 350, y: 50, name: "Medical Center" },
  { x: 100, y: 300, name: "Admin Block" },
  { x: 400, y: 120, name: "Innovation Center" },
  { x: 150, y: 550, name: "Parking Area" }
];

const EDGES = [
  [0, 2], [0, 15], [0, 13], [1, 10], [1, 11], [2, 3], [2, 5], [2, 13],
  [3, 4], [3, 14], [4, 5], [5, 6], [5, 8], [6, 7], [7, 9], [8, 13],
  [8, 14], [9, 10], [9, 11], [10, 11], [10, 12], [11, 12], [12, 13], [14, 15]
];

function App() {
  const [activeView, setActiveView] = useState('navigation');
  const [locations, setLocations] = useState([]);
  const [logs, setLogs] = useState([{ tag: 'System', msg: 'React Frontend initialized.' }]);
  const [highlightedPath, setHighlightedPath] = useState([]);
  const [shortestResult, setShortestResult] = useState(null);
  const [exploreResult, setExploreResult] = useState(null);
  const [mstResult, setMstResult] = useState(null);
  const [topoResult, setTopoResult] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [src, setSrc] = useState('');
  const [dest, setDest] = useState('');
  const [exploreStart, setExploreStart] = useState('');
  const consoleEndRef = useRef(null);

  // Auto-scroll console
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    fetchLocations();
  }, []);

  const addLog = (tag, msg) => {
    setLogs(prev => [...prev, { tag, msg, time: new Date().toLocaleTimeString([], { hour12: false }) }]);
  };

  const fetchLocations = async () => {
    try {
      const res = await fetch(`${API_BASE}/locations`);
      const data = await res.json();
      setLocations(data.locations);
      addLog('API', `Synchronized ${data.locations.length} campus nodes.`);
    } catch (err) {
      addLog('Error', `Backend connection failed: ${err.message}`);
    }
  };

  /** ALGO DISPATCHERS **/

  const runDijkstra = async () => {
    if (!src || !dest) return;
    addLog('Engine', `Executing Dijkstra: ${src} -> ${dest}`);
    try {
      const res = await fetch(`${API_BASE}/shortest-path?src=${src}&dest=${dest}`);
      const data = await res.json();
      setShortestResult(data);
      setHighlightedPath(data.path);
      addLog('Result', `Shortest path calculated: ${data.distance}m`);
    } catch (err) { addLog('Error', err.message); }
  };

  const runExplore = async (type) => {
    if (!exploreStart) return;
    addLog('Engine', `Executing ${type.toUpperCase()} from node ${exploreStart}`);
    try {
      const res = await fetch(`${API_BASE}/explore?start=${exploreStart}&mode=${type}`);
      const data = await res.json();
      setExploreResult(data);
      setHighlightedPath(data.traversal);
      addLog('Result', `${type.toUpperCase()} traversal captured ${data.traversal.length} nodes.`);
    } catch (err) { addLog('Error', err.message); }
  };

  const runMST = async (algo) => {
    addLog('Engine', `Calculating Campus MST using ${algo}...`);
    try {
      const res = await fetch(`${API_BASE}/mst?algo=${algo}`);
      const data = await res.json();
      setMstResult(data);
      addLog('Result', `Optimal spanning tree cost: ${data.totalCost}`);
    } catch (err) { addLog('Error', err.message); }
  };

  const runTopo = async () => {
    addLog('Engine', `Sorting construction dependencies...`);
    try {
      const res = await fetch(`${API_BASE}/topo`);
      const data = await res.json();
      setTopoResult(data);
      addLog('Result', `Captured ${data.order.length} dependent tasks.`);
    } catch (err) { addLog('Error', err.message); }
  };

  const runSearch = async () => {
    addLog('Engine', `Searching hash table for: ${searchQuery}`);
    try {
      const res = await fetch(`${API_BASE}/search?query=${searchQuery}`);
      const data = await res.json();
      setSearchResult(data);
      if (data.found) {
        addLog('Result', `Location verified: ${data.location}`);
        setHighlightedPath([data.location]);
      } else {
        addLog('Result', 'Zero matches found in database.');
      }
    } catch (err) { addLog('Error', err.message); }
  };

  const resetVis = () => {
    setHighlightedPath([]);
    setShortestResult(null);
    setExploreResult(null);
    setMstResult(null);
    setSearchResult(null);
    setTopoResult(null);
  };

  const navItems = [
    { id: 'navigation', label: 'Navigation', icon: Navigation },
    { id: 'explore', label: 'Explore', icon: Globe },
    { id: 'infrastructure', label: 'Infrastructure', icon: TowerControl },
    { id: 'planning', label: 'Planning', icon: HardHat },
    { id: 'directory', label: 'Directory', icon: Database },
  ];

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <nav className="sidebar">
        <div className="logo">
          <div className="logo-pulse">
            <Zap size={20} fill="#3b82f6" stroke="#3b82f6" />
          </div>
          <h2>CampusRoute</h2>
        </div>

        <div className="nav-group">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => { setActiveView(item.id); resetVis(); }}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <p>MIT-WPU PBL Project</p>
          <small>Design & Analysis of Algorithms</small>
        </div>
      </nav>

      {/* Main Content */}
      <main className="content">
        <header className="top-bar">
          <motion.h1 
            key={activeView}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {navItems.find(i => i.id === activeView)?.label}
          </motion.h1>
          <div className="badge-group">
            <div className="status-badge">
              <span className="dot" /> Server Online
            </div>
          </div>
        </header>

        <div className="main-grid">
          <section className="controls-panel">
            <AnimatePresence mode="wait">
              {/* NAVIGATION MODULE */}
              {activeView === 'navigation' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card">
                  <div className="card-lbl">Pathfinding (Dijkstra)</div>
                  <div className="input-box">
                    <label>Source</label>
                    <select value={src} onChange={e => setSrc(e.target.value)}>
                      <option value="">Start node</option>
                      {locations.map(loc => <option key={loc.index} value={loc.index}>{loc.name}</option>)}
                    </select>
                  </div>
                  <div className="input-box">
                    <label>Destination</label>
                    <select value={dest} onChange={e => setDest(e.target.value)}>
                      <option value="">End node</option>
                      {locations.map(loc => <option key={loc.index} value={loc.index}>{loc.name}</option>)}
                    </select>
                  </div>
                  <button className="primary-btn" onClick={runDijkstra}>
                    <span>Calculate Path</span>
                    <ArrowRight size={18} />
                  </button>

                  {shortestResult && shortestResult.path && (
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="result-summary">
                      <div className="dist-chip">{shortestResult.distance}m</div>
                      <div className="path-trace">
                        {shortestResult.path.map((p, i) => (
                          <React.Fragment key={i}>
                            <span>{p}</span>
                            {i < shortestResult.path.length -1 && <ArrowRight size={12} className="sep" />}
                          </React.Fragment>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* EXPLORE MODULE */}
              {activeView === 'explore' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card">
                  <div className="card-lbl">Graph Traversal (BFS/DFS)</div>
                  <div className="input-box">
                    <label>Starting Node</label>
                    <select value={exploreStart} onChange={e => setExploreStart(e.target.value)}>
                      <option value="">Select node</option>
                      {locations.map(loc => <option key={loc.index} value={loc.index}>{loc.name}</option>)}
                    </select>
                  </div>
                  <div className="btn-row">
                    <button className="secondary-btn" onClick={() => runExplore('bfs')}>BFS Explore</button>
                    <button className="secondary-btn" onClick={() => runExplore('dfs')}>DFS Explore</button>
                  </div>
                  {exploreResult && exploreResult.traversal && (
                    <div className="result-summary">
                      <div className="label-sm">Discovery Sequence: ({exploreResult.algorithm})</div>
                      <div className="grid-seq">
                        {exploreResult.traversal.map((n, i) => (
                          <div key={i} className="seq-node">{n}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* INFRASTRUCTURE MODULE */}
              {activeView === 'infrastructure' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card">
                  <div className="card-lbl">Minimum Spanning Tree (MST)</div>
                  <p className="card-desc">Optimize campus cabling/piping cost across all nodes.</p>
                  <div className="btn-row">
                    <button className="secondary-btn" onClick={() => runMST('prim')}>Prim's</button>
                    <button className="secondary-btn" onClick={() => runMST('kruskal')}>Kruskal's</button>
                  </div>
                  {mstResult && mstResult.edges && (
                    <div className="result-summary">
                      <div className="cost-box">
                        <span className="lbl">Total Project Cost</span>
                        <span className="val">{mstResult.totalCost} Units</span>
                      </div>
                      <div className="edge-list">
                        {mstResult.edges.map((e, i) => (
                            <div key={i} className="edge-item">{e.from} ↔ {e.to} ({e.weight}m)</div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* PLANNING MODULE */}
              {activeView === 'planning' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card">
                  <div className="card-lbl">Build Planning (Topo Sort)</div>
                  <p className="card-desc">Project timeline based on task dependencies.</p>
                  <button className="primary-btn" onClick={runTopo}>Generate Timeline</button>
                  {topoResult && topoResult.order && (
                    <div className="timeline">
                      {topoResult.order.map((task, i) => (
                        <div key={i} className="timeline-item">
                           <div className="time-idx">{task.step}</div>
                           <div className="task-name">{task.task}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* DIRECTORY MODULE */}
              {activeView === 'directory' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card">
                  <div className="card-lbl">Location Database (Hash Table)</div>
                  <div className="search-wrap">
                    <input 
                       type="text" placeholder="Search MIT-WPU DB..." 
                       value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    />
                    <button onClick={runSearch} className="search-btn"><Search size={18}/></button>
                  </div>
                  {searchResult && searchResult.found && (
                    <div className="res-details">
                       <h4>{searchResult.location}</h4>
                       <div className="meta">Index: #{searchResult.index}</div>
                       <p className="desc-text">{searchResult.description}</p>
                    </div>
                  )}
                  {searchResult && !searchResult.found && <div className="error-msg">Location not in directory.</div>}
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <section className="visualization-panel">
            <div className="glass-card vis-card">
              <div className="vis-header">
                <h3>Campus Visual Network</h3>
                <button onClick={resetVis} className="icon-btn" title="Reset View">
                  <RefreshCcw size={16} />
                </button>
              </div>
              <div className="svg-container">
                <svg viewBox="0 0 800 600">
                  {/* Edges */}
                  {EDGES.map(([u, v], i) => {
                    let isActive = false;
                    
                    if (activeView === 'navigation' && highlightedPath.includes(COORDINATES[u].name) && highlightedPath.includes(COORDINATES[v].name)) {
                        isActive = Math.abs(highlightedPath.indexOf(COORDINATES[u].name) - highlightedPath.indexOf(COORDINATES[v].name)) === 1;
                    } else if (activeView === 'infrastructure' && mstResult && mstResult.edges) {
                        isActive = mstResult.edges.some(e => 
                            (e.from === COORDINATES[u].name && e.to === COORDINATES[v].name) || 
                            (e.to === COORDINATES[u].name && e.from === COORDINATES[v].name)
                        );
                    }

                    return (
                      <line
                        key={i}
                        x1={COORDINATES[u].x} y1={COORDINATES[u].y}
                        x2={COORDINATES[v].x} y2={COORDINATES[v].y}
                        className={`edge ${isActive ? 'active' : ''}`}
                      />
                    );
                  })}
                  {/* Nodes */}
                  {COORDINATES.map((node, i) => {
                    const isActive = highlightedPath.includes(node.name);
                    const isEndpoint = (shortestResult?.path && (shortestResult.path[0] === node.name || shortestResult.path[shortestResult.path.length-1] === node.name));
                    return (
                      <g key={i}>
                        <circle
                          cx={node.x} cy={node.y}
                          r={isActive ? 8 : 6}
                          className={`node ${isActive ? 'active' : ''} ${isEndpoint ? 'endpoint' : ''}`}
                        />
                        <text x={node.x + 10} y={node.y + 4} className="node-label">
                          {node.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </section>
        </div>

        {/* Console Log */}
        <footer className="console-panel">
          <div className="glass-card console-card">
            <div className="console-header">
              <div className="label"><Terminal size={14} /> AlgoEngine Process Console</div>
              <div className="version">C++ Integrated v1.2</div>
            </div>
            <div className="console-content">
              {logs.map((log, i) => (
                <div key={i} className="log-line">
                  <span className="timestamp">[{log.time}]</span>
                  <span className={`tag ${log.tag.toLowerCase()}`}>[{log.tag}]</span>
                  <span className="msg">{log.msg}</span>
                </div>
              ))}
              <div ref={consoleEndRef} />
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
