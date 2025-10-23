// Robust Public Health Research Platform Server for Windows
// This version handles Windows PowerShell terminal better

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PORT = process.env.PORT || 3000;

// Mock data for development
const mockPapers = [
  {
    id: 1,
    title: "COVID-19 Transmission Patterns in Urban Areas",
    abstract: "This study examines the transmission patterns of COVID-19 in dense urban environments...",
    author: "Dr. Sarah Johnson",
    institution: "University Medical Center",
    research_type: "observational",
    data_type: "quantitative",
    status: "published",
    submission_date: "2024-03-15"
  },
  {
    id: 2,
    title: "Malaria Prevention Strategies in Sub-Saharan Africa", 
    abstract: "An analysis of various malaria prevention strategies and their effectiveness...",
    author: "Dr. Michael Chen",
    institution: "Global Health Institute",
    research_type: "meta-analysis",
    data_type: "mixed-methods", 
    status: "under-review",
    submission_date: "2024-04-02"
  },
  {
    id: 3,
    title: "Vaccine Hesitancy in Rural Communities",
    abstract: "Exploring factors contributing to vaccine hesitancy in rural populations...",
    author: "Dr. Emily Rodriguez",
    institution: "Public Health Department",
    research_type: "survey",
    data_type: "qualitative",
    status: "published",
    submission_date: "2024-05-10"
  }
];

const mockOutbreaks = [
  {
    id: 1,
    disease_name: "Dengue Fever",
    region: "South America", 
    country: "Brazil",
    coordinates: { lat: -14.2350, lng: -51.9253 },
    cases_reported: 25000,
    deaths_reported: 150,
    status: "active",
    description: "Dengue outbreak during rainy season",
    last_updated: "2024-10-20"
  },
  {
    id: 2,
    disease_name: "Mpox",
    region: "Africa",
    country: "Nigeria", 
    coordinates: { lat: 9.0820, lng: 8.6753 },
    cases_reported: 1200,
    deaths_reported: 45,
    status: "active",
    description: "Ongoing mpox cases in multiple states",
    last_updated: "2024-10-18"
  },
  {
    id: 3,
    disease_name: "Cholera",
    region: "Asia",
    country: "Bangladesh",
    coordinates: { lat: 23.6850, lng: 90.3563 },
    cases_reported: 850,
    deaths_reported: 12,
    status: "contained",
    description: "Cholera outbreak in flood-affected areas",
    last_updated: "2024-10-15"
  }
];

// Mock users data
const mockUsers = [
  {
    id: 1,
    email: "sarah.johnson@university.edu",
    name: "Dr. Sarah Johnson",
    institution: "University Medical Center",
    specialization: "Epidemiology",
    role: "researcher",
    verified: true,
    papers_count: 15,
    collaborations_count: 8
  },
  {
    id: 2,
    email: "michael.chen@globalhealth.org",
    name: "Dr. Michael Chen",
    institution: "Global Health Institute",
    specialization: "Infectious Diseases",
    role: "researcher",
    verified: true,
    papers_count: 22,
    collaborations_count: 12
  }
];

// Mock jobs data
const mockJobs = [
  {
    id: 1,
    title: "Senior Epidemiologist",
    organization: "World Health Organization",
    location: "Geneva, Switzerland",
    type: "full-time",
    salary_range: "$80,000 - $120,000",
    description: "Leading epidemiological research on infectious disease outbreaks...",
    requirements: ["PhD in Epidemiology", "5+ years experience", "Statistical analysis skills"],
    posted_date: "2024-10-15",
    deadline: "2024-11-15"
  },
  {
    id: 2,
    title: "Public Health Data Analyst",
    organization: "Centers for Disease Control",
    location: "Atlanta, USA",
    type: "contract",
    salary_range: "$60,000 - $85,000",
    description: "Analyzing disease surveillance data and creating visualizations...",
    requirements: ["MS in Public Health", "Python/R experience", "Data visualization skills"],
    posted_date: "2024-10-10",
    deadline: "2024-11-30"
  }
];

