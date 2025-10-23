# Docker Desktop Installation Wizard - Step by Step Guide

## Current Status: Installation in Progress

The Docker Desktop installer is running. Follow these steps to complete the installation:

## Step-by-Step Installation Guide

### Step 1: UAC (User Account Control) Prompt
- **Look for**: Windows security prompt asking "Do you want to allow this app to make changes to your device?"
- **Action**: Click **"Yes"** to grant administrator permissions
- **App**: Docker Desktop Installer

### Step 2: Docker Desktop Setup Wizard
You should see the Docker Desktop installer window with these steps:

#### Welcome Screen
- **Title**: "Welcome to Docker Desktop"
- **Action**: Click **"Ok"** or **"Next"**

#### License Agreement
- **Title**: "License Agreement" 
- **Action**: 
  1. Read the license terms (or scroll to bottom)
  2. Check ☑️ **"I accept the terms in the License Agreement"**
  3. Click **"Next"**

#### Configuration Screen
- **Title**: "Configuration"
- **Options you'll see**:
  - ☑️ **"Use WSL 2 instead of Hyper-V"** (RECOMMENDED - keep this checked)
  - ☑️ **"Add shortcut to desktop"** (optional)
- **Action**: Keep WSL 2 option checked, then click **"Ok"** or **"Install"**

### Step 3: Installation Progress
- **What you'll see**: Progress bar showing "Installing Docker Desktop..."
- **Duration**: 2-10 minutes depending on your system
- **Action**: Wait for installation to complete

### Step 4: Installation Complete
- **Title**: "Installation succeeded" or "Setup Completed"
- **Options**:
  - ☑️ **"Start Docker Desktop"** (recommended)
- **Action**: 
  1. Keep "Start Docker Desktop" checked
  2. Click **"Close"** or **"Finish"**

### Step 5: First Launch Setup
After installation, Docker Desktop will start and you might see:

#### Welcome/Tutorial (Optional)
- **Action**: You can skip the tutorial or go through it
- **Click**: "Skip tutorial" or complete it

#### Service Agreement (If prompted)
- **Action**: Accept the Docker service agreement
- **Click**: "Accept"

## Verification Steps

Once installation is complete, verify Docker is working:

### Method 1: Check Docker Status
Look for the **whale icon** 🐳 in your system tray (bottom-right corner):
- **Gray whale**: Docker is starting
- **White whale**: Docker is running and ready

### Method 2: Command Line Verification
Open PowerShell and run:
```powershell
docker --version
docker-compose --version
docker run hello-world
```

## Common Issues and Solutions

### Issue 1: WSL 2 Not Available
**Error**: "WSL 2 installation is incomplete"
**Solution**:
```powershell
# Run in PowerShell as Administrator
wsl --install
# Restart computer, then try again
```

### Issue 2: Hyper-V Conflict
**Error**: "Hyper-V is not available"
**Solution**: 
1. Go to "Turn Windows features on or off"
2. Enable "Hyper-V" 
3. Restart computer

### Issue 3: Virtualization Not Enabled
**Error**: "Hardware virtualization is not available"
**Solution**: Enable virtualization in BIOS settings

## What to Do After Successful Installation

1. **Verify Docker is running** (whale icon in system tray)
2. **Run our platform setup**:
   ```powershell
   .\check-docker.bat
   ```
   Or manually:
   ```powershell
   .\docker-setup.bat
   ```

## Expected Timeline

- **Installation**: 2-10 minutes
- **First startup**: 1-3 minutes  
- **Platform setup**: 2-5 minutes

## Need Help?

If you encounter any issues:
1. Check the installation log in the installer window
2. Look for error messages in the Docker Desktop interface
3. Restart the installer if it gets stuck
4. Run the installer as Administrator if UAC issues persist

---

**Next**: Once you see the whale icon in your system tray, run `.\check-docker.bat` to start your Public Health Research Platform!