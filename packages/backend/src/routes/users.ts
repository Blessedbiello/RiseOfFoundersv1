import { Router, Response } from 'express';
import { body, validationResult, param } from 'express-validator';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiError, asyncHandler } from '../middleware/errorHandler';

const router: any = Router();

// GET /users/profile - Get current user profile
router.get('/profile', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: {
      badges: true,
      traits: true,
      teamMembers: {
        include: {
          team: {
            select: {
              id: true,
              name: true,
              emblemUrl: true,
              isActive: true,
            },
          },
        },
        where: { isActive: true },
      },
      territories: {
        include: {
          node: {
            select: {
              id: true,
              title: true,
              difficulty: true,
            },
          },
        },
      },
      nodeProgress: {
        where: { status: 'COMPLETED' },
        include: {
          node: {
            select: {
              id: true,
              title: true,
              difficulty: true,
              rewards: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  // Calculate user stats
  const completedMissions = user.nodeProgress.length;
  const totalEarnings = user.nodeProgress.reduce((sum: number, progress: any) => {
    const rewards = progress.node?.rewards as any;
    return sum + (rewards?.xp || 0);
  }, 0);
  
  const stats = {
    missionsCompleted: completedMissions,
    teamsJoined: user.teamMembers.length,
    territoriesOwned: user.territories.length,
    totalEarnings,
    // Add more stats as needed
  };

  res.json({
    success: true,
    data: {
      ...user,
      stats,
    },
  });
}));

// PUT /users/profile - Update user profile
router.put('/profile', [
  body('displayName').optional().isLength({ min: 2, max: 30 }),
  body('bio').optional().isLength({ max: 500 }),
  body('email').optional().isEmail(),
  body('avatarUrl').optional().isURL(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400);
  }

  const { displayName, bio, email, avatarUrl } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      ...(displayName && { displayName }),
      ...(bio && { bio }),
      ...(email && { email }),
      ...(avatarUrl && { avatarUrl }),
    },
  });

  res.json({
    success: true,
    data: user,
  });
}));

// GET /users/:id - Get user by ID
router.get('/:id', [
  param('id').isString().isLength({ min: 1 }),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      xpTotal: true,
      reputationScore: true,
      skillScores: true,
      isVerified: true,
      badges: true,
      traits: true,
      // Only include public information
    },
  });

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  res.json({
    success: true,
    data: user,
  });
}));

// POST /users/add-xp - Add XP to user (for course completion, etc.)
router.post('/add-xp', [
  body('amount').isInt({ min: 1, max: 10000 }).withMessage('XP amount must be between 1 and 10000'),
  body('source').isString().isLength({ min: 1, max: 100 }).withMessage('Source is required'),
  body('description').optional().isString().isLength({ max: 255 }),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400);
  }

  const { amount, source, description } = req.body;
  const userId = req.user!.id;

  try {
    // Update user's total XP
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        xpTotal: {
          increment: amount,
        },
      },
      select: {
        id: true,
        displayName: true,
        xpTotal: true,
        reputationScore: true,
        selectedKingdom: true,
        avatarUrl: true,
      },
    });

    // Log the XP addition (could be stored in logs or separate table later)
    console.log(`User ${userId} earned ${amount} XP from ${source}: ${description || 'Course completion'}`);

    res.json({
      success: true,
      data: {
        user: updatedUser,
        xpAdded: amount,
        newTotal: updatedUser.xpTotal,
      },
      message: `Successfully added ${amount} XP from ${source}`,
    });
  } catch (error: any) {
    console.error('Failed to add XP:', error);
    throw new ApiError('Failed to add XP', 500);
  }
}));

// GET /users/leaderboard - Get user leaderboard
router.get('/leaderboard', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { skill, limit = 50, page = 1 } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  let orderBy: any = { xpTotal: 'desc' };
  
  if (skill && typeof skill === 'string') {
    // This would need custom logic to sort by specific skill
    orderBy = { xpTotal: 'desc' }; // Fallback to total XP
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
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
}));

export default router;