#!/bin/bash

# 🚀 Quick Vercel + Docker Deployment Script

echo "🎯 Rise of Founders - Vercel Deployment Setup"
echo "=============================================="

# Step 1: Check prerequisites
echo "\n📋 Checking prerequisites..."

if ! command -v git &> /dev/null; then
    echo "❌ Git is required but not installed"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is required but not installed"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Step 2: Start backend for Vercel
echo "\n🐳 Starting Docker backend for Vercel..."
docker-compose -f docker-compose.vercel.yml down 2>/dev/null
docker-compose -f docker-compose.vercel.yml up -d

echo "✅ Backend started on port 3001"

# Step 3: Test backend
echo "\n🔍 Testing backend health..."
sleep 10
if curl -f http://localhost:3001/api/health &> /dev/null; then
    echo "✅ Backend is healthy"
else
    echo "⏳ Backend is starting... (this may take a few minutes)"
fi

# Step 4: Setup instructions
echo "\n🚀 Next Steps for Vercel Deployment:"
echo "======================================"
echo ""
echo "1. 📡 Expose your backend publicly:"
echo "   Option A (Quick): Use ngrok"
echo "   → ngrok http 3001"
echo ""
echo "   Option B (Production): Deploy to VPS/Cloud"
echo "   → Use DigitalOcean, AWS, etc."
echo ""
echo "2. 🌐 Deploy to Vercel:"
echo "   → Go to vercel.com"
echo "   → Import your GitHub repository"
echo "   → Set root directory: packages/frontend"
echo "   → Add environment variables:"
echo "     NEXT_PUBLIC_API_URL=https://your-backend-url"
echo "     NEXT_PUBLIC_SOLANA_NETWORK=devnet"
echo "     NEXT_PUBLIC_HONEYCOMB_PROJECT_ID=your-project-id"
echo ""
echo "3. ✅ Test your deployment:"
echo "   → Frontend: https://your-app.vercel.app"
echo "   → Backend: https://your-backend-url/api/health"
echo ""
echo "📚 Full guide: ./VERCEL_DEPLOYMENT.md"
echo ""
echo "🎉 Your Rise of Founders platform will be live!"

# Step 5: Show current status
echo "\n📊 Current Docker Status:"
echo "========================="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo "\n✨ Setup complete! Follow the steps above to deploy to Vercel."