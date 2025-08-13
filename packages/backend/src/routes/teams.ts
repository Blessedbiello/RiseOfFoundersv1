import { Router, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiError, asyncHandler } from '../middleware/errorHandler';

const router = Router();

// GET /teams - Get all teams (public)
router.get('/', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const teams = await prisma.team.findMany({
    where: { isPublic: true, isActive: true },
    include: {
      members: {
        where: { isActive: true },
        include: {
          user: {
            select: { id: true, displayName: true, avatarUrl: true },
          },
        },
      },
    },
    orderBy: { totalXp: 'desc' },
  });

  res.json({
    success: true,
    data: teams,
  });
}));

// POST /teams - Create new team
router.post('/', [
  body('name').isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9\s\-_]+$/),
  body('description').optional().isLength({ max: 500 }),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400);
  }

  const { name, description } = req.body;

  // Check if user is already in a team
  const existingMembership = await prisma.teamMember.findFirst({
    where: {
      userId: req.user!.id,
      isActive: true,
    },
  });

  if (existingMembership) {
    throw new ApiError('You are already a member of a team', 400);
  }

  const team = await prisma.team.create({
    data: {
      name,
      description,
      memberCount: 1,
      members: {
        create: {
          userId: req.user!.id,
          role: 'FOUNDER',
          permissions: {
            canInviteMembers: true,
            canRemoveMembers: true,
            canEditAgreement: true,
            canManageVault: true,
            canInitiateSplit: true,
            canManageQuests: true,
          },
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, displayName: true, avatarUrl: true },
          },
        },
      },
    },
  });

  res.status(201).json({
    success: true,
    data: team,
  });
}));

// GET /teams/:id - Get team details
router.get('/:id', [
  param('id').isString(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      members: {
        where: { isActive: true },
        include: {
          user: {
            select: { id: true, displayName: true, avatarUrl: true, xpTotal: true },
          },
        },
      },
      agreement: true,
      territories: {
        include: {
          node: {
            select: { id: true, title: true, difficulty: true },
          },
        },
      },
    },
  });

  if (!team) {
    throw new ApiError('Team not found', 404);
  }

  res.json({
    success: true,
    data: team,
  });
}));

export default router;