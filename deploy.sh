#!/bin/bash

# Simple deployment script for Public Health Research Platform
# Enhanced Disease Map with 40 outbreaks

echo "🚀 Starting deployment process..."

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm run install-all

# Step 2: Build client application
echo "🔨 Building React application..."
cd client
npm run build
cd ..

# Step 3: Copy build files to deployment directory
echo "📁 Preparing deployment files..."
mkdir -p deploy
cp -r client/build/* deploy/

# Step 4: Copy server files
echo "🖥️ Copying server files..."
cp -r server deploy/
cp package.json deploy/
cp README.md deploy/
cp netlify.toml deploy/

# Step 5: Create deployment package
echo "📦 Creating deployment package..."
cd deploy
tar -czf ../ph-research-platform-deploy.tar.gz .
cd ..

echo "✅ Deployment package created: ph-research-platform-deploy.tar.gz"
echo ""
echo "🌐 Next Steps:"
echo "1. Upload to your hosting platform (Netlify, Vercel, etc.)"
echo "2. Set build command: npm run build"
echo "3. Set publish directory: build or dist"
echo "4. Deploy and test the enhanced disease map!"
echo ""
echo "🗺️ Your map now includes 40 disease outbreaks worldwide!"