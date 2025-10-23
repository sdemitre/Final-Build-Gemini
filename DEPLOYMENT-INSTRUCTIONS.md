# Deployment Instructions for Enhanced Disease Map

## 🚀 Quick Deployment Guide

Your Public Health Research Platform is now ready for deployment with **40 comprehensive disease outbreaks** on the interactive world map.

### ✅ What's Updated

- **40 global disease outbreaks** (expanded from 5)
- Enhanced filtering and visualization
- Comprehensive geographic coverage
- Realistic epidemiological data

### 🌐 Deployment Options

#### Option 1: Netlify (Recommended)

1. **GitHub Integration**:
   - Push your code to GitHub repository
   - Connect to Netlify account
   - Set build command: `node build-static.mjs`
   - Set publish directory: `dist`
   - Deploy automatically

2. **Manual Deployment**:
   ```bash
   # Build the application
   node build-static.mjs
   
   # Upload the dist/ folder to Netlify
   netlify deploy --prod --dir=dist
   ```

#### Option 2: Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Option 3: GitHub Pages
```bash
# Build for production
npm run build

# Deploy to gh-pages branch
npm run deploy
```

### 🛠️ Build Requirements

- Node.js 18+
- NPM or Yarn
- Internet connection for CDN resources

### 📂 Generated Files

The build process creates:
- `dist/index.html` - Main application
- `dist/assets/` - Static assets
- `dist/api/` - API endpoints
- `netlify.toml` - Netlify configuration

### 🗺️ Disease Map Features

Your deployed map will include:

**40 Disease Outbreaks Across:**
- 🌍 Africa: 11 outbreaks
- 🌏 Asia: 15 outbreaks  
- 🌎 Americas: 8 outbreaks
- 🌍 Europe: 6 outbreaks

**Disease Categories:**
- Viral diseases (COVID-19, Ebola, Zika, etc.)
- Bacterial infections (Cholera, Typhoid, Plague, etc.)
- Parasitic diseases (Malaria, Leishmaniasis, etc.)
- Vector-borne diseases (Dengue, West Nile, etc.)
- Fungal infections (Histoplasmosis, etc.)

### 🔧 Environment Variables

Set these in your deployment platform:
```
NODE_ENV=production
API_BASE_URL=https://your-domain.netlify.app
```

### 📊 Post-Deployment Verification

1. ✅ Homepage loads correctly
2. ✅ Disease map displays all 40 outbreaks
3. ✅ Filtering works (disease type, region, status)
4. ✅ Popup details show for each outbreak
5. ✅ All pages navigate properly

### 🚨 Troubleshooting

**Build Errors:**
- Ensure Node.js 18+ is installed
- Check internet connection for dependencies
- Verify all files are committed to Git

**Map Not Loading:**
- Check browser console for errors
- Verify Leaflet.js CDN is accessible
- Ensure coordinates are valid

**Missing Outbreaks:**
- Verify the updated DiseaseMap.tsx is included
- Check build process completed successfully
- Confirm no JavaScript errors in console

### 📞 Support

For deployment issues:
1. Check build logs for specific errors
2. Verify all dependencies are installed
3. Test locally before deploying
4. Check platform-specific documentation

---

**Your enhanced disease surveillance platform is ready to help public health researchers worldwide! 🌍**