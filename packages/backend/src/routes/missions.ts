import { Router, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiError, asyncHandler } from '../middleware/errorHandler';

const router = Router();

// POST /missions/:id/submit - Submit mission solution
router.post('/:id/submit', [
  param('id').isString(),
  body('artifacts').isArray(),
  body('submitterType').isIn(['USER', 'TEAM']),
  body('submitterId').isString(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400);
  }

  const { id: missionId } = req.params;
  const { artifacts, submitterType, submitterId } = req.body;

  // Verify mission exists
  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    include: { node: true },
  });

  if (!mission) {
    throw new ApiError('Mission not found', 404);
  }

  // Create submission
  const submission = await prisma.submission.create({
    data: {
      missionId,
      submitterType,
      submitterId,
      artifacts,
      maxScore: 100, // Default scoring
      status: 'SUBMITTED',
    },
  });

  res.status(201).json({
    success: true,
    data: submission,
  });
}));

// GET /missions/:id/submissions - Get mission submissions
router.get('/:id/submissions', [
  param('id').isString(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id: missionId } = req.params;

  const submissions = await prisma.submission.findMany({
    where: {
      missionId,
      OR: [
        { submitterType: 'USER', submitterId: req.user!.id },
        { 
          submitterType: 'TEAM',
          submitterTeam: {
            members: {
              some: { userId: req.user!.id, isActive: true },
            },
          },
        },
      ],
    },
    include: {
      reviews: {
        include: {
          reviewer: {
            select: { id: true, displayName: true, avatarUrl: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: submissions,
  });
}));

export default router;