# GitHub Deployment Guide

## 🚀 Deploy to GitHub Pages + Netlify

This guide will help you deploy your enhanced Public Health Research Platform with 40 disease outbreaks to GitHub and set up automatic deployment.

### 📋 **Pre-Deployment Checklist**

✅ 40 disease outbreaks added to the map  
✅ Live API endpoints configured  
✅ Frontend optimized for production  
✅ Documentation completed  

### 🔧 **GitHub Repository Setup**

#### 1. **Initialize Git Repository**
```bash
# If not already initialized
git init
git add .
git commit -m "Initial commit: Enhanced disease map with 40 outbreaks"
```

#### 2. **Connect to GitHub Repository**
```bash
# Add your GitHub repository as remote (Final-Build-Gemini)
git remote add origin https://github.com/sdemitre/Final-Build-Gemini.git

# Push to GitHub
git branch -M main
git push -u origin main
```

#### 3. **Repository Structure**
```
Final-Build-Gemini/
├── client/                 # React frontend
├── server/                 # Node.js backend
├── api-server.mjs         # Production API server
├── build-static.mjs       # Build script
├── netlify.toml           # Netlify configuration
├── package.json           # Main package file
├── .github/
│   └── workflows/
│       └── deploy.yml     # Auto-deployment workflow
└── README.md              # Documentation
```

### 🌐 **Deployment Options**

#### **Option 1: Netlify (Recommended)**

1. **Connect Repository to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
  - Select your GitHub repository: `sdemitre/Final-Build` (Final-Build-Gemini)
   - Configure build settings:
     - **Build Command**: `node build-static.mjs`
     - **Publish Directory**: `dist`
     - **Node Version**: `20`

2. **Automatic Deployment**
   - Every push to `main` branch triggers deployment
   - Build logs available in Netlify dashboard
   - Custom domain support available

#### **Option 2: GitHub Pages + GitHub Actions**

1. **Enable GitHub Pages**
   - Go to repository settings
   - Navigate to Pages section
   - Select "GitHub Actions" as source

2. **Automatic Build & Deploy**
   - Workflow triggers on push to main
   - Builds React app and API
   - Deploys to GitHub Pages

#### **Option 3: Vercel**

1. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure build settings:
     - **Framework**: React
     - **Build Command**: `npm run build`
     - **Output Directory**: `client/build`

### 🔄 **GitHub Actions Workflow**

The repository includes an automated deployment workflow:

```yaml
# .github/workflows/deploy.yml
name: Deploy Public Health Platform

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        
    - name: Install dependencies
      run: npm run install-all
      
    - name: Build application
      run: node build-static.mjs
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

### 📊 **Environment Variables**

Set these in your deployment platform:

```env
# Production Configuration
NODE_ENV=production
PORT=3000
API_BASE_URL=https://your-domain.netlify.app

# Optional: Analytics and monitoring
REACT_APP_ANALYTICS_ID=your-analytics-id
REACT_APP_SENTRY_DSN=your-sentry-dsn
```

### 🧪 **Testing Deployment**

#### **Local Testing**
```bash
# Test production build locally
node api-server.mjs

# Test API endpoints
curl http://localhost:3000/api/diseases/outbreaks
```

#### **Production Testing**
- ✅ All 40 disease outbreaks load correctly
- ✅ Interactive map displays properly
- ✅ Filtering functionality works
- ✅ API endpoints respond correctly
- ✅ Mobile responsiveness verified

### 🔧 **Troubleshooting**

#### **Common Issues**

1. **Build Errors**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **API Endpoints Not Working**
   - Verify API server is running
   - Check CORS configuration
   - Confirm environment variables

3. **Map Not Loading**
   - Verify Leaflet.js CDN accessibility
   - Check browser console for errors
   - Confirm coordinates are valid

#### **Debug Commands**
```bash
# Check API server status
node api-server.mjs

# Test API endpoints
curl -I http://localhost:3000/api/health
curl http://localhost:3000/api/diseases/outbreaks | jq .

# Verify build output
ls -la dist/
```

### 📈 **Performance Optimization**

#### **Production Optimizations**
- Static file compression (gzip)
- CDN for Leaflet.js and assets
- API response caching
- Image optimization
- Minified JavaScript and CSS

#### **Monitoring**
- Server uptime monitoring
- API response time tracking
- Error logging and alerting
- User analytics and insights

### 🌍 **Post-Deployment**

#### **Verification Steps**
1. ✅ Site loads at production URL
2. ✅ Disease map displays 40 outbreaks
3. ✅ All filtering options work
4. ✅ API endpoints return correct data
5. ✅ Mobile experience is optimal

#### **Share Your Platform**
- Update README with live URL
- Share with research community
- Submit to public health directories
- Monitor usage and feedback

### 📞 **Support & Resources**

#### **Documentation**
- [Netlify Docs](https://docs.netlify.com/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [React Deployment](https://create-react-app.dev/docs/deployment/)

#### **Community**
- GitHub Issues for bug reports
- Discussions for feature requests
- Contributing guidelines for collaborators

---

## 🎉 **Ready for Global Impact!**

Your enhanced Public Health Research Platform is now ready for deployment with:

- **40 comprehensive disease outbreaks** worldwide
- **Live API endpoints** for real-time data
- **Professional scientific interface** for researchers
- **Mobile-responsive design** for global access
- **Automated deployment pipeline** for easy updates

**Deploy with confidence and help advance global public health research! 🌟**