import 'express-async-errors';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { config, allowedOrigins, rateLimitConfig, isDevelopment } from './config/environment';
import { prisma } from './config/database';
// import { errorHandler } from './middleware/errorHandler';
import { asyncHandler } from './middleware/errorHandler';
// import { requestLogger } from './middleware/requestLogger';
import { validateAuth } from './middleware/auth';
import { honeycombInitializationService } from './services/honeycomb/initialization';

// Import routes - enabling one by one
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import gameRoutes from './routes/game';
import teamRoutes from './routes/teams';
import missionRoutes from './routes/missions';
import sponsorRoutes from './routes/sponsors';
// import mentorRoutes from './routes/mentors';
import adminRoutes from './routes/admin';
import honeycombRoutes from './routes/honeycomb';
import pvpRoutes from './routes/pvp';
import questRoutes from './routes/quests';
import escrowRoutes from './routes/escrow';

const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https:'],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting - temporarily disabled for testing
// const limiter = rateLimit({
//   windowMs: Number(rateLimitConfig.windowMs),
//   max: Number(rateLimitConfig.maxRequests),
//   message: {
//     error: 'Too many requests from this IP, please try again later.',
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// app.use(limiter);

// General middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (isDevelopment) {
  app.use(morgan('dev'));
}
// app.use(requestLogger);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: config.NODE_ENV,
      uptime: process.uptime(),
      services: {
        database: 'healthy',
        honeycomb: { status: 'disabled' },
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Service health check failed',
      services: {
        database: 'unhealthy',
        honeycomb: 'unknown',
      },
    });
  }
});

// API routes - enabling one by one
app.use('/api/auth', authRoutes);
app.use('/api/users', validateAuth as any, userRoutes);

// Public endpoints
app.get('/api/public/leaderboard', async (req: Request, res: Response) => {
  try {
    const { skill, limit = 50, page = 1 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let orderBy: any = { xpTotal: 'desc' };
    
    if (skill && typeof skill === 'string') {
      orderBy = { xpTotal: 'desc' }; // Fallback to total XP
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        selectedKingdom: true,
        xpTotal: true,
        reputationScore: true,
        skillScores: true,
        badges: {
          where: { rarity: { in: ['EPIC', 'LEGENDARY'] } },
          take: 3,
        },
      },
      orderBy,
      take: Number(limit),
      skip,
    });

    // Add rank to each user
    const rankedUsers = users.map((user, index) => ({
      ...user,
      rank: skip + index + 1,
    }));

    res.json({
      success: true,
      data: {
        users: rankedUsers,
        page: Number(page),
        limit: Number(limit),
        total: await prisma.user.count(),
      },
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard'
    });
  }
});
app.use('/api/game', validateAuth as any, gameRoutes);
app.use('/api/teams', validateAuth as any, teamRoutes);
app.use('/api/missions', validateAuth as any, missionRoutes);
app.use('/api/sponsors', validateAuth as any, sponsorRoutes);
// app.use('/api/mentors', validateAuth as any, mentorRoutes);
app.use('/api/admin', validateAuth as any, adminRoutes);
app.use('/api/honeycomb', honeycombRoutes);
app.use('/api/pvp', validateAuth as any, pvpRoutes);
app.use('/api/quests', validateAuth as any, questRoutes);
app.use('/api/escrow', validateAuth as any, escrowRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  // Join user-specific room for notifications
  socket.on('join-user-room', (userId: string) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their notification room`);
  });
  
  // Join team-specific room
  socket.on('join-team-room', (teamId: string) => {
    socket.join(`team-${teamId}`);
    console.log(`Joined team room: ${teamId}`);
  });
  
  // Handle mission progress updates
  socket.on('mission-progress', (data) => {
    // Broadcast to team members
    socket.to(`team-${data.teamId}`).emit('mission-update', data);
  });
  
  // Handle PvP challenges
  socket.on('challenge-issued', (data) => {
    socket.to(`user-${data.defenderId}`).emit('challenge-received', data);
  });
  
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// Global error handler
// app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);
  
  server.close(async () => {
    console.log('HTTP server closed');
    
    try {
      await prisma.$disconnect();
      console.log('Database connection closed');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Initialize Honeycomb Protocol
async function initializeServices() {
  console.log('🔧 Initializing services...');
  
  try {
    const honeycombResult = await honeycombInitializationService.initializeHoneycombSetup();
    
    if (honeycombResult.success) {
      console.log('✅ Honeycomb Protocol initialized successfully');
      console.log(`📋 Project Ready: ${honeycombResult.projectCreated ? 'Yes' : 'No'}`);
      console.log(`🎯 Missions Initialized: ${honeycombResult.missionsInitialized}`);
      console.log(`🏆 Badges Initialized: ${honeycombResult.badgesInitialized}`);
    } else {
      console.warn('⚠️ Honeycomb initialization completed with issues:');
      honeycombResult.errors.forEach(error => console.warn(`  - ${error}`));
    }
  } catch (error) {
    console.error('❌ Failed to initialize Honeycomb Protocol:', error);
    console.warn('⚠️ Server will continue without full Honeycomb integration');
  }
}

// Start server
const PORT = config.PORT;
server.listen(PORT, async () => {
  console.log(`
🚀 Rise of Founders API Server is running!
📍 Port: ${PORT}
🌍 Environment: ${config.NODE_ENV}
🔗 Base URL: http://localhost:${PORT}
📊 Health Check: http://localhost:${PORT}/health
🎮 Ready to build the future of founder education!
  `);
  
  // Initialize services after server starts
  await initializeServices();
  
  console.log('\n🎯 All systems ready! The game can now begin! 🚀\n');
});

export { io };