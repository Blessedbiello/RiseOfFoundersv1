import { Router, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiError, asyncHandler } from '../middleware/errorHandler';

const router = Router();

// GET /mentors - Get all available mentors
router.get('/', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const mentors = await prisma.mentor.findMany({
    where: { isAvailable: true, isVerified: true },
    include: {
      user: {
        select: { id: true, displayName: true, avatarUrl: true },
      },
    },
    orderBy: { averageRating: 'desc' },
  });

  res.json({
    success: true,
    data: mentors,
  });
}));

// POST /mentors/sessions - Book mentor session
router.post('/sessions', [
  body('mentorId').isString(),
  body('title').isLength({ min: 5, max: 100 }),
  body('description').isLength({ min: 10, max: 500 }),
  body('scheduledAt').isISO8601(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400);
  }

  const { mentorId, title, description, scheduledAt } = req.body;

  const session = await prisma.mentorSession.create({
    data: {
      mentorId,
      menteeId: req.user!.id,
      menteeType: 'USER',
      title,
      description,
      scheduledAt: new Date(scheduledAt),
      category: 'General',
      duration: 60,
      cost: 0, // Default to free
      paymentMethod: 'TOKENS',
    },
  });

  res.status(201).json({
    success: true,
    data: session,
  });
}));

export default router;