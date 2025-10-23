// Development Server for Public Health Research Platform
// This serves the static React build and provides basic API endpoints

import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PORT = 3000;

// Simple mock data for development
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
    description: "Dengue outbreak during rainy season"
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
    description: "Ongoing mpox cases in multiple states"
  }
];

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Simple HTML page for the platform
const indexHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Public Health Research Platform</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
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
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }
        
        .nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            font-size: 1.5rem;
            font-weight: 700;
        }
        
        .nav-links {
            display: flex;
            gap: 2rem;
            list-style: none;
        }
        
        .nav-links a {
            color: white;
            text-decoration: none;
            font-weight: 500;
            transition: opacity 0.3s;
        }
        
        .nav-links a:hover {
            opacity: 0.8;
        }
        
        .hero {
            text-align: center;
            padding: 4rem 0;
        }
        
        .hero h1 {
            font-size: 3rem;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 1rem;
        }
        
        .hero p {
            font-size: 1.25rem;
            color: #64748b;
            margin-bottom: 2rem;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .btn {
            display: inline-block;
            padding: 1rem 2rem;
            background: linear-gradient(135deg, #1e40af 0%, #0d9488 100%);
            color: white;
            text-decoration: none;
            border-radius: 0.5rem;
            font-weight: 600;
            transition: transform 0.3s, box-shadow 0.3s;
            margin: 0.5rem;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(30, 64, 175, 0.3);
        }
        
        .features {
            padding: 4rem 0;
            background: white;
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }
        
        .feature-card {
            background: white;
            padding: 2rem;
            border-radius: 1rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .feature-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .feature-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        
        .feature-card h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: #1e293b;
        }
        
        .demo-section {
            padding: 4rem 0;
            background: #f8fafc;
        }
        
        .api-demo {
            background: white;
            border-radius: 1rem;
            padding: 2rem;
            margin: 2rem 0;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .api-response {
            background: #0f172a;
            color: #e2e8f0;
            padding: 1rem;
            border-radius: 0.5rem;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.875rem;
            overflow-x: auto;
            margin-top: 1rem;
        }
        
        .status-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background: #10b981;
            color: white;
            border-radius: 9999px;
            font-size: 0.875rem;
            font-weight: 600;
            margin-left: 1rem;
        }
        
        .footer {
            background: #1e293b;
            color: white;
            text-align: center;
            padding: 2rem 0;
            margin-top: 4rem;
        }
        
        @media (max-width: 768px) {
            .hero h1 {
                font-size: 2rem;
            }
            
            .hero p {
                font-size: 1rem;
            }
            
            .nav-links {
                flex-direction: column;
                gap: 1rem;
            }
            
            .container {
                padding: 0 1rem;
            }
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
                    <li><a href="#researchers">Researchers</a></li>
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
                <a href="#demo" class="btn">🚀 Explore Platform</a>
                <a href="/api/papers" class="btn">📊 View API</a>
                <div class="status-badge">✅ Development Server Running</div>
            </div>
        </section>

        <section class="features">
            <div class="container">
                <h2 style="text-align: center; margin-bottom: 2rem; font-size: 2.5rem; color: #1e293b;">Platform Features</h2>
                <div class="features-grid">
                    <div class="feature-card">
                        <div class="feature-icon">📄</div>
                        <h3>Paper Submission & Review</h3>
                        <p>Submit unpublished research for peer review and collaborative feedback from the global research community.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🗺️</div>
                        <h3>Interactive Disease Map</h3>
                        <p>Real-time visualization of infectious disease outbreaks worldwide with geographic filtering and statistics.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🤝</div>
                        <h3>Research Collaboration</h3>
                        <p>Connect with researchers globally, form partnerships, and combine data for joint publications.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">💼</div>
                        <h3>Career Opportunities</h3>
                        <p>Discover job openings, research positions, and funding opportunities in public health.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">📊</div>
                        <h3>Data Repository</h3>
                        <p>Access comprehensive research data from verified sources with advanced search capabilities.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🔒</div>
                        <h3>Verified Research</h3>
                        <p>All submissions vetted and sourced from recognized institutions and funding organizations.</p>
                    </div>
                </div>
            </div>
        </section>

        <section id="demo" class="demo-section">
            <div class="container">
                <h2 style="text-align: center; margin-bottom: 2rem; font-size: 2.5rem; color: #1e293b;">Live API Demo</h2>
                
                <div class="api-demo">
                    <h3>📄 Research Papers API</h3>
                    <p>Access the latest research papers and submissions:</p>
                    <div class="api-response" id="papers-response">Loading papers...</div>
                    <a href="/api/papers" class="btn" style="margin-top: 1rem;">View Full API Response</a>
                </div>

                <div class="api-demo">
                    <h3>🦠 Disease Outbreaks API</h3>
                    <p>Get real-time infectious disease outbreak data:</p>
                    <div class="api-response" id="outbreaks-response">Loading outbreaks...</div>
                    <a href="/api/diseases/outbreaks" class="btn" style="margin-top: 1rem;">View Full API Response</a>
                </div>
            </div>
        </section>
    </main>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 Public Health Research Platform. Advancing global health through collaborative research.</p>
            <p style="margin-top: 0.5rem; opacity: 0.8;">🌍 Supporting evidence-based public health research worldwide</p>
        </div>
    </footer>

    <script>
        // Load demo data
        async function loadDemoData() {
            try {
                // Load papers
                const papersResponse = await fetch('/api/papers');
                const papersData = await papersResponse.json();
                document.getElementById('papers-response').textContent = JSON.stringify(papersData, null, 2);

                // Load outbreaks
                const outbreaksResponse = await fetch('/api/diseases/outbreaks');
                const outbreaksData = await outbreaksResponse.json();
                document.getElementById('outbreaks-response').textContent = JSON.stringify(outbreaksData, null, 2);
            } catch (error) {
                console.error('Error loading demo data:', error);
                document.getElementById('papers-response').textContent = 'Error loading data. Check console for details.';
                document.getElementById('outbreaks-response').textContent = 'Error loading data. Check console for details.';
            }
        }

        // Load data when page loads
        window.addEventListener('load', loadDemoData);

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    </script>
</body>
</html>
`;

const server = createServer(async (req, res) => {
  const { method, url } = req;
  
  // Log all requests for debugging
  console.log(`${new Date().toISOString()} - ${method} ${url}`);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (method === 'OPTIONS') {
    console.log('CORS preflight request handled');
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    // API Routes
    if (url.startsWith('/api/')) {
      res.setHeader('Content-Type', 'application/json');
      
      if (url === '/api/papers' && method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          data: mockPapers,
          count: mockPapers.length,
          message: "Research papers retrieved successfully"
        }));
        return;
      }
      
      if (url === '/api/diseases/outbreaks' && method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          data: mockOutbreaks,
          count: mockOutbreaks.length,
          message: "Disease outbreak data retrieved successfully"
        }));
        return;
      }

      if (url === '/api/health' && method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify({
          status: 'OK',
          message: 'Public Health Research Platform API is running',
          timestamp: new Date().toISOString(),
          endpoints: {
            papers: '/api/papers',
            outbreaks: '/api/diseases/outbreaks'
          }
        }));
        return;
      }

      // API endpoint not found
      console.log(`❌ API endpoint not found: ${url}`);
      res.writeHead(404);
      res.end(JSON.stringify({
        error: 'API endpoint not found',
        requested: url,
        available_endpoints: ['/api/papers', '/api/diseases/outbreaks', '/api/health']
      }));
      return;
    }

    // Serve the main page
    if (url === '/' || url === '/index.html') {
      res.setHeader('Content-Type', 'text/html');
      res.writeHead(200);
      res.end(indexHTML);
      return;
    }

    // Handle other static files
    res.writeHead(404);
    res.end('Page not found');

  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }));
  }
});

server.listen(PORT, () => {
  console.log('========================================');
  console.log('  PUBLIC HEALTH RESEARCH PLATFORM');
  console.log('========================================');
  console.log('');
  console.log('✅ Development server running!');
  console.log('');
  console.log(`🌐 Platform URL: http://localhost:${PORT}`);
  console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
  console.log(`📄 Papers API: http://localhost:${PORT}/api/papers`);
  console.log(`🦠 Outbreaks API: http://localhost:${PORT}/api/diseases/outbreaks`);
  console.log('');
  console.log('🚀 Ready for public health research collaboration!');
  console.log('');
  console.log('Features available:');
  console.log('  • Research paper submission & review');
  console.log('  • Interactive disease outbreak mapping');
  console.log('  • Researcher collaboration tools');
  console.log('  • Real-time API endpoints');
  console.log('  • Professional scientific interface');
  console.log('');
  console.log('Press Ctrl+C to stop the server');
  console.log('========================================');
});

// Enhanced error handling
server.on('error', (error) => {
  console.error('❌ Server error:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.log(`⚠️  Port ${PORT} is already in use. Trying port ${PORT + 1}...`);
    server.listen(PORT + 1);
  }
});

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Public Health Research Platform server...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

export default server;