# 🚀 Rise of Founders - Deployment Guide

This guide provides multiple deployment options for hosting the Rise of Founders platform.

## 🎯 Quick Deploy Options

### Option 1: DigitalOcean App Platform (Recommended)
**One-click deployment with managed database**

1. **Fork the repository** to your GitHub account
2. **Create a DigitalOcean account** if you don't have one
3. **Deploy using App Platform**:
   - Go to DigitalOcean App Platform
   - Connect your GitHub repository
   - Import the `.do/app.yaml` configuration
   - Set environment variables (see below)
   - Deploy!

**Cost: ~$30-50/month**

### Option 2: Vercel + Railway/Supabase
**Frontend on Vercel, Backend on Railway**

**Frontend (Vercel):**
1. Connect your GitHub repo to Vercel
2. Set environment variables
3. Deploy automatically

**Backend (Railway):**
1. Connect your GitHub repo to Railway
2. Set environment variables
3. Railway provides PostgreSQL database

**Cost: ~$20-30/month**

### Option 3: Docker Self-Hosted
**Full control on VPS/cloud server**

**Requirements:**
- Ubuntu 20.04+ server
- 2GB+ RAM
- Docker & Docker Compose
- Domain name (optional)

---

## 🔧 Environment Variables Setup

### Required Variables:

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/rise_of_founders_prod"

# JWT Secret (generate with: openssl rand -base64 64)
JWT_SECRET="your_super_secure_jwt_secret_at_least_64_characters_long"

# Honeycomb Protocol (get from https://honeycombprotocol.com)
HONEYCOMB_API_KEY="your_honeycomb_api_key"
NEXT_PUBLIC_HONEYCOMB_PROJECT_ID="your_honeycomb_project_id"

# GitHub OAuth (create at https://github.com/settings/applications/new)
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"

# Solana
SOLANA_RPC_URL="https://api.devnet.solana.com"
NEXT_PUBLIC_SOLANA_NETWORK="devnet"

# Frontend URL
NEXT_PUBLIC_API_URL="https://your-domain.com"
```

---

## 🚀 Deployment Instructions

### DigitalOcean App Platform

1. **Prepare Repository**:
```bash
git clone https://github.com/your-username/RiseOfFoundersv1
cd RiseOfFoundersv1
```

2. **Create App**:
   - Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
   - Click "Create App"
   - Connect GitHub repository
   - Import from `.do/app.yaml`

3. **Set Environment Variables**:
   - In app settings, add all required environment variables
   - Mark sensitive variables as "encrypted"

4. **Deploy**:
   - Click "Create Resources"
   - Wait for deployment (5-10 minutes)
   - Your app will be available at the provided URL

### Docker Self-Hosted

1. **Server Setup**:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

2. **Deploy Application**:
```bash
# Clone repository
git clone https://github.com/your-username/RiseOfFoundersv1
cd RiseOfFoundersv1

# Copy environment file
cp .env.production .env

# Edit environment variables
nano .env

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

3. **Setup SSL (Optional)**:
```bash
# Install Certbot
sudo apt install certbot

# Get SSL certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates to nginx folder
sudo mkdir -p ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem

# Restart nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

### Vercel + Railway

**Frontend (Vercel):**
1. Connect GitHub repo at [vercel.com](https://vercel.com)
2. Set framework preset to "Next.js"
3. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   NEXT_PUBLIC_SOLANA_NETWORK=devnet
   NEXT_PUBLIC_HONEYCOMB_PROJECT_ID=your_project_id
   ```
4. Deploy

**Backend (Railway):**
1. Connect GitHub repo at [railway.app](https://railway.app)
2. Add PostgreSQL database service
3. Set environment variables (all backend vars)
4. Deploy

---

## 🔐 Security Setup

### 1. API Keys & Secrets

**Honeycomb Protocol:**
1. Visit [honeycombprotocol.com](https://honeycombprotocol.com)
2. Create project
3. Get API key and Project ID

**GitHub OAuth:**
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create new OAuth App
3. Set Authorization callback URL: `https://your-domain.com/api/auth/github/callback`
4. Get Client ID and Client Secret

**JWT Secret:**
```bash
# Generate secure JWT secret
openssl rand -base64 64
```

### 2. Database Security

**Production Database:**
- Use strong password
- Enable SSL connections
- Restrict access to application IPs only
- Regular backups

### 3. Environment Variables

**Never commit these to Git:**
- API keys
- Database passwords
- JWT secrets
- OAuth credentials

---

## 📊 Monitoring & Maintenance

### Health Checks

**Backend Health:**
```bash
curl https://your-domain.com/api/health
```

**Database Health:**
```bash
# Check connections
docker exec -it rise-of-founders-db psql -U postgres -d rise_of_founders_prod -c "SELECT count(*) FROM pg_stat_activity;"
```

### Logs

**Docker Logs:**
```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs

# View specific service
docker-compose -f docker-compose.prod.yml logs frontend
docker-compose -f docker-compose.prod.yml logs backend
```

### Backups

**Database Backup:**
```bash
# Create backup
docker exec rise-of-founders-db pg_dump -U postgres rise_of_founders_prod > backup.sql

# Restore backup
docker exec -i rise-of-founders-db psql -U postgres rise_of_founders_prod < backup.sql
```

---

## 🐛 Troubleshooting

### Common Issues

**1. Database Connection Failed**
```bash
# Check database status
docker-compose -f docker-compose.prod.yml ps database

# Check database logs
docker-compose -f docker-compose.prod.yml logs database

# Reset database
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d database
```

**2. Frontend Build Errors**
```bash
# Clear Next.js cache
rm -rf packages/frontend/.next

# Rebuild
docker-compose -f docker-compose.prod.yml build frontend
docker-compose -f docker-compose.prod.yml up -d frontend
```

**3. API Connection Issues**
- Check `NEXT_PUBLIC_API_URL` points to correct backend
- Verify CORS settings in backend
- Check firewall/security group settings

### Getting Help

1. **Check logs first** - Most issues show up in container logs
2. **Verify environment variables** - Incorrect URLs/keys cause most failures
3. **Test locally** - Ensure it works with `docker-compose up` first
4. **Network connectivity** - Check if services can reach each other

---

## 🎉 Post-Deployment

After successful deployment:

1. **Test all features**:
   - Wallet connection
   - Course completion
   - XP system
   - Leaderboard

2. **Set up monitoring**:
   - Uptime monitoring
   - Error tracking
   - Performance monitoring

3. **Configure backups**:
   - Daily database backups
   - Code repository backups

4. **Update DNS** (if using custom domain):
   - Point domain to your hosting platform
   - Set up SSL certificate

Your Rise of Founders platform is now live! 🚀

**Demo URL**: `https://your-domain.com`
**API URL**: `https://your-domain.com/api`