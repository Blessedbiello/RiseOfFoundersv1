import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { z } from 'zod';
import multer from 'multer';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import { prisma } from '../config/database';
import { honeycombMissionService, honeycombBadgeService } from '../services/honeycomb';
import { 
  validateBody, 
  validateQuery, 
  validateParams,
  completeMissionSchema,
  objectIdSchema,
  urlSchema,
  paginationSchema,
  filterSchema
} from '../lib/validation';
import { missionRateLimiter, uploadRateLimiter } from '../middleware/rateLimiter';
import { requireRole, sanitizeInput } from '../middleware/security';
import { logger, logBusinessEvent, logPerformance } from '../lib/logger';

const router: any = Router();

// Apply global middleware
router.use(sanitizeInput);

// Configure multer for secure file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5, // Maximum 5 files
    fields: 10 // Maximum 10 non-file fields
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/json'
    ];
    
    // Additional security checks
    if (!file.originalname || file.originalname.includes('..')) {
      return cb(new ApiError('Invalid filename', 400));
    }
    
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.md')) {
      cb(null, true);
    } else {
      cb(new ApiError(`File type ${file.mimetype} not supported`, 400));
    }
  }
});

// POST /missions/start - Start a mission
router.post('/start', 
  missionRateLimiter,
  validateBody(completeMissionSchema.pick({ missionId: true })),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const startTime = Date.now();
    const { missionId } = req.body;
    const userId = req.user!.id;

    try {
      // Check if user already has this mission in progress
      const existingSubmission = await prisma.submission.findFirst({
        where: {
          submitterId: userId,
          submitterType: 'USER',
          missionId,
          status: 'DRAFT'
        }
      });

      if (existingSubmission) {
        return res.json({
          success: true,
          data: { 
            submissionId: existingSubmission.id,
            message: 'Mission already in progress'
          }
        });
      }

      // Create new mission submission
      const submission = await prisma.submission.create({
        data: {
          submitterId: userId,
          submitterType: 'USER',
          missionId,
          status: 'DRAFT',
          maxScore: 100, // Default max score for missions
          metadata: {}
        }
      });

      // Log business event
      logBusinessEvent('MISSION_STARTED', userId, {
        missionId,
        submissionId: submission.id
      });

      logPerformance('mission_start', Date.now() - startTime);

      res.json({
        success: true,
        data: { 
          submissionId: submission.id,
          startedAt: submission.createdAt
        }
      });
    } catch (error: any) {
      logger.error('Failed to start mission', { 
        error: error.message, 
        userId, 
        missionId 
      });
      throw new ApiError('Failed to start mission', 500);
    }
  })
);

// POST /missions/complete - Complete a mission
router.post('/complete',
  missionRateLimiter,
  validateBody(completeMissionSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const startTime = Date.now();
    const { missionId, artifactType, artifactUrl, metadata, submissionNotes } = req.body;
    const userId = req.user!.id;

    try {
      // Find existing submission
      const submission = await prisma.submission.findFirst({
        where: {
          submitterId: userId,
          submitterType: 'USER',
          missionId,
          status: 'DRAFT'
        }
      });

      if (!submission) {
        throw new ApiError('No active mission submission found', 404);
      }

      // Update submission with completion data
      const completedSubmission = await prisma.submission.update({
        where: { id: submission.id },
        data: {
          status: 'SUBMITTED',
          artifacts: [
            {
              type: artifactType,
              url: artifactUrl,
              uploadedAt: new Date().toISOString()
            }
          ],
          metadata: {
            ...(typeof submission.metadata === 'object' ? submission.metadata as Record<string, any> : {}),
            ...metadata,
            submissionNotes,
            submissionTimestamp: new Date().toISOString()
          }
        }
      });

      // Calculate XP reward based on mission difficulty and user level
      const mission = await prisma.mission.findUnique({ where: { id: missionId } });
      const xpReward = mission ? calculateXPReward(mission, userId) : 100;
      
      // Update user XP and level
      await updateUserProgress(userId, xpReward);
      
      // Submit to Honeycomb Protocol (non-blocking)
      let honeycombResult = null;
      try {
        honeycombResult = await honeycombMissionService.completeMission({
          missionId,
          submitterId: userId,
          submitterType: 'USER',
          submissionId: submission.id,
          artifactUrl,
          artifactType
        });
      } catch (error: any) {
        logger.warn('Honeycomb submission failed', { 
          error: error.message, 
          submitterId: userId,
          submitterType: 'USER', 
          missionId 
        });
      }

      // Check for new badges (non-blocking)
      let badgesEarned: string[] = [];
      try {
        const badgeResult = await honeycombBadgeService.checkAndAwardBadges(userId);
        badgesEarned = badgeResult.map((badge: any) => badge.name);
      } catch (error: any) {
        logger.warn('Badge checking failed', { 
          error: error.message, 
          userId 
        });
      }

      // Log business event
      logBusinessEvent('MISSION_COMPLETED', userId, {
        missionId,
        submissionId: submission.id,
        xpEarned: xpReward,
        badgesEarned,
        artifactType
      });

      logPerformance('mission_complete', Date.now() - startTime);

      res.json({
        success: true,
        data: {
          submissionId: submission.id,
          xpEarned: xpReward,
          badgesEarned,
          completedAt: completedSubmission.updatedAt,
          honeycombResult
        }
      });
    } catch (error: any) {
      logger.error('Failed to complete mission', { 
        error: error.message, 
        stack: error.stack,
        userId, 
        missionId 
      });
      
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to complete mission', 500);
    }
  })
);

