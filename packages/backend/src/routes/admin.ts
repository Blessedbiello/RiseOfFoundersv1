import { Router, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { prisma } from '../config/database';
import { AuthenticatedRequest, requireAdmin } from '../middleware/auth';
import { ApiError, asyncHandler } from '../middleware/errorHandler';

const router = Router();

// All admin routes require admin role
router.use(requireAdmin);

// GET /admin/stats - Get platform statistics
router.get('/stats', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const [
    totalUsers,
    totalTeams,
    totalMissions,
    totalSubmissions,
    activeSponsors,
    activeMentors,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.team.count({ where: { isActive: true } }),
    prisma.mission.count({ where: { isActive: true } }),
    prisma.submission.count(),
    prisma.sponsor.count({ where: { isActive: true } }),
    prisma.mentor.count({ where: { isAvailable: true } }),
  ]);

  const stats = {
    totalUsers,
    totalTeams,
    totalMissions,
    totalSubmissions,
    activeSponsors,
    activeMentors,
  };

  res.json({
    success: true,
    data: stats,
  });
}));

// GET /admin/users - Get all users for moderation
router.get('/users', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { page = 1, limit = 50, role } = req.query;

  const whereClause: any = {};
  if (role) {
    whereClause.role = role;
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      walletAddress: true,
      displayName: true,
      email: true,
      role: true,
      xpTotal: true,
      reputationScore: true,
      isVerified: true,
      lastActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: Number(limit),
    skip: (Number(page) - 1) * Number(limit),
  });

  const total = await prisma.user.count({ where: whereClause });

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    },
  });
}));

// PUT /admin/users/:id/role - Update user role
router.put('/users/:id/role', [
  param('id').isString(),
  body('role').isIn(['PLAYER', 'MENTOR', 'MODERATOR', 'ADMIN', 'SPONSOR']),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400);
  }

  const { id } = req.params;
  const { role } = req.body;

  const user = await prisma.user.update({
    where: { id },
    data: { role },
  });

  res.json({
    success: true,
    data: user,
  });
}));

export default router;