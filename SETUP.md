# Rise of Founders - Complete Setup Guide

## 🚀 Quick Start

This guide will help you set up and run the Rise of Founders game locally for testing and development.

## Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **pnpm** (latest version)
- **PostgreSQL** 14+ (local or cloud)
- **Redis** (for rate limiting and caching)
- **Git** (for version control)

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd RiseOfFoundersv1
pnpm install
```

### 2. Database Setup

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update && sudo apt install postgresql postgresql-contrib

# Or macOS with Homebrew
brew install postgresql

# Create database and user
sudo -u postgres psql
CREATE DATABASE rise_of_founders_dev;
CREATE USER rise_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE rise_of_founders_dev TO rise_user;
\q
```

#### Option B: Docker PostgreSQL
```bash
docker run --name postgres-rise \
  -e POSTGRES_DB=rise_of_founders_dev \
  -e POSTGRES_USER=rise_user \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:15
```

### 3. Redis Setup

#### Option A: Local Redis
```bash
# Ubuntu/Debian
sudo apt install redis-server

# macOS
brew install redis

# Start Redis
redis-server
```

#### Option B: Docker Redis
```bash
docker run --name redis-rise -p 6379:6379 -d redis:7-alpine
```

## ⚙️ Configuration

### 1. Backend Environment Setup

Copy the environment template and configure:

```bash
cd packages/backend
cp .env.example .env
```

Edit `.env` with your values:

```bash
# Database
DATABASE_URL=postgresql://rise_user:your_password@localhost:5432/rise_of_founders_dev

# Security - Generate strong secrets!
JWT_SECRET=your-super-secure-jwt-secret-that-is-at-least-32-characters-long
SESSION_SECRET=your-super-secure-session-secret-that-is-at-least-32-characters-long
ENCRYPTION_KEY=your32characterencryptionkeyhere

# Honeycomb Protocol (Required)
HONEYCOMB_API_KEY=your_honeycomb_api_key
HONEYCOMB_PROJECT_ID=your_honeycomb_project_id

# GitHub OAuth (Required for auth)
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret

# OpenAI (Required for AI features)
OPENAI_API_KEY=your_openai_api_key

# Redis (Optional but recommended)
REDIS_URL=redis://localhost:6379
```

### 2. Generate Strong Secrets

```bash
# Generate JWT secret (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate session secret (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate encryption key (exactly 32 characters)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### 3. Frontend Environment Setup

```bash
cd packages/frontend
cp .env.example .env.local
```

Edit `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

## 🗄️ Database Migration

Initialize and migrate the database:

```bash
cd packages/backend

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed database with initial data (optional)
npm run db:seed
```

## 🎮 Running the Game

### 1. Start Backend Server

```bash
cd packages/backend
npm run dev
```

Backend will be available at: http://localhost:8000

### 2. Start Frontend Application

```bash
cd packages/frontend
npm run dev
```

Frontend will be available at: http://localhost:3000

### 3. Start Smart Contracts (Optional)

If you need to work with Solana smart contracts:

```bash
cd packages/smart-contracts

# Install Anchor CLI first
npm install -g @coral-xyz/anchor-cli

# Build contracts
anchor build

# Deploy to localnet
anchor deploy
```

## 🧪 Testing the Game

### 1. Access the Application

Visit http://localhost:3000 in your browser

### 2. Authentication

- Click "Sign In with GitHub"
- Authorize the GitHub OAuth app
- You'll be redirected back to the game

### 3. Explore Game Features

- **Dashboard**: View your progress and stats
- **Game Map**: Navigate through missions and challenges
- **Teams**: Create or join teams
- **Mentors**: Book mentorship sessions
- **PvP**: Challenge other players
- **Admin Panel**: Access admin features (if admin user)

### 4. API Testing

Test the API endpoints directly:

```bash
# Health check
curl http://localhost:8000/health

# API endpoints (requires authentication)
curl http://localhost:8000/api/v1/missions

# View API documentation
curl http://localhost:8000/api/docs
```

## 🛠️ Development Tools

### Database Management

```bash
# View database in Prisma Studio
npm run db:studio

# Reset database (careful - deletes all data!)
npm run db:reset

# Create new migration
npx prisma migrate dev --name your_migration_name
```

### Code Quality

```bash
# Backend linting and type checking
cd packages/backend
npm run lint
npm run type-check

# Frontend linting and type checking
cd packages/frontend
npm run lint
npm run type-check
```

### Testing

```bash
# Run backend tests
cd packages/backend
npm test

# Run frontend tests
cd packages/frontend
npm test
```

## 🎯 Game Testing Scenarios

### 1. New Player Journey
1. Sign up with GitHub
2. Complete onboarding
3. Start first mission
4. Submit mission artifacts
5. Gain XP and unlock new areas

### 2. Team Collaboration
1. Create a team
2. Invite team members
3. Complete team missions
4. Set up founder agreements
5. Manage team resources

### 3. Mentor Sessions
1. Browse available mentors
2. Book a mentorship session
3. Complete the session
4. Leave reviews

### 4. PvP Challenges
1. Challenge another player
2. Submit challenge artifacts
3. Judge submissions
4. Claim territory

## 🔧 Troubleshooting

### Common Issues

**Database Connection Errors**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check database exists
psql -U rise_user -d rise_of_founders_dev -c "\dt"
```

**Redis Connection Errors**
```bash
# Check if Redis is running
redis-cli ping

# Should return "PONG"
```

**Environment Variable Errors**
- Ensure all required environment variables are set
- Check that secrets are the correct length
- Verify API keys are valid

**Build Errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
pnpm install

# Clear build cache
rm -rf .next dist

# Rebuild everything
pnpm build
```

### Logs and Debugging

```bash
# Backend logs
tail -f packages/backend/logs/app.log

# Frontend development logs
# Check the browser console and terminal

# Database query logs
# Enable in prisma schema by adding:
# log = ["query", "info", "warn", "error"]
```

## 📊 Monitoring

### Application Health

- Health endpoint: http://localhost:8000/health
- Admin dashboard: http://localhost:3000/admin
- Database studio: http://localhost:5555

### Performance Monitoring

- Enable performance logging in environment variables
- Monitor API response times
- Check database query performance

## 🚀 Production Deployment

For production deployment, see:
- Deployment documentation
- Security hardening guide
- Monitoring and alerting setup

## 🆘 Support

If you encounter issues:

1. Check this setup guide
2. Review the troubleshooting section
3. Check application logs
4. Verify environment configuration
5. Open an issue with detailed error information

## 🎮 Let's Play!

Once everything is set up, you're ready to experience the Rise of Founders game! 

Start by:
1. Creating your founder profile
2. Exploring the skill maps
3. Completing your first missions
4. Building your team
5. Growing your startup empire

Happy founding! 🚀