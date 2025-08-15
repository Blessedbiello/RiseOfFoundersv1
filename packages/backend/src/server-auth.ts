import express from 'express';
import cors from 'cors';
import { prisma } from './config/database';
import authRoutes from './routes/auth';

const app = express();
const PORT = process.env.PORT || 8000;

// Basic middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      error: 'Database connection failed' 
    });
  }
});

// API status
app.get('/api/status', (req, res) => {
  res.json({ 
    message: 'Rise of Founders API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Add a simple profile update endpoint
app.put('/api/auth/profile', async (req, res) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7);
    
    // For now, let's decode the JWT to get user info
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    
    const { name, bio, profilePicture } = req.body;
    
    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        displayName: name,
        bio,
        avatarUrl: profilePicture,
      },
    });

    res.json({
      success: true,
      data: {
        user: {
          id: updatedUser.id,
          name: updatedUser.displayName,
          bio: updatedUser.bio,
          profilePicture: updatedUser.avatarUrl,
          walletAddress: updatedUser.walletAddress,
          role: updatedUser.role,
          xpTotal: updatedUser.xpTotal,
          level: Math.floor(updatedUser.xpTotal / 1000) + 1,
        }
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API status: http://localhost:${PORT}/api/status`);
  console.log(`🔐 Authentication ready with profile updates`);
});