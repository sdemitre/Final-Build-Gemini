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

const indexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Public Health Research Platform</title>
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
        
        @media (max-width: 768px) {
            .hero h1 { font-size: 2rem; }
            .hero p { font-size: 1rem; }
            .nav-links { flex-direction: column; gap: 1rem; }
            .container { padding: 0 1rem; }
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

            } catch (error) {
                console.error('Error loading API data:', error);
                document.getElementById('health-response').textContent = 'Error: ' + error.message;
                document.getElementById('papers-response').textContent = 'Error: ' + error.message;
                document.getElementById('outbreaks-response').textContent = 'Error: ' + error.message;
            }
        }

        // Load data when page loads
        window.addEventListener('load', loadAPIData);
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