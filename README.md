# Rise of Founders

A gamified founder education & launchpad that blends hands-on startup training with persistent, verifiable on-chain progression powered by Honeycomb Protocol.

## 🏗️ Architecture

This is a monorepo containing:

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS + Three.js
- **Backend**: Node.js + Express + Prisma + PostgreSQL
- **Smart Contracts**: Anchor programs for Solana
- **Shared**: Common types and utilities

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL
- Solana CLI
- Anchor CLI
- Phantom or Solflare wallet

### Installation

```bash
# Clone and install dependencies
git clone <repository-url>
cd rise-of-founders
npm install

# Set up environment variables
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.example packages/frontend/.env

# Start development servers
npm run dev
```

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

## 🎮 Game Features

### Core Mechanics
- **Maps & Missions**: Skill-based conquest maps with hands-on challenges
- **Honeycomb Integration**: On-chain progression, traits, and attestations
- **Teams & Legal**: AI-generated founder agreements with wallet signatures
- **PvP & Competition**: Territory-based battles and global leaderboards
- **Sponsor Ecosystem**: Brand quests with real rewards
- **Mentor Marketplace**: Expert guidance and coaching

### Technical Features
- Real-time mission verification (GitHub, Solana, URL)
- 3D interactive world map with Three.js
- Multi-sig team vaults and treasuries
- NFT credentialing and badges
- Anti-cheat and reputation systems
- Comprehensive admin and moderation tools

## 📁 Project Structure

```
rise-of-founders/
├── packages/
│   ├── frontend/           # Next.js application
│   ├── backend/            # Express API server
│   ├── smart-contracts/    # Anchor programs
│   └── shared/             # Common utilities
├── config/                 # Configuration files
├── docs/                   # Documentation
└── tools/                  # Development tools
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev                 # Start all services
npm run dev:frontend        # Frontend only
npm run dev:backend         # Backend only

# Building
npm run build              # Build all packages
npm run build:frontend     # Build frontend
npm run build:backend      # Build backend

# Testing
npm run test              # Run all tests
npm run lint              # Lint all packages
npm run type-check        # TypeScript checking
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

## 🎯 Honeycomb Integration

This game showcases Honeycomb Protocol's capabilities:

- **Missions**: Every challenge is a Honeycomb mission with on-chain completion
- **Traits**: Player characteristics evolve based on verified achievements
- **Attestations**: Major milestones create permanent on-chain credentials
- **Progressive Complexity**: From simple tasks to complex team projects

## 🏆 Bounty Submission

This project is built for the Honeycomb Protocol bounty focusing on:

1. **Creative Use**: Startup simulation with real educational value
2. **Deep Integration**: Honeycomb powers core game mechanics
3. **Technical Excellence**: Clean architecture and comprehensive features
4. **Community Value**: Teams, mentors, and sponsors create network effects

## 📚 Documentation

- [API Documentation](./docs/api/)
- [Architecture Guide](./docs/architecture/)
- [Game Design Document](./docs/game-design/)
- [Deployment Guide](./docs/deployment/)

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