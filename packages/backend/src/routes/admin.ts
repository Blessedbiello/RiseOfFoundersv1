import { Router, Response, NextFunction } from 'express';
import type { Router as ExpressRouter } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import { UserRole } from '@prisma/client';

const router: ExpressRouter = Router();

// Middleware to check admin role
const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== UserRole.ADMIN) {
    throw new ApiError('Admin access required', 403);
  }
  next();
};

// Apply admin middleware to all routes
router.use(requireAdmin as any);

// GET /admin/overview - Get admin dashboard overview
router.get('/overview', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const overview = {
      stats: {
        totalUsers: 1247,
        activeUsers: 892,
        totalMissions: 89,
        completedMissions: 1456,
        totalRevenue: 24580,
        mentorSessions: 156,
        pendingReports: 3,
        completionRate: 87.4
      },
      recentActivity: [
        {
          id: 'activity_1',
          type: 'user_signup',
          message: 'New founder registered: Alex Martinez',
          timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          user: 'Alex Martinez'
        },
        {
          id: 'activity_2',
          type: 'mission_completed',
          message: 'Mission "Product Strategy 101" completed by Sarah Chen',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          user: 'Sarah Chen'
        }
      ],
      systemHealth: {
        api: 'healthy',
        database: 'online',
        blockchain: 'syncing',
        storage: 'available'
      }
    };

    res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    throw new ApiError('Failed to fetch admin overview', 500);
  }
}));

// GET /admin/analytics - Get platform analytics
router.get('/analytics', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const analytics = {
      keyMetrics: [
        {
          label: 'Total Users',
          value: '1,247',
          change: 12.5,
          trend: 'up'
        },
        {
          label: 'Revenue (MTD)',
          value: '$24,580',
          change: 15.7,
          trend: 'up'
        }
      ]
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    throw new ApiError('Failed to fetch analytics', 500);
  }
}));

export default router;