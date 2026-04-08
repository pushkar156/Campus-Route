import React, { useState, useEffect, useRef } from 'react';

const API_BASE = 'http://127.0.0.1:5000';

const COORDINATES_SCALE = { x: 8, y: 12 }; // Scale factor for 0-100 coordinates to SVG units

function App() {
  const [activeView, setActiveView] = useState('navigation');
  const [locations, setLocations] = useState([]);
  const [mapNodes, setMapNodes] = useState([]);
  const [mapEdges, setMapEdges] = useState([]);
  const [logs, setLogs] = useState([{ time: '00:00:00', tag: 'INIT', msg: 'System initialized.'}]);
  const consoleEndRef = useRef(null);

  const [src, setSrc] = useState('');
  const [dest, setDest] = useState('');
  const [shortestResult, setShortestResult] = useState(null);

  const [exploreStart, setExploreStart] = useState('');
  const [exploreResult, setExploreResult] = useState(null);

  const [mstResult, setMstResult] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  const [highlightedPath, setHighlightedPath] = useState([]);

  // Load Data
  useEffect(() => {
    // Fetch locations from Backend (for indexing)
    fetch(`${API_BASE}/locations`)
      .then(res => res.json())
      .then(data => {
         setLocations(data.locations || []);
         addLog('SYNC', `Backend sync: ${data.locations?.length || 0} nodes indexed.`);
      })
      .catch(err => addLog('ERROR', `Backend offline, using fallback UI.`));

    // Fetch Spatial Data for Map (Nodes and Edges combined)
    fetch(`${API_BASE}/graph-data`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setMapNodes(data.nodes || []);
        setMapEdges(data.edges || []);
        addLog('SYNC', 'Visual map data synchronised with backend.');
      })
      .catch(err => addLog('ERROR', `Map data missing: ${err.message}`));
  }, []);


  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (tag, msg) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev, { time, tag, msg }]);
  };

  const getTagColor = (tag) => {
    switch(tag) {
      case 'INIT': return 'text-secondary';
      case 'ERROR': return 'text-error';
      case 'SYNC': return 'text-primary';
      case 'CORE': return 'text-primary';
      case 'MST': return 'text-tertiary';
      default: return 'text-secondary';
    }
  };

  const resetVis = () => {
    setHighlightedPath([]);
    setShortestResult(null);
    setExploreResult(null);
    setMstResult(null);
    setSearchResult(null);
  };

  const runDijkstra = async () => {
    if (!src || !dest) return;
    addLog('CORE', `Starting Dijkstra thread on nodes ${src} -> ${dest}`);
    try {
      const res = await fetch(`${API_BASE}/shortest-path?src=${src}&dest=${dest}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setShortestResult(data);
      setHighlightedPath(data.path);
      addLog('CORE', `Path found: ${data.distance}m via ${data.path.length} nodes.`);
    } catch (err) { addLog('ERROR', err.message); }
  };

  const runExplore = async (mode) => {
    if (!exploreStart) return;
    addLog('CORE', `Executing ${mode.toUpperCase()} from node ${exploreStart}`);
    try {
      const res = await fetch(`${API_BASE}/explore?start=${exploreStart}&mode=${mode}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setExploreResult(data);
      setHighlightedPath(data.traversal);
      addLog('CORE', `${mode.toUpperCase()} traversal captured ${data.traversal.length} nodes.`);
    } catch (err) { addLog('ERROR', err.message); }
  };

  const runMST = async (algo) => {
    addLog('MST', `Calculating Campus MST using ${algo}...`);
    try {
      const res = await fetch(`${API_BASE}/mst?algo=${algo}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMstResult(data);
      addLog('MST', `${algo} optimization completed. Cost: ${data.totalCost} Units.`);
    } catch (err) { addLog('ERROR', err.message); }
  };


  const runSearch = async () => {
    addLog('CORE', `Searching database for: ${searchQuery}`);
    try {
      const res = await fetch(`${API_BASE}/search?query=${searchQuery}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSearchResult(data);
      if (data.found) {
        addLog('SYNC', `Location verified: ${data.location}`);
        setHighlightedPath([data.location]);
      } else {
        addLog('ERROR', 'Zero matches found in database.');
      }
    } catch (err) { addLog('ERROR', err.message); }
  };

  const navItems = [
    { id: 'navigation', label: 'Navigation', icon: 'route' },
    { id: 'explore', label: 'Explore', icon: 'explore' },
    { id: 'infrastructure', label: 'Infrastructure', icon: 'account_tree' },
    { id: 'directory', label: 'Directory', icon: 'contacts' },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* SideNavBar */}
      <aside className="flex flex-col h-full py-8 w-72 border-r-0 bg-[#111417] shrink-0 z-20 shadow-[20px_0_40px_rgba(0,0,0,0.4)]">
        <div className="px-8 mb-12">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            <h1 className="text-2xl font-black text-[#ffd709] italic font-headline tracking-tighter">CampusRoute</h1>
          </div>
          <p className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant mt-2">Engineering Dashboard</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map(item => {
            const isActive = activeView === item.id;
            return (
              <button 
                key={item.id}
                onClick={() => { setActiveView(item.id); resetVis(); }}
                className={`w-full flex items-center gap-4 px-4 py-3 transition-colors duration-300 text-left ${
                  isActive 
                    ? 'text-[#ffd709] font-bold border-r-2 border-[#ffd709] bg-white/5'
                    : 'text-[#aaabaf] hover:text-white hover:bg-[#171a1d]'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-label tracking-widest uppercase text-xs">{item.label}</span>
              </button>
            )
          })}
        </nav>
        <div className="px-8 mt-auto pt-8 border-t border-outline-variant/10">
          <div className="mt-8 space-y-4">
            <a className="flex items-center gap-4 text-[#aaabaf] hover:text-white transition-colors text-xs font-label uppercase tracking-widest" href="#">
              <span className="material-symbols-outlined text-sm">settings</span>
              Settings
            </a>
            <p className="text-[10px] font-label text-on-surface-variant/40 mt-4 leading-relaxed">
              MIT-WPU PBL Project<br/>DAA Engineering Team
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-background relative">
        {/* TopNavBar */}
        <header className="flex justify-between items-center w-full px-8 h-16 bg-[#0c0e11]/80 backdrop-blur-xl shrink-0 z-10 shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative">
          <div className="flex items-center gap-6">
            <h2 className="font-headline font-bold text-lg text-on-surface tracking-tight">Algorithm Analysis</h2>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/10 border border-primary/20">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#6dddff]"></div>
              <span className="font-label text-[10px] font-bold text-primary tracking-wider uppercase">Algorithm Engine: Online</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-8">
              <span className="text-[#6dddff] border-b border-[#6dddff] font-label text-xs uppercase tracking-widest">Node Health</span>
            </nav>
            <div className="h-6 w-[1px] bg-outline-variant/20"></div>
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">terminal</span>
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="flex-1 overflow-y-auto p-8 custom-scroll relative">
          <div className="grid grid-cols-12 gap-8 h-full min-h-[600px]">
            {/* Left Panel (Calculations) */}
            <div className="col-span-12 xl:col-span-5 space-y-8">
              
              {activeView === 'navigation' && (
                <section className="glass-module rounded-xl p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-6xl">directions</span>
                  </div>
                  <h3 className="font-label text-xs font-bold text-primary tracking-widest uppercase mb-6 flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary rounded-full"></span>
                    Pathfinding (Dijkstra)
                  </h3>
                  <div className="space-y-4 relative z-10">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Dropdown population from mapNodes fallback */}
                      {(() => {
                        const dropdownData = locations.length > 0 ? locations : mapNodes.map(n => ({ index: n.id, name: n.name }));
                        return (
                          <>
                            <div className="space-y-1">
                              <label className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">Source Node</label>
                              <select className="w-full bg-surface-container-lowest border-none rounded-lg text-sm font-body px-3 py-2 text-white focus:ring-1 focus:ring-primary outline-none" value={src} onChange={e => setSrc(e.target.value)}>
                                <option value="">Start node</option>
                                {dropdownData.map(l => <option key={l.index} value={l.index}>{l.name}</option>)}
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">Destination</label>
                              <select className="w-full bg-surface-container-lowest border-none rounded-lg text-sm font-body px-3 py-2 text-white focus:ring-1 focus:ring-primary outline-none" value={dest} onChange={e => setDest(e.target.value)}>
                                <option value="">End node</option>
                                {dropdownData.map(l => <option key={l.index} value={l.index}>{l.name}</option>)}
                              </select>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button onClick={runDijkstra} className="px-6 py-2.5 bg-secondary text-on-secondary font-label font-bold text-[10px] tracking-widest uppercase rounded hover:brightness-110 transition-all">
                          Calculate Path
                      </button>
                      {shortestResult && shortestResult.path && (
                        <div className="px-3 py-1.5 bg-surface-container-highest rounded border border-outline-variant/20 flex items-center gap-3">
                          <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">Est. Distance</span>
                          <span className="font-headline font-bold text-secondary">{shortestResult.distance}m</span>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {activeView === 'explore' && (
                <section className="glass-module rounded-xl p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-6xl">explore</span>
                  </div>
                  <h3 className="font-label text-xs font-bold text-primary tracking-widest uppercase mb-6 flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary rounded-full"></span>
                    Traversal Logic
                  </h3>
                  <div className="space-y-4 relative z-10">
                    <div className="space-y-1">
                      <label className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">Starting Node</label>
                      <select className="w-full bg-surface-container-lowest border-none rounded-lg text-sm font-body px-3 py-2 text-white focus:ring-1 focus:ring-primary outline-none" value={exploreStart} onChange={e => setExploreStart(e.target.value)}>
                        <option value="">Select node</option>
                        {locations.map(l => <option key={l.index} value={l.index}>{l.name}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button onClick={() => runExplore('bfs')} className="flex-1 py-3 border border-outline-variant/20 rounded-lg font-label text-[10px] tracking-widest uppercase text-tertiary hover:bg-tertiary/10 transition-colors">
                          Breadth First (BFS)
                      </button>
                      <button onClick={() => runExplore('dfs')} className="flex-1 py-3 border border-outline-variant/20 rounded-lg font-label text-[10px] tracking-widest uppercase text-tertiary hover:bg-tertiary/10 transition-colors">
                          Depth First (DFS)
                      </button>
                    </div>
                    {exploreResult && exploreResult.traversal && (
                      <div className="mt-4 p-4 bg-surface-container-lowest rounded-lg border border-outline-variant/10">
                        <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-2">Traversal Order ({exploreResult.algorithm})</p>
                        <div className="flex gap-2 flex-wrap">
                          {exploreResult.traversal.map((n, i) => (
                            <span key={i} className="px-3 py-1 flex items-center justify-center bg-surface-container rounded-full text-[10px] border border-outline-variant/20 text-white truncate max-w-[100px]" title={n}>{n}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {activeView === 'infrastructure' && (
                <section className="glass-module rounded-xl p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-6xl">account_tree</span>
                  </div>
                  <h3 className="font-label text-xs font-bold text-primary tracking-widest uppercase mb-6 flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary rounded-full"></span>
                    Structural MST
                  </h3>
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex-1">
                        <div className="flex bg-surface-container-lowest p-1 rounded-lg">
                          <button onClick={() => runMST('prim')} className="flex-1 py-1.5 focus:bg-surface-container-highest focus:text-primary text-on-surface-variant text-white font-label text-[10px] tracking-widest uppercase rounded">Prim's</button>
                          <button onClick={() => runMST('kruskal')} className="flex-1 py-1.5 focus:bg-surface-container-highest focus:text-primary text-on-surface-variant text-white font-label text-[10px] tracking-widest uppercase rounded">Kruskal's</button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">Project Cost</p>
                        <p className="font-headline font-bold text-2xl text-secondary">{mstResult ? mstResult.totalCost : '0'}m</p>
                      </div>
                    </div>
                  </div>
                </section>
              )}


              {activeView === 'directory' && (
                <div className="flex flex-col gap-6">
                  <div className="h-24 glass-module rounded-xl flex items-center px-8 gap-6 z-10 relative">
                    <div className="flex-1 relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                      <input 
                         className="w-full bg-surface-container-lowest/50 border-none rounded-lg pl-12 py-3 text-sm font-label tracking-widest uppercase focus:ring-1 focus:ring-primary placeholder:text-on-surface-variant/40 text-white outline-none" 
                         placeholder="QUERY DATABASE (HASH)..." 
                         type="text"
                         value={searchQuery}
                         onChange={e => setSearchQuery(e.target.value)}
                         onKeyDown={e => e.key === 'Enter' && runSearch()}
                      />
                    </div>
                    <button onClick={runSearch} className="flex items-center gap-2 px-4 py-3 hover:bg-primary/20 cursor-pointer rounded bg-surface-container border border-outline-variant/20">
                      <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest text-primary">Search</span>
                    </button>
                  </div>
                  {searchResult && searchResult.found && (
                    <div className="glass-module rounded-xl p-6 relative">
                       <h3 className="text-secondary font-headline text-xl mb-2">{searchResult.location}</h3>
                       <div className="text-on-surface-variant text-sm mb-4">{searchResult.description}</div>
                       <div className="flex items-center gap-2 px-4 py-2 rounded bg-surface-container border border-outline-variant/20 inline-flex">
                          <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">Index ID:</span>
                          <span className="font-headline font-bold text-primary">#{searchResult.index}</span>
                       </div>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Right Panel (Visualization) */}
            <div className="col-span-12 xl:col-span-7 flex flex-col gap-8 h-full">
              {/* Main Visualization Surface */}
              <div className="flex-1 glass-module rounded-2xl relative border-none bg-surface-container-low overflow-hidden min-h-[500px]">
                
                {/* Network HUD Overlay */}
                <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                  <div className="px-4 py-2 bg-background/60 backdrop-blur-md rounded-lg border border-white/5">
                    <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Network Base</p>
                    <p className="font-headline font-bold text-primary text-xl">{mapNodes.length} <span className="text-xs text-on-surface-variant font-normal">nodes</span></p>
                  </div>
                  <div className="px-4 py-2 bg-background/60 backdrop-blur-md rounded-lg border border-white/5">
                    <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Connections</p>
                    <p className="font-headline font-bold text-secondary text-xl">{mapEdges.length} <span className="text-xs text-on-surface-variant font-normal">edges</span></p>
                  </div>
                </div>


                {/* Legend */}
                <div className="absolute bottom-6 right-6 z-10 space-y-2 bg-background/60 backdrop-blur-md p-4 rounded-lg border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-1 bg-secondary shadow-[0_0_8px_#ffd709]"></div>
                    <span className="font-label text-[9px] uppercase tracking-widest text-on-surface">Shortest Path</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-1 bg-primary shadow-[0_0_8px_#6dddff]"></div>
                    <span className="font-label text-[9px] uppercase tracking-widest text-on-surface">MST Backbone</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full border border-outline-variant"></div>
                    <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">Passive Nodes</span>
                  </div>
                </div>

                {/* SVG Map Visualization */}
                <div className="w-full h-full overflow-y-auto custom-scroll p-8 flex justify-center bg-[#0c0e11]">
                  <svg className="opacity-90" width="800" height="1300" viewBox="0 0 800 1300">
                    {/* Passive Edges & Active MST Connections */}
                    {mapEdges.map(([u, v], i) => {
                      const nodeU = mapNodes.find(n => n.id === u);
                      const nodeV = mapNodes.find(n => n.id === v);
                      if (!nodeU || !nodeV) return null;

                      let isMst = false;
                      if (activeView === 'infrastructure' && mstResult && mstResult.edges) {
                        isMst = mstResult.edges.some(e => 
                            (e.from === nodeU.name && e.to === nodeV.name) || 
                            (e.to === nodeU.name && e.from === nodeV.name)
                        );
                      }

                      return (
                        <line
                          key={i}
                          x1={nodeU.x * COORDINATES_SCALE.x} y1={nodeU.y * COORDINATES_SCALE.y}
                          x2={nodeV.x * COORDINATES_SCALE.x} y2={nodeV.y * COORDINATES_SCALE.y}
                          className="transition-all duration-300"
                          stroke={isMst ? "#6dddff" : "#23262a"}
                          strokeWidth={isMst ? "4" : "1.5"}
                          strokeDasharray={isMst ? "0" : (nodeU.type === 'junction' && nodeV.type === 'junction' ? "0" : "4 4")}
                          opacity={isMst ? "1" : "0.6"}
                          style={isMst ? { filter: 'drop-shadow(0 0 6px #6dddff)' } : {}}
                        />
                      );
                    })}

                    {/* Shortest Path Layer SVG (Dijkstra) */}
                    {activeView === 'navigation' && shortestResult && shortestResult.path && (
                      <g className="shortest-path-group">
                        {shortestResult.path.map((nodeName, i) => {
                           if (i === 0) return null;
                           const prevName = shortestResult.path[i-1];
                           const prevNode = mapNodes.find(c => c.name.trim().toLowerCase() === prevName.trim().toLowerCase());
                           const currNode = mapNodes.find(c => c.name.trim().toLowerCase() === nodeName.trim().toLowerCase());
                           
                           if (!prevNode || !currNode) return null;
                           
                           return (
                             <line 
                                key={`path-line-${i}`} 
                                x1={prevNode.x * COORDINATES_SCALE.x} y1={prevNode.y * COORDINATES_SCALE.y} 
                                x2={currNode.x * COORDINATES_SCALE.x} y2={currNode.y * COORDINATES_SCALE.y} 
                                stroke="#ffd709"
                                strokeWidth="6"
                                strokeLinecap="round"
                                style={{ filter: 'drop-shadow(0 0 10px #ffd709)', opacity: 0.9 }}
                             />
                           );
                        })}
                      </g>
                    )}

                    {/* Nodes */}
                    {mapNodes.map((node, i) => {
                      const isActivePath = highlightedPath.includes(node.name);
                      const isEndpoint = (shortestResult?.path && (shortestResult.path[0] === node.name || shortestResult.path[shortestResult.path.length-1] === node.name));
                      
                      let fillColor = node.type === 'junction' ? "#0c0e11" : "#171a1d";
                      let strokeColor = node.type === 'junction' ? "#23262a" : "#46484b";
                      let radius = node.type === 'junction' ? "3" : "6";

                      if (isActivePath) {
                        fillColor = "#0c0e11";
                        strokeColor = "#6dddff";
                        radius = "8";
                      }
                      if (isEndpoint && activeView === 'navigation') {
                         fillColor = "#ffd709";
                         strokeColor = "#ffd709";
                         radius = "10";
                      }

                      return (
                        <g key={i}>
                          <circle
                            cx={node.x * COORDINATES_SCALE.x} cy={node.y * COORDINATES_SCALE.y}
                            r={radius}
                            fill={fillColor}
                            stroke={strokeColor}
                            strokeWidth="2"
                            className="transition-all duration-300 cursor-pointer"
                            onClick={() => {
                               if (!src) setSrc(node.id);
                               else if (!dest) setDest(node.id);
                               else { setSrc(node.id); setDest(''); }
                            }}
                            style={isActivePath ? { filter: `drop-shadow(0 0 ${isEndpoint ? '12px' : '6px'} ${isEndpoint ? '#ffd709' : '#6dddff'})` } : {}}
                          />
                          <text 
                            x={node.x * COORDINATES_SCALE.x} y={node.y * COORDINATES_SCALE.y - (parseInt(radius) + 8)} 
                            fill={isActivePath ? "#fff" : "#aaabaf"} 
                            className={`font-label transition-all duration-300 ${isActivePath ? 'text-[12px] font-bold' : 'text-[9px]'}`}
                            textAnchor="middle"
                            opacity={isActivePath ? 1 : (node.type === 'junction' ? 0.2 : 0.6)}
                          >
                            {node.name.toUpperCase()}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* Bottom Console */}
        <footer className="h-48 bg-[#0c0e11] border-t border-outline-variant/10 flex flex-col shrink-0 z-10 relative">
          <div className="px-8 py-2 flex items-center justify-between bg-surface-container-low/50">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-xs text-primary">terminal</span>
              <h4 className="font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">System Engine Logs</h4>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-label text-[9px] text-primary uppercase tracking-widest">C++ Integrated Core v1.2</span>
              <div className="h-3 w-[1px] bg-outline-variant/30"></div>
              <span className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest">Status: SYNCED</span>
            </div>
          </div>
          <div className="flex-1 terminal-scroll overflow-y-auto px-8 py-4 font-mono text-[11px] space-y-1 bg-surface-container-lowest/30">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-4">
                <span className="text-outline-variant">[{log.time}]</span>
                <span className={getTagColor(log.tag)}>{log.tag}</span>
                <span className="text-on-surface-variant">{log.msg}</span>
              </div>
            ))}
            <div ref={consoleEndRef} />
          </div>
        </footer>
        
      </main>
    </div>
  );
}

export default App;
