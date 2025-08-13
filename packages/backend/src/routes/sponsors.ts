import { Router, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { prisma } from '../config/database';
import { AuthenticatedRequest, requireSponsor } from '../middleware/auth';
import { ApiError, asyncHandler } from '../middleware/errorHandler';

const router = Router();

// GET /sponsors/quests - Get all sponsor quests
router.get('/quests', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const quests = await prisma.sponsorQuest.findMany({
    where: { 
      isActive: true,
      startDate: { lte: new Date() },
      endDate: { gte: new Date() },
    },
    include: {
      sponsor: {
        select: { id: true, organizationName: true, logoUrl: true },
      },
      node: {
        select: { id: true, title: true, difficulty: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: quests,
  });
}));

// POST /sponsors/quests - Create sponsor quest (sponsors only)
router.post('/quests', requireSponsor, [
  body('title').isLength({ min: 5, max: 100 }),
  body('description').isLength({ min: 20, max: 2000 }),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400);
  }

  // Get sponsor profile
  const sponsor = await prisma.sponsor.findUnique({
    where: { userId: req.user!.id },
  });

  if (!sponsor) {
    throw new ApiError('Sponsor profile not found', 404);
  }

  const questData = req.body;
  
  const quest = await prisma.sponsorQuest.create({
    data: {
      ...questData,
      sponsorId: sponsor.id,
    },
  });

  res.status(201).json({
    success: true,
    data: quest,
  });
}));

export default router;