// Mock collaborations data
const mockCollaborations = [
  {
    id: 1,
    title: "Global Malaria Surveillance Network",
    description: "Multi-country collaboration tracking malaria trends across Africa",
    lead_researcher: "Dr. Sarah Johnson",
    participants: 15,
    institutions: ["University Medical Center", "WHO", "African Health Institute"],
    status: "active",
    start_date: "2024-01-15",
    end_date: "2025-01-15"
  },
  {
    id: 2,
    title: "COVID-19 Long-term Effects Study",
    description: "Longitudinal study on long COVID symptoms across multiple populations",
    lead_researcher: "Dr. Michael Chen",
    participants: 8,
    institutions: ["Global Health Institute", "European CDC", "Asian Health Network"],
    status: "recruiting",
    start_date: "2024-06-01",
    end_date: "2026-06-01"
  }
];

const indexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Public Health Research Platform</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #334155;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            min-height: 100vh;
        }
        
        .header {
            background: linear-gradient(135deg, #1e40af 0%, #0d9488 100%);
            color: white;
            padding: 1rem 0;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
        
        .nav { display: flex; justify-content: space-between; align-items: center; }
        
        .logo { font-size: 1.5rem; font-weight: 700; }
        
        .nav-links { display: flex; gap: 2rem; list-style: none; }
        
        .nav-links a { color: white; text-decoration: none; font-weight: 500; transition: opacity 0.3s; }
        
        .nav-links a:hover { opacity: 0.8; }
        
        .hero { text-align: center; padding: 4rem 0; }
        
        .hero h1 { font-size: 3rem; font-weight: 700; color: #1e293b; margin-bottom: 1rem; }
        
        .hero p { font-size: 1.25rem; color: #64748b; margin-bottom: 2rem; max-width: 600px; margin-left: auto; margin-right: auto; }
        
        .btn {
            display: inline-block; padding: 1rem 2rem; background: linear-gradient(135deg, #1e40af 0%, #0d9488 100%);
            color: white; text-decoration: none; border-radius: 0.5rem; font-weight: 600;
            transition: transform 0.3s, box-shadow 0.3s; margin: 0.5rem;
        }
        
        .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(30, 64, 175, 0.3); }
        
        .status-badge {
            display: inline-block; padding: 0.25rem 0.75rem; background: #10b981; color: white;
            border-radius: 9999px; font-size: 0.875rem; font-weight: 600; margin-left: 1rem;
        }
        
        .api-section { padding: 4rem 0; background: white; }
        
        .api-demo {
            background: #f8fafc; border-radius: 1rem; padding: 2rem; margin: 2rem 0;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .api-response {
            background: #0f172a; color: #e2e8f0; padding: 1rem; border-radius: 0.5rem;
            font-family: 'Monaco', 'Menlo', monospace; font-size: 0.875rem; overflow-x: auto; margin-top: 1rem;
        }
        
        .footer {
            background: #1e293b; color: white; text-align: center; padding: 2rem 0; margin-top: 4rem;
        }
        
        /* World Map Styles */
        .map-section {
            padding: 4rem 0; background: #f1f5f9;
        }
        
        .map-container {
            background: white; border-radius: 1rem; padding: 2rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin: 2rem 0;
        }
        
        #world-map {
            height: 500px; width: 100%; border-radius: 0.5rem; border: 2px solid #e2e8f0;
        }
        
        .map-legend {
            display: flex; gap: 2rem; margin-top: 1rem; flex-wrap: wrap; justify-content: center;
        }
        
        .legend-item {
            display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem;
            background: white; border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .legend-color {
            width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .outbreak-stats {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem; margin-top: 2rem;
        }
        
        .stat-card {
            background: white; padding: 1.5rem; border-radius: 0.5rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); text-align: center;
        }
        
        .stat-number {
            font-size: 2rem; font-weight: 700; color: #1e40af; margin-bottom: 0.5rem;
        }
        
        .stat-label {
            color: #64748b; font-size: 0.875rem; text-transform: uppercase;
        }
        
        @media (max-width: 768px) {
            .hero h1 { font-size: 2rem; }
            .hero p { font-size: 1rem; }
            .nav-links { flex-direction: column; gap: 1rem; }
            .container { padding: 0 1rem; }
            #world-map { height: 400px; }
            .map-legend { gap: 1rem; }
        }
    </style>
</head>
<body>
    <header class="header">
        <div class="container">
            <nav class="nav">
                <div class="logo">🔬 PH Research Hub</div>
                <ul class="nav-links">
                    <li><a href="#papers">Papers</a></li>
                    <li><a href="#map">Disease Map</a></li>
                    <li><a href="#api">API Demo</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <main>
        <section class="hero">
            <div class="container">
                <h1>Public Health Research Platform</h1>
                <p>Connecting researchers worldwide for collaborative infectious disease research and knowledge sharing</p>
                <a href="#api" class="btn">🚀 Explore API</a>
                <a href="/api/papers" class="btn" target="_blank">📊 View Papers</a>
                <div class="status-badge">✅ Server Running</div>
            </div>
        </section>

        <section id="map" class="map-section">
            <div class="container">
                <h2 style="text-align: center; margin-bottom: 2rem; font-size: 2.5rem; color: #1e293b;">Global Disease Outbreak Map</h2>
                <p style="text-align: center; color: #64748b; margin-bottom: 2rem; max-width: 600px; margin-left: auto; margin-right: auto;">
                    Real-time visualization of infectious disease outbreaks worldwide. Click on markers to view detailed outbreak information.
                </p>
                
                <div class="map-container">
                    <div id="world-map"></div>
                    <div class="map-legend">
                        <div class="legend-item">
                            <div class="legend-color" style="background: #dc2626;"></div>
                            <span>Active Outbreak</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color" style="background: #f59e0b;"></div>
                            <span>Monitoring</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color" style="background: #10b981;"></div>
                            <span>Contained</span>
                        </div>
                    </div>
                </div>

                <div class="outbreak-stats">
                    <div class="stat-card">
                        <div class="stat-number" id="total-outbreaks">0</div>
                        <div class="stat-label">Active Outbreaks</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="total-cases">0</div>
                        <div class="stat-label">Total Cases</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="countries-affected">0</div>
                        <div class="stat-label">Countries Affected</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="last-updated">--</div>
                        <div class="stat-label">Last Updated</div>
                    </div>
                </div>
            </div>
        </section>

        <section id="api" class="api-section">
            <div class="container">
                <h2 style="text-align: center; margin-bottom: 2rem; font-size: 2.5rem; color: #1e293b;">Live API Endpoints</h2>
                
                <div class="api-demo">
                    <h3>📊 API Health Check</h3>
                    <p>Server status and available endpoints:</p>
                    <div class="api-response" id="health-response">Loading health status...</div>
                    <a href="/api/health" class="btn" target="_blank">View Health API</a>
                </div>

                <div class="api-demo">
                    <h3>📄 Research Papers API</h3>
                    <p>Access the latest research papers and submissions:</p>
                    <div class="api-response" id="papers-response">Loading papers...</div>
                    <a href="/api/papers" class="btn" target="_blank">View Papers API</a>
                </div>

                <div class="api-demo">
                    <h3>🦠 Disease Outbreaks API</h3>
                    <p>Real-time infectious disease outbreak data:</p>
                    <div class="api-response" id="outbreaks-response">Loading outbreaks...</div>
                    <a href="/api/diseases/outbreaks" class="btn" target="_blank">View Outbreaks API</a>
                </div>

                <div class="api-demo">
                    <h3>👥 Researchers API</h3>
                    <p>Browse the global network of public health researchers:</p>
                    <div class="api-response" id="users-response">Loading researchers...</div>
                    <a href="/api/users" class="btn" target="_blank">View Users API</a>
                </div>

                <div class="api-demo">
                    <h3>💼 Jobs API</h3>
                    <p>Discover career opportunities in public health:</p>
                    <div class="api-response" id="jobs-response">Loading jobs...</div>
                    <a href="/api/jobs" class="btn" target="_blank">View Jobs API</a>
                </div>

                <div class="api-demo">
                    <h3>🤝 Collaborations API</h3>
                    <p>Active research collaborations worldwide:</p>
                    <div class="api-response" id="collaborations-response">Loading collaborations...</div>
                    <a href="/api/collaborations" class="btn" target="_blank">View Collaborations API</a>
                </div>
            </div>
        </section>
    </main>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 Public Health Research Platform. Advancing global health through research.</p>
            <p style="margin-top: 0.5rem; opacity: 0.8;">🌍 Supporting evidence-based public health research worldwide</p>
        </div>
    </footer>

    <script>
        async function loadAPIData() {
            try {
                // Health check
                const healthResponse = await fetch('/api/health');
                const healthData = await healthResponse.json();
                document.getElementById('health-response').textContent = JSON.stringify(healthData, null, 2);

                // Papers
                const papersResponse = await fetch('/api/papers');
                const papersData = await papersResponse.json();
                document.getElementById('papers-response').textContent = JSON.stringify(papersData, null, 2);

                // Outbreaks  
                const outbreaksResponse = await fetch('/api/diseases/outbreaks');
                const outbreaksData = await outbreaksResponse.json();
                document.getElementById('outbreaks-response').textContent = JSON.stringify(outbreaksData, null, 2);

                // Users/Researchers
                const usersResponse = await fetch('/api/users');
                const usersData = await usersResponse.json();
                document.getElementById('users-response').textContent = JSON.stringify(usersData, null, 2);

                // Jobs
                const jobsResponse = await fetch('/api/jobs');
                const jobsData = await jobsResponse.json();
                document.getElementById('jobs-response').textContent = JSON.stringify(jobsData, null, 2);

                // Collaborations
                const collaborationsResponse = await fetch('/api/collaborations');
                const collaborationsData = await collaborationsResponse.json();
                document.getElementById('collaborations-response').textContent = JSON.stringify(collaborationsData, null, 2);

            } catch (error) {
                console.error('Error loading API data:', error);
                const errorMsg = 'Error: ' + error.message;
                document.getElementById('health-response').textContent = errorMsg;
                document.getElementById('papers-response').textContent = errorMsg;
                document.getElementById('outbreaks-response').textContent = errorMsg;
                document.getElementById('users-response').textContent = errorMsg;
                document.getElementById('jobs-response').textContent = errorMsg;
                document.getElementById('collaborations-response').textContent = errorMsg;
            }
        }

        // World Map Implementation
        let map;
        let outbreakData = [];

        function initializeMap() {
            // Create the map
            map = L.map('world-map').setView([20, 0], 2);

            // Add tile layer (OpenStreetMap)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 18,
            }).addTo(map);

            // Load outbreak data and add markers
            loadOutbreakData();
        }

        async function loadOutbreakData() {
            try {
                const response = await fetch('/api/diseases/outbreaks');
                const data = await response.json();
                outbreakData = data.data;

                // Clear existing markers
                map.eachLayer((layer) => {
                    if (layer instanceof L.Marker) {
                        map.removeLayer(layer);
                    }
                });

                // Add markers for each outbreak
                outbreakData.forEach(outbreak => {
                    const color = getOutbreakColor(outbreak.status);
                    const icon = L.divIcon({
                        className: 'custom-outbreak-marker',
                        html: \`<div style="background-color: \${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>\`,
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    });

                    const marker = L.marker([outbreak.coordinates.lat, outbreak.coordinates.lng], { icon })
                        .addTo(map);

                    // Create popup content
                    const popupContent = \`
                        <div style="font-family: sans-serif; min-width: 250px;">
                            <h3 style="margin: 0 0 10px 0; color: #1e293b; font-size: 1.1em;">\${outbreak.disease_name}</h3>
                            <p style="margin: 5px 0; color: #64748b;"><strong>Location:</strong> \${outbreak.country}, \${outbreak.region}</p>
                            <p style="margin: 5px 0; color: #64748b;"><strong>Cases:</strong> \${outbreak.cases_reported.toLocaleString()}</p>
                            <p style="margin: 5px 0; color: #64748b;"><strong>Deaths:</strong> \${outbreak.deaths_reported}</p>
                            <p style="margin: 5px 0; color: #64748b;"><strong>Status:</strong> <span style="color: \${color}; font-weight: bold; text-transform: capitalize;">\${outbreak.status}</span></p>
                            <p style="margin: 5px 0; color: #64748b;"><strong>Last Updated:</strong> \${outbreak.last_updated}</p>
                            <p style="margin: 10px 0 0 0; color: #374151; font-style: italic;">\${outbreak.description}</p>
                        </div>
                    \`;

                    marker.bindPopup(popupContent);
                });

                // Update statistics
                updateOutbreakStats();

            } catch (error) {
                console.error('Error loading outbreak data:', error);
            }
        }

        function getOutbreakColor(status) {
            switch (status.toLowerCase()) {
                case 'active': return '#dc2626';
                case 'monitoring': return '#f59e0b';
                case 'contained': return '#10b981';
                default: return '#6b7280';
            }
        }

        function updateOutbreakStats() {
            const totalOutbreaks = outbreakData.length;
            const totalCases = outbreakData.reduce((sum, outbreak) => sum + outbreak.cases_reported, 0);
            const countriesAffected = new Set(outbreakData.map(outbreak => outbreak.country)).size;
            const lastUpdated = outbreakData.reduce((latest, outbreak) => {
                const outbreakDate = new Date(outbreak.last_updated);
                return outbreakDate > latest ? outbreakDate : latest;
            }, new Date(0));

            document.getElementById('total-outbreaks').textContent = totalOutbreaks;
            document.getElementById('total-cases').textContent = totalCases.toLocaleString();
            document.getElementById('countries-affected').textContent = countriesAffected;
            document.getElementById('last-updated').textContent = lastUpdated.toLocaleDateString();
        }

        // Load data when page loads
        window.addEventListener('load', () => {
            loadAPIData();
            // Initialize map after a short delay to ensure the container is ready
            setTimeout(initializeMap, 500);
        });
    </script>
</body>
</html>`;

// Enhanced server with better error handling
const server = createServer(async (req, res) => {
  const { method, url } = req;
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] ${method} ${url}`);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    // API Routes
    if (url.startsWith('/api/')) {
      res.setHeader('Content-Type', 'application/json');
      
      if (url === '/api/papers' && method === 'GET') {
        console.log('Serving papers API');
        const response = {
          success: true,
          data: mockPapers,
          count: mockPapers.length,
          message: "Research papers retrieved successfully",
          timestamp: timestamp
        };
        res.writeHead(200);
        res.end(JSON.stringify(response, null, 2));
        return;
      }
      
      if (url === '/api/diseases/outbreaks' && method === 'GET') {
        console.log('Serving outbreaks API');
        const response = {
          success: true,
          data: mockOutbreaks,
          count: mockOutbreaks.length,
          message: "Disease outbreak data retrieved successfully",
          timestamp: timestamp
        };
        res.writeHead(200);
        res.end(JSON.stringify(response, null, 2));
        return;
      }

      if (url === '/api/health' && method === 'GET') {
        console.log('Serving health check API');
        const response = {
          status: 'OK',
          message: 'Public Health Research Platform API is running',
          timestamp: timestamp,
          uptime: process.uptime(),
          endpoints: {
            papers: '/api/papers',
            outbreaks: '/api/diseases/outbreaks',
            users: '/api/users',
            jobs: '/api/jobs',
            collaborations: '/api/collaborations',
            auth: '/api/auth',
            health: '/api/health'
          },
          server: {
            node_version: process.version,
            platform: process.platform,
            memory_usage: process.memoryUsage()
          }
        };
        res.writeHead(200);
        res.end(JSON.stringify(response, null, 2));
        return;
      }

      // Authentication endpoints
      if (url === '/api/auth/login' && method === 'POST') {
        console.log('Serving login API');
        const response = {
          success: true,
          message: "Login successful",
          token: "mock_jwt_token_12345",
          user: {
            id: 1,
            email: "researcher@example.com",
            name: "Dr. John Researcher",
            role: "researcher"
          },
          timestamp: timestamp
        };
        res.writeHead(200);
        res.end(JSON.stringify(response, null, 2));
        return;
      }

      if (url === '/api/auth/register' && method === 'POST') {
        console.log('Serving register API');
        const response = {
          success: true,
          message: "Registration successful",
          user: {
            id: Date.now(),
            email: "new.researcher@example.com",
            name: "New Researcher",
            role: "researcher"
          },
          timestamp: timestamp
        };
        res.writeHead(201);
        res.end(JSON.stringify(response, null, 2));
        return;
      }

      // Users endpoint
      if (url === '/api/users' && method === 'GET') {
        console.log('Serving users API');
        const response = {
          success: true,
          data: mockUsers,
          count: mockUsers.length,
          message: "Users retrieved successfully",
          timestamp: timestamp
        };
        res.writeHead(200);
        res.end(JSON.stringify(response, null, 2));
        return;
      }

      // Jobs endpoint
      if (url === '/api/jobs' && method === 'GET') {
        console.log('Serving jobs API');
        const response = {
          success: true,
          data: mockJobs,
          count: mockJobs.length,
          message: "Jobs retrieved successfully",
          timestamp: timestamp
        };
        res.writeHead(200);
        res.end(JSON.stringify(response, null, 2));
        return;
      }

      // Collaborations endpoint
      if (url === '/api/collaborations' && method === 'GET') {
        console.log('Serving collaborations API');
        const response = {
          success: true,
          data: mockCollaborations,
          count: mockCollaborations.length,
          message: "Collaborations retrieved successfully",
          timestamp: timestamp
        };
        res.writeHead(200);
        res.end(JSON.stringify(response, null, 2));
        return;
      }

      // Paper submission endpoint
      if (url === '/api/papers' && method === 'POST') {
        console.log('Serving paper submission API');
        const response = {
          success: true,
          message: "Paper submitted successfully",
          paper_id: Date.now(),
          status: "under-review",
          timestamp: timestamp
        };
        res.writeHead(201);
        res.end(JSON.stringify(response, null, 2));
        return;
      }

      // User profile endpoint
      if (url.startsWith('/api/users/') && method === 'GET') {
        console.log('Serving user profile API');
        const userId = url.split('/')[3];
        const response = {
          success: true,
          data: {
            id: userId,
            email: "researcher@example.com",
            name: "Dr. Research Example",
            institution: "Example University",
            specialization: "Epidemiology",
            papers_count: 5,
            collaborations_count: 3
          },
          timestamp: timestamp
        };
        res.writeHead(200);
        res.end(JSON.stringify(response, null, 2));
        return;
      }

      // API endpoint not found
      console.log(`API endpoint not found: ${url}`);
      res.writeHead(404);
      res.end(JSON.stringify({
        error: 'API endpoint not found',
        requested: url,
        method: method,
        available_endpoints: ['/api/papers', '/api/diseases/outbreaks', '/api/health'],
        timestamp: timestamp
      }, null, 2));
      return;
    }

    // Serve main page
    if (url === '/' || url === '/index.html') {
      console.log('Serving main page');
      res.setHeader('Content-Type', 'text/html');
      res.writeHead(200);
      res.end(indexHTML);
      return;
    }

    // 404 for other routes
    console.log(`Route not found: ${url}`);
    res.writeHead(404);
    res.end('<h1>404 - Page not found</h1>');

  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({
      error: 'Internal server error',
      message: error.message,
      timestamp: timestamp
    }, null, 2));
  }
});

// Start server with enhanced error handling
server.listen(PORT, (err) => {
  if (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
  
  console.log('========================================');
  console.log('  PUBLIC HEALTH RESEARCH PLATFORM');
  console.log('========================================');
  console.log('');
  console.log('✅ Server running successfully!');
  console.log('');
  console.log(`🌐 Platform URL: http://localhost:${PORT}`);
  console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
  console.log(`📄 Papers API: http://localhost:${PORT}/api/papers`);
  console.log(`🦠 Outbreaks API: http://localhost:${PORT}/api/diseases/outbreaks`);
  console.log('');
  console.log('🔧 Enhanced Features:');
  console.log('  • Request logging for debugging');
  console.log('  • Improved error handling');
  console.log('  • CORS support for API access');
  console.log('  • Real-time health monitoring');
  console.log('  • Extended mock data for testing');
  console.log('');
  console.log('💡 Test APIs using:');
  console.log('  PowerShell: Invoke-WebRequest -Uri "http://localhost:3000/api/health"');
  console.log('  Browser: Visit http://localhost:3000');
  console.log('');
  console.log('Press Ctrl+C to stop');
  console.log('========================================');
});

// Enhanced error handling
server.on('error', (error) => {
  console.error('❌ Server error:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.log(`⚠️  Port ${PORT} is already in use`);
    console.log('Try stopping other servers or use a different port');
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Gracefully shutting down...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

export default server;