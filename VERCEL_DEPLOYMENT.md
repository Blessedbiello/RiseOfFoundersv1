# 🚀 Vercel + Docker Backend Deployment Guide

This guide shows how to deploy the frontend to Vercel while keeping the backend in Docker.

## 🎯 Architecture

```
┌─────────────────┐    ┌──────────────────┐
│   Vercel CDN    │    │  Your Server     │
│                 │    │                  │
│  ┌───────────┐  │    │  ┌────────────┐  │
│  │ Frontend  │◄─┼────┼─►│  Backend   │  │
│  │ (Next.js) │  │    │  │ (Docker)   │  │
│  └───────────┘  │    │  └────────────┘  │
│                 │    │  ┌────────────┐  │
└─────────────────┘    │  │ PostgreSQL │  │
                       │  │ (Docker)   │  │
                       │  └────────────┘  │
                       └──────────────────┘
```

## 📋 Prerequisites

1. **GitHub Repository**: Push your code to GitHub
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Public Server**: VPS, cloud instance, or ngrok tunnel for backend
4. **Domain/IP**: Public access to your Docker backend

## 🔧 Step 1: Expose Backend Publicly

### Option A: Using ngrok (Quick Testing)

```bash
# Install ngrok (if not already installed)
# Download from https://ngrok.com/download

# Expose your Docker backend
ngrok http 3001

# This will give you a public URL like: https://abc123.ngrok.io
```

### Option B: Using a VPS/Cloud Server

```bash
# Deploy your Docker backend to a cloud server
# Examples: DigitalOcean, AWS EC2, Google Cloud, etc.

# Start backend with public access
docker-compose -f docker-compose.vercel.yml up -d

# Configure firewall to allow port 3001
# For Ubuntu/Debian:
sudo ufw allow 3001

# Your backend will be available at: http://your-server-ip:3001
```

### Option C: Using Reverse Proxy (Recommended)

```bash
# Use nginx or Caddy to proxy backend with SSL
# Example with Caddy:

# Create Caddyfile:
your-domain.com {
    reverse_proxy localhost:3001
}

# Start Caddy:
caddy run

# Your backend will be available at: https://your-domain.com
```

## 🚀 Step 2: Deploy Frontend to Vercel

### 2.1: Push to GitHub

```bash
# Commit your changes
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2.2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Connect your GitHub repository
4. Select the `packages/frontend` directory as the root
5. Configure build settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `packages/frontend`
   - **Build Command**: `pnpm build`
   - **Install Command**: `pnpm install`

### 2.3: Set Environment Variables

In Vercel dashboard, add these environment variables:

```bash
# Required Variables:
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_HONEYCOMB_PROJECT_ID=your-honeycomb-project-id
NEXT_PUBLIC_GITHUB_CLIENT_ID=your-github-client-id
NODE_ENV=production
```

### 2.4: Deploy

1. Click "Deploy"
2. Wait for build to complete (~3-5 minutes)
3. Get your Vercel URL: `https://your-app.vercel.app`

## 🔧 Step 3: Update Backend CORS

Update your backend environment to allow Vercel domain:

```bash
# Update docker-compose.vercel.yml
FRONTEND_URL=https://your-app.vercel.app
ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:3000

# Restart backend
docker-compose -f docker-compose.vercel.yml down
docker-compose -f docker-compose.vercel.yml up -d
```

## ✅ Step 4: Test Your Deployment

1. **Frontend**: Visit `https://your-app.vercel.app`
2. **Backend**: Test `https://your-backend-domain.com/api/health`
3. **Integration**: Connect wallet and test XP system

## 🎯 Quick Setup Commands

```bash
# 1. Start backend locally
docker-compose -f docker-compose.vercel.yml up -d

# 2. Expose with ngrok (for quick testing)
ngrok http 3001

# 3. Update your Vercel environment variables with the ngrok URL
# Example: NEXT_PUBLIC_API_URL=https://abc123.ngrok.io

# 4. Redeploy on Vercel (automatic via GitHub push)
git add .
git commit -m "Update API URL"
git push origin main
```

## 🔍 Troubleshooting

### CORS Issues
```bash
# Check backend logs
docker logs rise-backend-vercel

# Verify CORS settings in backend
curl -H "Origin: https://your-app.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://your-backend-domain.com/api/health
```

### Build Errors
```bash
# Test local build
cd packages/frontend
pnpm build

# Check Vercel build logs in dashboard
```

### API Connection Issues
```bash
# Test backend accessibility
curl https://your-backend-domain.com/api/health

# Check network connectivity from Vercel (use Vercel Functions if needed)
```

## 🎉 Benefits of This Setup

✅ **Frontend**: Fast global CDN via Vercel  
✅ **Backend**: Full control with Docker  
✅ **Database**: Persistent data with Docker volumes  
✅ **Cost**: Vercel free tier + cheap VPS  
✅ **Scaling**: Frontend auto-scales, backend controlled  
✅ **SSL**: Automatic HTTPS on Vercel  

## 🔧 Optional Enhancements

1. **Custom Domain**: Add your domain to Vercel
2. **SSL Backend**: Use Caddy/nginx for HTTPS backend
3. **Production Database**: PostgreSQL on cloud (AWS RDS, etc.)
4. **Monitoring**: Add health checks and alerts
5. **CI/CD**: Automatic deployments on code changes

Your Rise of Founders platform will be live with:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend-domain.com`
- **Demo**: Fully functional with all features! 🚀