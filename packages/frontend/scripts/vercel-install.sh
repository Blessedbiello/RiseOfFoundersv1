#!/bin/bash

# Vercel install script that removes workspace dependencies
echo "🔧 Preparing for Vercel deployment..."

# Remove any pnpm workspace files that might interfere
rm -f pnpm-lock.yaml pnpm-workspace.yaml

# Remove workspace-specific npm config that causes workspace detection
rm -f .npmrc .pnpmrc

# Remove any existing lock files
rm -f package-lock.json

# Go up to the repository root and remove workspace files there too
cd ../..
rm -f pnpm-workspace.yaml pnpm-lock.yaml

# Go back to frontend directory
cd packages/frontend

# Clean npm cache
npm cache clean --force

# Install dependencies with npm, bypassing workspace detection
echo "📦 Installing dependencies with npm..."
npm install --legacy-peer-deps --no-fund --no-audit --prefer-offline=false --workspaces=false

echo "✅ Installation complete for Vercel deployment"