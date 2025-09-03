import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/environment';

const app = express();

// Basic middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.NODE_ENV,
  });
});

// Basic test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Rise of Founders API is running!', blockchain: 'ready' });
});

// Start server
const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`
🚀 Rise of Founders API Server is running!
📍 Port: ${PORT}
🌍 Environment: ${config.NODE_ENV}
🔗 Base URL: http://localhost:${PORT}
📊 Health Check: http://localhost:${PORT}/health
🎮 Ready for devnet deployment testing!
  `);
});