// GET /missions/progress - Get user mission progress
router.get('/progress',
  validateQuery(paginationSchema.merge(filterSchema)),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const startTime = Date.now();
    const userId = req.user!.id;
    const { page, limit, sortBy, sortOrder, status, category } = req.query as any;

    try {
      const skip = (page - 1) * limit;
      
      const where: any = { userId };
      if (status) {
        where.status = status;
      }
      
      const orderBy: any = {};
      if (sortBy) {
        orderBy[sortBy] = sortOrder;
      } else {
        orderBy.startedAt = 'desc';
      }

      const [submissions, total] = await Promise.all([
        prisma.submission.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          include: {
            mission: {
              select: {
                id: true,
                name: true,
                description: true,
                rewards: true
              }
            }
          }
        }),
        prisma.submission.count({ where })
      ]);

      const progress = submissions.map(submission => ({
        id: submission.id,
        missionId: submission.missionId,
        missionTitle: submission.mission.name,
        description: submission.mission.description,
        status: submission.status,
        startedAt: submission.createdAt,
        completedAt: submission.updatedAt,
        artifacts: submission.artifacts,
        metadata: submission.metadata
      }));

      logPerformance('get_mission_progress', Date.now() - startTime, {
        userId,
        resultCount: progress.length
      });

      res.json({
        success: true,
        data: progress,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error: any) {
      logger.error('Failed to get mission progress', { 
        error: error.message, 
        userId 
      });
      throw new ApiError('Failed to get mission progress', 500);
    }
  })
);

// POST /missions/validate/github - Validate GitHub URL
router.post('/validate/github', [
  body('url').isURL(),
  body('type').isIn(['repository', 'pull_request']),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400);
  }

  const { url, type } = req.body;

  try {
    // Mock GitHub validation for demo
    const mockResult = {
      valid: true,
      data: {
        url,
        type,
        verified: true,
        timestamp: new Date().toISOString()
      }
    };
    
    res.json({
      success: true,
      data: mockResult,
    });
  } catch (error: any) {
    throw new ApiError(error.message || 'GitHub validation failed', 400);
  }
}));

// POST /missions/validate/solana - Validate Solana transaction
router.post('/validate/solana', [
  body('signature').isString().notEmpty(),
  body('expectedProgram').optional().isString(),
  body('minAmount').optional().isNumeric(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400);
  }

  const { signature, expectedProgram, minAmount } = req.body;

  try {
    // Mock Solana validation for demo
    const mockResult = {
      valid: true,
      signature,
      verified: true,
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: mockResult,
    });
  } catch (error: any) {
    throw new ApiError(error.message || 'Solana validation failed', 400);
  }
}));

// POST /missions/artifacts/upload - Upload mission artifact
router.post('/artifacts/upload', 
  uploadRateLimiter,
  upload.single('file'), 
  validateBody(z.object({ submissionId: objectIdSchema })),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const startTime = Date.now();
    
    if (!req.file) {
      throw new ApiError('No file provided', 400);
    }

    const { submissionId } = req.body;
    const userId = req.user!.id;
    
    try {
      // Verify submission belongs to user
      const submission = await prisma.submission.findFirst({
        where: {
          id: submissionId,
          submitterId: userId,
          submitterType: 'USER'
        }
      });

      if (!submission) {
        throw new ApiError('Submission not found or unauthorized', 404);
      }

      // Additional file security checks
      const fileExtension = req.file.originalname.split('.').pop()?.toLowerCase();
      const allowedExtensions = ['pdf', 'txt', 'md', 'jpg', 'jpeg', 'png', 'gif', 'json'];
      
      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        throw new ApiError('File extension not allowed', 400);
      }

      // Generate secure file path
      const fileName = `${submissionId}_${Date.now()}_${sanitizeFileName(req.file.originalname)}`;
      const filePath = `uploads/artifacts/${fileName}`;

      // In production, upload to secure cloud storage (S3, GCS, etc.)
      // For now, we'll just return metadata
      const fileRecord = {
        id: `file_${Date.now()}`,
        submissionId,
        originalName: req.file.originalname,
        fileName,
        filePath,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        uploadedAt: new Date()
      };

      logBusinessEvent('ARTIFACT_UPLOADED', userId, {
        submissionId,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      });

      logPerformance('artifact_upload', Date.now() - startTime, {
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      });

      res.json({
        success: true,
        data: {
          fileId: fileRecord.id,
          fileName: fileRecord.fileName,
          originalName: fileRecord.originalName,
          fileSize: fileRecord.fileSize,
          url: `/api/missions/artifacts/${fileRecord.fileName}`
        }
      });
    } catch (error: any) {
      logger.error('Failed to upload artifact', {
        error: error.message,
        userId,
        submissionId,
        filename: req.file?.originalname,
        filesize: req.file?.size
      });
      
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to upload artifact', 500);
    }
  })
);

// Helper functions
function calculateXPReward(mission: any, userId: string): number {
  // Base XP from mission difficulty
  const baseXP = mission.difficulty * 100;
  
  // Bonus XP for first-time completion
  const firstTimeBonus = 1.5;
  
  // Could add user level multipliers, streak bonuses, etc.
  return Math.floor(baseXP * firstTimeBonus);
}

async function updateUserProgress(userId: string, xpGained: number): Promise<void> {
  try {
    // Update user XP and potentially level
    await prisma.user.update({
      where: { id: userId },
      data: {
        xpTotal: {
          increment: xpGained
        },
        // Level calculation would be more complex in production
        updatedAt: new Date()
      }
    });

    logBusinessEvent('USER_XP_GAINED', userId, { xpGained });
  } catch (error: any) {
    logger.error('Failed to update user progress', { 
      error: error.message, 
      userId, 
      xpGained 
    });
    // Don't throw here - XP update failure shouldn't block mission completion
  }
}

function sanitizeFileName(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 100); // Limit filename length
}

export default router;