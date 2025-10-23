# Public Health Research Platform

A comprehensive web platform for public health researchers to collaborate, share unpublished papers for peer review, track global disease outbreaks, and connect with the international research community.

## 🌟 Features

- **📄 Paper Submission & Review** - Submit unpublished research for peer review
- **🗺️ Interactive World Map** - Real-time disease outbreak visualization
- **👥 Research Network** - Connect with researchers globally
- **💼 Career Hub** - Public health job opportunities
- **📊 Data Repository** - Verified research datasets
- **🔒 Secure Platform** - Institutional verification system

## 🚀 Live Deployment

### Netlify Deployment (Recommended)

The platform is optimized for Netlify deployment with serverless functions.

#### Option 1: GitHub Integration (Recommended)
1. Fork or clone this repository
2. Connect your GitHub repository to Netlify
3. Configure build settings:
   - **Build command:** `node build-static.mjs`
   - **Publish directory:** `dist`
   - **Node version:** `20`

#### Option 2: Manual Deployment
1. Run the build command locally:
   ```bash
   node build-static.mjs
   ```
2. Upload the `dist/` folder to Netlify
3. The `netlify.toml` file will handle redirects and headers automatically

### Build Configuration

The project includes:
- `netlify.toml` - Netlify configuration with redirects and headers
- `build-static.mjs` - Build script for static site generation
- `.netlify/functions/` - Serverless API functions
- `dist/` - Generated static files for deployment

## 🛠️ Local Development

### Prerequisites
- Node.js 18+ 
- No additional dependencies required (uses built-in modules)

### Running Locally
```bash
# Start the enhanced server with all APIs
node api-server.mjs

# Or start the basic platform server
node platform-server.mjs
```

The platform will be available at `http://localhost:3000`

## 📡 API Endpoints

### Production (Netlify)
- `/api/health` - Server health and status
- `/api/papers` - Research papers database
- `/api/diseases` - Disease outbreak data
- `/api/users` - Researcher profiles
- `/api/jobs` - Career opportunities
- `/api/collaborations` - Research partnerships

### Local Development
All endpoints available at `http://localhost:3000/api/*`

## 🗺️ Interactive Map

The platform features a real-time world map powered by Leaflet.js displaying:
- **Active disease outbreaks** with geographic coordinates
- **Color-coded status indicators** (Active/Monitoring/Contained)
- **Detailed outbreak information** in interactive popups
- **Global statistics dashboard** with case counts and trends

## 🏗️ Architecture

### Frontend
- **Pure HTML/CSS/JavaScript** - No build process required
- **Leaflet.js** - Interactive maps
- **Responsive design** - Mobile-friendly interface
- **Professional scientific styling** - Clean, academic appearance

### Backend
- **Node.js serverless functions** - Netlify Functions
- **RESTful API design** - JSON responses
- **CORS enabled** - Cross-origin support
- **Mock data** - Ready for database integration

## 📁 Project Structure

```
├── api-server.mjs           # Enhanced development server
├── platform-server.mjs     # Basic platform server
├── build-static.mjs         # Netlify build script
├── netlify.toml            # Netlify configuration
├── package-deploy.json     # Deployment package config
├── .netlify/functions/     # Serverless API functions
│   ├── health.js          # Health check endpoint
│   ├── papers.js          # Research papers API
│   ├── diseases.js        # Disease outbreaks API
│   └── users.js           # Users/researchers API
├── client/                 # React development files
├── server/                 # Express server files
└── dist/                   # Generated static files
    ├── index.html         # Main application
    └── _redirects         # Netlify redirects
```

## 🔧 Configuration

### Environment Variables (Optional)
- `NODE_ENV` - Development/production mode
- `PORT` - Server port (default: 3000)

### Netlify Settings
- **Node version:** 20
- **Build command:** `node build-static.mjs`
- **Publish directory:** `dist`
- **Functions directory:** `.netlify/functions`

## 🌍 Global Impact

This platform supports evidence-based public health research by:
- Facilitating international research collaboration
- Providing real-time disease surveillance data
- Connecting researchers across institutions and countries
- Accelerating the peer review process for urgent health matters
- Supporting career development in public health

## 📄 License

MIT License - Supporting open-source public health research

## 🤝 Contributing

Contributions welcome! This platform aims to advance global health through technology and collaboration.

---

**Built for public health researchers worldwide** 🌍