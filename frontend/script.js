/**
 * CampusRoute — MIT-WPU Smart Navigation
 * Phase 4 Core Logic: State Management & UI Sync
 */

const API_BASE = 'http://127.0.0.1:5000';

// App State
let locations = [];
let activeView = 'navigation';

// DOM Elements
const srcSelect = document.getElementById('src-select');
const destSelect = document.getElementById('dest-select');
const navLinks = document.querySelectorAll('.nav-links li');
const viewTitle = document.getElementById('view-title');
const findBtn = document.getElementById('find-btn');
const consoleOutput = document.getElementById('console-output');
const navResult = document.getElementById('nav-result');
const campusSvg = document.getElementById('campus-svg');

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    logToConsole('System', 'Booting Frontend state engine...');
    await loadLocations();
    initViewSwitching();
    initGraph();
});

async function loadLocations() {
    try {
        const response = await fetch(`${API_BASE}/locations`);
        const data = await response.json();
        locations = data.locations;
        
        logToConsole('API', `Fetched ${locations.length} campus locations.`);
        
        // Populate Selects
        const options = locations.map(loc => 
            `<option value="${loc.index}">${loc.name}</option>`
        ).join('');
        
        srcSelect.innerHTML += options;
        destSelect.innerHTML += options;
    } catch (err) {
        logToConsole('Error', `Failed to connect to backend: ${err.message}`);
    }
}

function initViewSwitching() {
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            activeView = link.dataset.view;
            updateViewTitle(link.innerText.trim());
            logToConsole('View', `Switched to ${activeView} module.`);
        });
    });
}

function updateViewTitle(text) {
    // text includes the emoji from the list item
    viewTitle.innerText = text.split(' ').slice(1).join(' ');
}

/**
 * LOGIC: Find Shortest Route (Dijkstra)
 */
findBtn.addEventListener('click', async () => {
    const src = srcSelect.value;
    const dest = destSelect.value;

    if (!src || !dest) {
        alert('Please select both source and destination');
        return;
    }

    logToConsole('Engine', `Executing Dijkstra for path ${src} -> ${dest}...`);
    
    try {
        const response = await fetch(`${API_BASE}/shortest-path?src=${src}&dest=${dest}`);
        const result = await response.json();
        
        renderPath(result);
        logToConsole('Result', `Shortest distance found: ${result.distance}m`);
    } catch (err) {
        logToConsole('Error', `Calculation failed: ${err.message}`);
    }
});

function renderPath(result) {
    if (result.distance === -1) {
        alert('Path not found!');
        return;
    }

    navResult.classList.remove('hidden');
    navResult.querySelector('.distance-badge').innerText = `${result.distance}m`;
    
    const stepsDiv = document.getElementById('path-steps');
    stepsDiv.innerHTML = result.path.map((node, i) => `
        <span class="step-node">${node}</span>
        ${i < result.path.length - 1 ? '<span class="arrow">→</span>' : ''}
    `).join('');

    highlightPathOnGraph(result.path);
}

/**
 * UI UTILITY: Console Log
 */
function logToConsole(tag, message) {
    const time = new Date().toLocaleTimeString([], { hour12: false });
    const logLine = `[${time}] [${tag}] ${message}`;
    consoleOutput.innerHTML += `<div>${logLine}</div>`;
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

/**
 * VISUALIZATION: SVG Graph Generation
 */
function initGraph() {
    // Fixed layout for the 16 MIT-WPU nodes
    const coords = [
        {x: 100, y: 500}, // 0 Main Gate
        {x: 700, y: 100}, // 1 Back Gate
        {x: 250, y: 400}, // 2 Main Building
        {x: 300, y: 250}, // 3 Engineering Block
        {x: 450, y: 200}, // 4 MBA Block
        {x: 500, y: 350}, // 5 Library
        {x: 600, y: 400}, // 6 Canteen
        {x: 680, y: 450}, // 7 Food Court
        {x: 200, y: 150}, // 8 Auditorium
        {x: 720, y: 300}, // 9 Sports Complex
        {x: 600, y: 50},  // 10 Boys Hostel
        {x: 500, y: 50},  // 11 Girls Hostel
        {x: 350, y: 50},  // 12 Medical Center
        {x: 100, y: 300}, // 13 Admin Block
        {x: 400, y: 120}, // 14 Innovation Center
        {x: 150, y: 550}  // 15 Parking Area
    ];

    // Edges (based on data/campus_graph.txt)
    const edges = [
        [0, 2], [0, 15], [0, 13], [1, 10], [1, 11], [2, 3], [2, 5], [2, 13],
        [3, 4], [3, 14], [4, 5], [5, 6], [5, 8], [6, 7], [7, 9], [8, 13],
        [8, 14], [9, 10], [9, 11], [10, 11], [10, 12], [11, 12], [12, 13], [14, 15]
    ];

    // Render Edges
    edges.forEach(([s, d], i) => {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", coords[s].x);
        line.setAttribute("y1", coords[s].y);
        line.setAttribute("x2", coords[d].x);
        line.setAttribute("y2", coords[d].y);
        line.setAttribute("class", "edge");
        line.id = `edge-${Math.min(s, d)}-${Math.max(s, d)}`;
        campusSvg.appendChild(line);
    });

    // Render Nodes
    coords.forEach((coord, i) => {
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", coord.x);
        circle.setAttribute("cy", coord.y);
        circle.setAttribute("r", 6);
        circle.setAttribute("class", "node");
        circle.id = `node-${i}`;
        circle.title = locations[i] ? locations[i].name : `Node ${i}`;

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", coord.x + 10);
        text.setAttribute("y", coord.y + 4);
        text.setAttribute("class", "node-label");
        text.textContent = i; // Node index for reference

        group.appendChild(circle);
        group.appendChild(text);
        campusSvg.appendChild(group);
    });
}

function highlightPathOnGraph(pathNames) {
    // Reset all
    document.querySelectorAll('.node, .edge').forEach(el => {
        el.classList.remove('node-active', 'edge-active');
    });

    // Convert names back to indices
    const pathIndices = pathNames.map(name => {
        const loc = locations.find(l => l.name === name);
        return loc ? loc.index : -1;
    });

    // Highlight nodes and edges
    for (let i = 0; i < pathIndices.length; i++) {
        const u = pathIndices[i];
        document.getElementById(`node-${u}`)?.classList.add('node-active');
        
        if (i > 0) {
            const v = pathIndices[i-1];
            const edgeId = `edge-${Math.min(u, v)}-${Math.max(u, v)}`;
            document.getElementById(edgeId)?.classList.add('edge-active');
        }
    }
}
