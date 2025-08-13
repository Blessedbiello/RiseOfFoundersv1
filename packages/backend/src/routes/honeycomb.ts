import { Router, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { AuthenticatedRequest, requireAdmin } from '../middleware/auth';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import { 
  honeycombService, 
  honeycombMissionService, 
  honeycombBadgeService, 
  honeycombProfileService,
} from '../services/honeycomb';
import { honeycombInitializationService } from '../services/honeycomb/initialization';

const router = Router();

// GET /honeycomb/status - Get Honeycomb integration status
router.get('/status', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const initStatus = honeycombInitializationService.getInitializationStatus();
  const healthCheck = await honeycombInitializationService.healthCheck();

  res.json({
    success: true,
    data: {
      initialization: initStatus,
      health: healthCheck,
      projectInfo: honeycombService.getProjectInfo(),
    },
  });
}));

// POST /honeycomb/auth/challenge - Get authentication challenge
router.post('/auth/challenge', [
  body('walletAddress').isString().isLength({ min: 32, max: 44 }),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400);
  }

  const { walletAddress } = req.body;

  try {
    const challenge = await honeycombService.getAuthChallenge(walletAddress);
    
    res.json({
      success: true,
      data: {
        message: challenge,
        walletAddress,
      },
    });
  } catch (error) {
    throw new ApiError('Failed to get authentication challenge', 500);
  }
}));

// POST /honeycomb/auth/verify - Verify wallet signature
router.post('/auth/verify', [
  body('walletAddress').isString().isLength({ min: 32, max: 44 }),
  body('signature').isString().isLength({ min: 50 }),
  body('message').isString().isLength({ min: 10 }),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400);
  }

  const { walletAddress, signature, message } = req.body;

  try {
    const authResult = await honeycombService.authenticateUser(walletAddress, signature, message);
    
    res.json({
      success: true,
      data: authResult,
    });
  } catch (error) {
    throw new ApiError('Authentication failed', 401);
  }
}));

// POST /honeycomb/profiles - Create user profile
router.post('/profiles', [
  body('name').isString().isLength({ min: 2, max: 50 }),
  body('bio').optional().isString().isLength({ max: 500 }),
  body('profilePicture').optional().isURL(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400);
  }

  const { name, bio, profilePicture } = req.body;

  try {
    // Get user wallet from authenticated request
    const walletAddress = req.user!.walletAddress;

    const result = await honeycombProfileService.createUserProfile({
      name,
      bio,
      profilePicture,
      walletAddress,
    });

    if (!result.success) {
      throw new ApiError(result.error || 'Failed to create profile', 500);
    }

    res.status(201).json({
      success: true,
      data: {
        profileId: result.honeycombProfileId,
        message: 'Profile created successfully',
      },
    });
  } catch (error) {
    throw new ApiError('Failed to create profile', 500);
  }
}));

// GET /honeycomb/profiles/:userId - Get user profile data
router.get('/profiles/:userId', [
  param('userId').isString(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params;

  try {
    const profileData = await honeycombProfileService.getUserProfileData(userId);
    
    res.json({
      success: true,
      data: profileData,
    });
  } catch (error) {
    throw new ApiError('Failed to get profile data', 500);
  }
}));

// POST /honeycomb/profiles/:userId/sync - Sync user profile with Honeycomb
router.post('/profiles/:userId/sync', [
  param('userId').isString(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params;

  // Only allow users to sync their own profile or admins
  if (req.user!.id !== userId && req.user!.role !== 'ADMIN') {
    throw new ApiError('Insufficient permissions', 403);
  }

  try {
    const result = await honeycombProfileService.syncUserProfile(userId);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    throw new ApiError('Failed to sync profile', 500);
  }
}));

// GET /honeycomb/profiles/:userId/stats - Get user statistics
router.get('/profiles/:userId/stats', [
  param('userId').isString(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params;

  try {
    const stats = await honeycombProfileService.getUserStatistics(userId);
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    throw new ApiError('Failed to get user statistics', 500);
  }
}));

// POST /honeycomb/missions/complete - Complete a mission
router.post('/missions/complete', [
  body('missionId').isString(),
  body('submissionId').isString(),
  body('artifacts').isArray(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400);
  }

  const { missionId, submissionId, artifacts } = req.body;

  try {
    const result = await honeycombMissionService.completeMission({
      missionId,
      userId: req.user!.id,
      submissionId,
      artifacts,
    });

    // Check for new badges
    const newBadges = await honeycombBadgeService.checkAndAwardBadges(req.user!.id);

    res.json({
      success: true,
      data: {
        ...result,
        newBadges,
      },
    });
  } catch (error) {
    throw new ApiError('Failed to complete mission', 500);
  }
}));

// GET /honeycomb/missions/progress/:userId - Get mission progress
router.get('/missions/progress/:userId', [
  param('userId').isString(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params;

  try {
    const progress = await honeycombMissionService.getUserMissionProgress(userId);
    
    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    throw new ApiError('Failed to get mission progress', 500);
  }
}));

// GET /honeycomb/badges/definitions - Get all badge definitions
router.get('/badges/definitions', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const definitions = honeycombBadgeService.getBadgeDefinitions();
  
  res.json({
    success: true,
    data: definitions,
  });
}));

// POST /honeycomb/badges/check/:userId - Check and award badges for user
router.post('/badges/check/:userId', [
  param('userId').isString(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params;

  // Only allow users to check their own badges or admins
  if (req.user!.id !== userId && req.user!.role !== 'ADMIN') {
    throw new ApiError('Insufficient permissions', 403);
  }

  try {
    const newBadges = await honeycombBadgeService.checkAndAwardBadges(userId);
    
    res.json({
      success: true,
      data: {
        newBadges,
        count: newBadges.length,
      },
    });
  } catch (error) {
    throw new ApiError('Failed to check badges', 500);
  }
}));

// Admin routes
router.use(requireAdmin); // All routes below require admin role

// POST /honeycomb/admin/reinitialize - Reinitialize Honeycomb setup
router.post('/admin/reinitialize', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await honeycombInitializationService.reinitialize();
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    throw new ApiError('Failed to reinitialize Honeycomb', 500);
  }
}));

// POST /honeycomb/admin/setup-project - Setup Honeycomb project
router.post('/admin/setup-project', [
  body('projectName').isString().isLength({ min: 3, max: 50 }),
  body('authorityPublicKey').isString().isLength({ min: 32, max: 44 }),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400);
  }

  const { projectName, authorityPublicKey } = req.body;

  try {
    const result = await honeycombInitializationService.setupProject(projectName, authorityPublicKey);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    throw new ApiError('Failed to setup project', 500);
  }
}));

// GET /honeycomb/admin/health - Detailed health check for admins
router.get('/admin/health', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const healthCheck = await honeycombInitializationService.healthCheck();
  const initStatus = honeycombInitializationService.getInitializationStatus();
  
  res.json({
    success: true,
    data: {
      health: healthCheck,
      initialization: initStatus,
      projectInfo: honeycombService.getProjectInfo(),
      timestamp: new Date().toISOString(),
    },
  });
}));

export default router;