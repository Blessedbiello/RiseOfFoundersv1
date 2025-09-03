#!/bin/bash

# Vercel install script that removes workspace dependencies
echo "🔧 Preparing for Vercel deployment..."

# Remove any pnpm workspace files that might interfere
rm -f pnpm-lock.yaml pnpm-workspace.yaml

# Remove any workspace-specific npm config
rm -f .pnpmrc

# Remove any existing lock files
rm -f package-lock.json

# Clean npm cache
npm cache clean --force

# Install dependencies with npm
echo "📦 Installing dependencies with npm..."
npm install --legacy-peer-deps --no-fund --no-audit --prefer-offline=false

echo "✅ Installation complete for Vercel deployment"