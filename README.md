# 🚀 Rise of Founders

**A gamified Web3 platform for founder education and skill development**

Rise of Founders is a blockchain-powered educational gaming platform that transforms the journey of becoming a successful founder into an engaging, competitive, and rewarding experience. Built with Honeycomb Protocol integration for on-chain achievement tracking and verified skill progression.

## 🎬 Live Demo

**[📺 Watch Full Platform Demo (3 minutes)](https://www.loom.com/share/9c725b6cc91e48e8a8e261bcca63eaf8?sid=8301402a-8047-4aa5-bed2-4398925f71c1)**

*See our complete Web3 gaming platform in action: wallet authentication, gamified education system, personal achievement maps, real-time XP tracking, and blockchain-verified progress!*

![Rise of Founders](https://img.shields.io/badge/Status-Alpha-orange)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Solana](https://img.shields.io/badge/Solana-Mainnet-purple)
![Honeycomb](https://img.shields.io/badge/Honeycomb-Protocol-yellow)

---

## 🎮 What is Rise of Founders?

Rise of Founders gamifies the founder education experience by combining:

- **🎯 Mission-based Learning**: Complete real-world founder challenges
- **🏆 On-chain Achievements**: Blockchain-verified badges and progress via Honeycomb Protocol
- **⚔️ PvP Competitions**: Challenge other founders in skill-based battles
- **👥 Team Formation**: Build and manage founding teams
- **🌍 Territory Control**: Compete for virtual territories representing market dominance
- **📈 Skill Progression**: Level up technical, business, marketing, and leadership skills
- **💰 Token Economy**: Earn rewards for achievements and contributions

---

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- **Next.js 14** with TypeScript
- **Tailwind CSS** for styling
- **Solana Wallet Adapter** for Web3 integration
- **Zustand** for state management
- **React Hook Form** + **Zod** for form handling

**Backend:**
- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **Prisma ORM** with PostgreSQL
- **Honeycomb Protocol** for blockchain integration
- **JWT Authentication** with wallet-based auth

**Blockchain:**
- **Solana** blockchain
- **Honeycomb Protocol** for on-chain profiles, achievements, and missions
- **Wallet-based authentication** (Phantom, Solflare)

**Infrastructure:**
- **PostgreSQL** database
- **Docker** for development
- **pnpm** monorepo workspace

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **pnpm** package manager
- **Docker** for PostgreSQL
- **Solana wallet** (Phantom or Solflare)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd RiseOfFoundersv1
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**

Copy the example environment files:
```bash
# Backend
cp packages/backend/.env.example packages/backend/.env

# Frontend  
cp packages/frontend/.env.example packages/frontend/.env
```

4. **Start PostgreSQL database**
```bash
docker run --name postgres-rise \
  -e POSTGRES_PASSWORD=test_password \
  -e POSTGRES_DB=rise_of_founders_dev \
  -p 5432:5432 \
  -d postgres:14
```

5. **Run database migrations**
```bash
cd packages/backend
npx prisma db push
```

6. **Start the development servers**
```bash
# In the root directory
pnpm run dev
```

This will start:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

### Environment Setup

#### Backend (.env)
```
DATABASE_URL="postgresql://username:password@localhost:5432/rise_of_founders"
JWT_SECRET="your-jwt-secret"
HONEYCOMB_API_KEY="your-honeycomb-api-key"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
OPENAI_API_KEY="your-openai-api-key"
SOLANA_RPC_URL="https://api.devnet.solana.com"
```

#### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_SOLANA_NETWORK="devnet"
NEXT_PUBLIC_HONEYCOMB_PROJECT_ID="your-project-id"
```

---

## 🎯 Core Features

### 🔐 Web3 Authentication
- **Wallet-based login** using Solana wallets
- **Honeycomb Protocol** integration for on-chain identity
- **JWT tokens** for session management
- **Profile creation** with blockchain verification

### 🎮 Gamification System

#### 🎯 Missions & Challenges
- **Skill-based missions**: Technical, business, marketing challenges
- **Real-world projects**: Build MVPs, create business plans, form teams
- **XP rewards**: Earn experience points for completed missions
- **Progressive difficulty**: Unlock advanced challenges as you level up

#### 🏆 Achievement System
- **On-chain badges**: Blockchain-verified achievements via Honeycomb
- **Skill trees**: Technical, Business, Marketing, Community, Design, Product
- **Leaderboards**: Compete for top rankings in various categories
- **Reputation scores**: Build credibility through consistent performance

#### ⚔️ PvP Combat System
- **1v1 Challenges**: Direct skill competitions between founders
- **Team vs Team**: Collaborative challenges between founding teams
- **Tournament mode**: Organized competitions with prizes
- **Real-time battles**: Live coding, pitch competitions, business case studies

### 👥 Team & Social Features

#### 🤝 Team Formation
- **Create teams**: Build founding teams with complementary skills
- **Invite system**: Recruit other founders to join your team
- **Equity management**: Define roles and equity distribution
- **Team challenges**: Collaborative missions requiring multiple skill sets

#### 🌍 Territory Control
- **Virtual map**: Compete for control of market territories
- **Strategic gameplay**: Balance expansion with resource management
- **Team territories**: Collaborate to control larger regions
- **Economic benefits**: Generate passive income from controlled territories

### 💰 Token Economy
- **XP Tokens**: Earned through mission completion and achievements
- **Skill tokens**: Specialized tokens for each skill category
- **Team tokens**: Shared resources for team-based activities
- **Marketplace**: Trade resources, services, and achievements

## 📁 Project Structure

```
RiseOfFoundersv1/
├── packages/
│   ├── frontend/                 # Next.js React application
│   │   ├── src/
│   │   │   ├── app/             # Next.js app router pages
│   │   │   ├── components/      # React components
│   │   │   ├── hooks/           # Custom React hooks
│   │   │   ├── services/        # API service layers
│   │   │   ├── stores/          # Zustand state stores
│   │   │   └── types/           # TypeScript type definitions
│   │   └── package.json
│   │
│   ├── backend/                 # Node.js Express API
│   │   ├── src/
│   │   │   ├── routes/          # API route handlers
│   │   │   ├── services/        # Business logic services
│   │   │   ├── middleware/      # Express middleware
│   │   │   ├── config/          # Configuration files
│   │   │   └── types/           # TypeScript type definitions
│   │   ├── prisma/              # Database schema and migrations
│   │   └── package.json
│   │
│   ├── shared/                  # Shared utilities and types
│   │   ├── src/
│   │   │   ├── types/           # Shared TypeScript types
│   │   │   └── utils/           # Shared utility functions
│   │   └── package.json
│   │
│   └── smart-contracts/         # Solana smart contracts (future)
│
├── game-content/                # Game data and configurations
├── docs/                        # Documentation
├── pnpm-workspace.yaml         # pnpm workspace configuration
└── README.md
```

---

## 🔧 Development

### Running the Development Environment

1. **Start all services**:
```bash
pnpm run dev
```

2. **Individual services**:
```bash
# Frontend only
pnpm --filter @rise-of-founders/frontend run dev

# Backend only  
pnpm --filter @rise-of-founders/backend run dev
```

### Code Quality

```bash
# TypeScript compilation check
pnpm run type-check

# Linting
pnpm run lint

# Formatting
pnpm run format
```

### Database Management

```bash
# Generate Prisma client
cd packages/backend
npx prisma generate

# Run migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

### Smart Contract Development

```bash
cd packages/smart-contracts

# Build contracts
anchor build

# Test contracts
anchor test

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

---

## 🔗 Honeycomb Protocol Integration

### On-Chain Features

#### User Profiles
- **Blockchain identity** tied to wallet address
- **Verified achievements** that can't be faked
- **Cross-platform portability** of progress and achievements
- **Reputation system** built on verifiable on-chain data

#### Achievement System
- **NFT badges** for major accomplishments
- **Skill certifications** as verifiable credentials
- **Mission completion** tracked on-chain
- **Team achievements** for collaborative accomplishments

#### Mission Framework
- **Decentralized missions** that can be verified independently
- **Community-created content** with blockchain verification
- **Reward distribution** through smart contracts
- **Anti-cheat mechanisms** built into the protocol

### Benefits of Blockchain Integration

1. **🔒 Verifiable Achievements**: Employers and partners can verify skills and accomplishments
2. **🌐 Portability**: Take your progress to any platform that integrates with Honeycomb
3. **💰 Real Value**: Achievements have actual value and can be traded or used across platforms
4. **🏛️ Decentralization**: No single entity controls your progress or achievements
5. **🔍 Transparency**: All achievements and progress are publicly verifiable


---

## 🚀 Deployment

Ready to host your own Rise of Founders platform? We provide multiple deployment options:

### 🎯 Quick Deploy Options:

1. **DigitalOcean App Platform** - One-click deployment (~$30-50/month)
2. **Vercel + Railway** - Frontend/Backend split (~$20-30/month)  
3. **Docker Self-Hosted** - Full control on VPS

**📋 [Complete Deployment Guide](./DEPLOYMENT_GUIDE.md)**

### 🔧 Prerequisites for Hosting:

- **Honeycomb Protocol API Key** - [Get from honeycombprotocol.com](https://honeycombprotocol.com)
- **GitHub OAuth App** - For authentication
- **PostgreSQL Database** - Managed or self-hosted
- **Domain Name** - Optional but recommended

**Estimated Setup Time**: 15-30 minutes with our guides

---

## 📚 Documentation

- [🚀 Deployment Guide](./DEPLOYMENT_GUIDE.md) - Complete hosting setup
- [🎬 Demo Video Script](./DEMO_VIDEO_SCRIPT.md) - Platform walkthrough
- [API Documentation](./docs/api/)
- [Architecture Guide](./docs/architecture/)
- [Game Design Document](./docs/game-design/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests and documentation
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Honeycomb Protocol](https://honeycombprotocol.com/) for on-chain progression primitives
- [Solana](https://solana.com/) for the underlying blockchain infrastructure
- [Verxio](https://verxio.xyz/) for loyalty and streak mechanics
- The Web3 gaming community for inspiration and feedback