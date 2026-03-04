# FocusTabs - Clean Reinstall Script
# Purpose: Deep clean of dependencies and fresh installation

Write-Host "--- [FocusTabs] Starting Clean Reinstall ---" -ForegroundColor Cyan

# 1. Stop any running Node/Metro processes
Write-Host "[1/5] Stopping any active Node processes..." -ForegroundColor DarkGray
Stop-Process -Name "node" -ErrorAction SilentlyContinue

# 2. Removing dependency artifacts
Write-Host "[2/5] Deleting node_modules and lock files..." -ForegroundColor Yellow
if (Test-Path "node_modules") { Remove-Item -Recurse -Force "node_modules" }
if (Test-Path "package-lock.json") { Remove-Item -Force "package-lock.json" }

# 3. Clearing caches
Write-Host "[3/5] Cleaning caches (npm, expo)..." -ForegroundColor Yellow
npm cache clean --force
if (Test-Path ".expo") { Remove-Item -Recurse -Force ".expo" }

# 4. Fresh Install
Write-Host "[4/5] Installing fresh dependencies (legacy-peer-deps enabled)..." -ForegroundColor Green
npm install --legacy-peer-deps

# 5. Done
Write-Host "[5/5] Success! Project is now clean and reinstalled." -ForegroundColor Cyan
Write-Host "Run 'npm start' to begin development." -ForegroundColor White
