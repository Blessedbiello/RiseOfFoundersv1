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

// Basic API route
app.get('/api/status', (req, res) => {
  res.json({ 
    message: 'Rise of Founders API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Auth routes
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API status: http://localhost:${PORT}/api/status`);
});