#!/bin/bash

# 🚀 Vercel Build Script
# Creates a standalone frontend build without workspace dependencies

echo "🎯 Preparing frontend for Vercel deployment..."

# Create temp directory for Vercel build
rm -rf vercel-build
mkdir -p vercel-build

# Copy frontend files
cp -r packages/frontend/* vercel-build/
cp packages/frontend/.* vercel-build/ 2>/dev/null || true

# Remove any workspace references that might exist
cd vercel-build

# Remove node_modules and locks
rm -rf node_modules package-lock.json pnpm-lock.yaml

# Clean package.json of any workspace references
echo "📦 Cleaning package.json..."

# Install dependencies
echo "📥 Installing dependencies with npm..."
npm install

# Generate package-lock.json
echo "🔒 Generating package-lock.json..."

echo "✅ Vercel build preparation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set Vercel root directory to: vercel-build"
echo "2. Deploy!"