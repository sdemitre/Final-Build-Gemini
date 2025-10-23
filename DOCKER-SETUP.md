# Docker Installation and Setup Instructions

## Step 1: Install Docker Desktop

1. **Download Docker Desktop for Windows**
   - Go to: https://docs.docker.com/desktop/install/windows-install/
   - Click "Download Docker Desktop for Windows"
   - Run the installer when download completes

2. **System Requirements**
   - Windows 10/11 (64-bit)
   - WSL 2 feature enabled
   - Virtualization enabled in BIOS

3. **Installation Steps**
   - Run the Docker Desktop Installer.exe
   - Follow the installation wizard
   - Enable "Use WSL 2 instead of Hyper-V" if prompted
   - Restart your computer when prompted

4. **Verify Installation**
   - Start Docker Desktop from Start menu
   - Wait for Docker to start (whale icon in system tray)
   - Open PowerShell and run: `docker --version`

## Step 2: Run the Setup Script

Once Docker is installed and running:

```powershell
# Navigate to project directory
cd "C:\Users\stoure\Final Build"

# Run the setup script
.\docker-setup.bat

# Or run commands manually:
docker pull node:22-alpine
docker pull postgres:15-alpine
docker pull redis:7-alpine
docker-compose -f docker-compose.dev.yml up --build
```

## Step 3: Access Your Application

After successful setup:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Health Check: http://localhost:5000/health

## Troubleshooting

If you encounter issues:

1. **Docker not starting**: Restart Docker Desktop
2. **Port conflicts**: Stop other applications using ports 3000, 5000, 5432
3. **Permission issues**: Run PowerShell as Administrator
4. **WSL issues**: Enable WSL 2 feature in Windows Features

## Alternative: Using Node.js Container Directly

If you want to use just the Node.js container as mentioned:

```powershell
# Pull Node.js image
docker pull node:22-alpine

# Run interactive container
docker run -it --rm -v "${PWD}:/app" -w /app -p 3000:3000 -p 5000:5000 node:22-alpine sh

# Inside container, install dependencies and start
npm install
npm run install-all
npm run dev
```