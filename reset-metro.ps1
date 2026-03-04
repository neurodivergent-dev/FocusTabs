# FocusTabs - Reset Metro Script
# Purpose: Clear Metro cache and restart the bundler

Write-Host "--- [FocusTabs] Resetting Metro Cache ---" -ForegroundColor Cyan

# 1. Cleaning Metro/Expo artifacts
Write-Host "[1/2] Clearing .expo folder and temporary files..." -ForegroundColor Yellow
if (Test-Path ".expo") { Remove-Item -Recurse -Force ".expo" }

# 2. Starting fresh bundler
Write-Host "[2/2] Starting Expo Bundler with --clear flag..." -ForegroundColor Green
npx expo start --clear
