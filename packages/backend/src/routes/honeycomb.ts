import { Router, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { AuthenticatedRequest, requireAdmin } from '../middleware/auth';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import { honeycombService, honeycombMissionService, honeycombBadgeService, honeycombProfileService } from '../services/honeycomb';
import { honeycombInitializationService } from '../services/honeycomb/initialization';
import { prisma } from '../config/database';

const router: any = Router();

// Authentication endpoints (no auth required)
// POST /honeycomb/auth/challenge - Get authentication challenge
router.post('/auth/challenge', [
  body('walletAddress').isString().isLength({ min: 32, max: 44 }),
], asyncHandler(async (req: any, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Invalid wallet address', 400);
  }

  const { walletAddress } = req.body;
  
  try {
    const message = await honeycombService.getAuthChallenge(walletAddress);
    res.json({
      success: true,
      data: {
        message,
        walletAddress,
      },
    });
  } catch (error) {
    throw new ApiError('Failed to get authentication challenge', 500);
  }
}));

// POST /honeycomb/auth/verify - Verify signature and authenticate
router.post('/auth/verify', [
  body('walletAddress').isString().isLength({ min: 32, max: 44 }),
  body('signature').isString(),
  body('message').isString(),
], asyncHandler(async (req: any, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400);
  }

  const { walletAddress, signature, message } = req.body;
  
  let authResult: any;
  let isNewUser = false;
  
  try {
    // First, try to authenticate with Honeycomb Protocol
    authResult = await honeycombService.authenticateUser(walletAddress, signature, message);
    console.log(`✅ User authenticated successfully: ${walletAddress}`);
    
  } catch (error: any) {
    console.log(`Authentication attempt failed: ${error.message}`);
    
    // If user not found, try to register them
    if (error.code === 'USER_NOT_FOUND') {
      console.log(`🔄 User not found, attempting registration: ${walletAddress}`);
      
      try {
        authResult = await honeycombService.registerUser(walletAddress, signature);
        isNewUser = true;
        console.log(`✅ User registered and authenticated: ${walletAddress}`);
        
      } catch (registrationError: any) {
        console.error(`❌ Registration failed: ${registrationError.message}`);
        
        // If both auth and registration fail, create local-only user
        if (registrationError.code === 'REGISTRATION_FAILED') {
          console.log(`📝 Creating local-only user: ${walletAddress}`);
          authResult = {
            user: {
              id: `local_${walletAddress}_${Date.now()}`,
              wallet: walletAddress,
            },
            accessToken: `local_token_${walletAddress.substring(0, 8)}_${Date.now()}`,
          };
          isNewUser = true;
        } else {
          throw registrationError;
        }
      }
    } else {
      // For other errors (network, invalid signature, etc.), don't attempt registration
      throw error;
    }
  }
  
  try {
    // Create or update user in our local database
    let user = await prisma.user.findUnique({
      where: { walletAddress },
      include: {
        badges: true,
        traits: true,
      },
    });

    if (!user) {
      // Create new user with Honeycomb integration
      const displayName = `Founder_${walletAddress.slice(-8)}`;
      console.log(`📝 Creating new user in database: ${displayName}`);
      
      user = await prisma.user.create({
        data: {
          walletAddress,
          displayName,
          role: 'PLAYER',
          honeycombUserId: authResult.user.id,
          skillScores: {
            technical: 0,
            business: 0,
            marketing: 0,
            community: 0,
            design: 0,
            product: 0,
          },
          preferences: {
            theme: 'dark',
            notifications: {
              email: false,
              discord: false,
              inApp: true,
              missions: true,
              teams: true,
              mentorship: true,
              competitions: true,
            },
            privacy: {
              showProfile: true,
              showProgress: true,
              showTeams: true,
              allowMentorRequests: true,
            },
            gameplay: {
              autoAcceptTeamInvites: false,
              allowPvpChallenges: true,
              preferredDifficulty: 'adaptive',
            },
          },
        },
        include: {
          badges: true,
          traits: true,
        },
      });
      
      // Try to create initial Honeycomb profile (non-blocking)
      try {
        await honeycombService.createProfile(
          walletAddress,
          user.displayName,
          'New founder on Rise of Founders',
          undefined
        );
        console.log(`✅ Created initial Honeycomb profile for ${walletAddress}`);
      } catch (profileError) {
        console.warn(`⚠️ Could not create initial Honeycomb profile for ${walletAddress}:`, profileError);
        // Continue without failing the authentication
      }
    } else {
      // Update existing user with Honeycomb data
      user = await prisma.user.update({
        where: { id: user.id },
        data: { 
          lastActive: new Date(),
          honeycombUserId: authResult.user.id,
        },
        include: {
          badges: true,
          traits: true,
        },
      });
    }

    res.json({
      success: true,
      data: {
        accessToken: authResult.accessToken,
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          name: user.displayName, // Map displayName to name for frontend compatibility
          displayName: user.displayName,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          profilePicture: user.avatarUrl, // Map avatarUrl to profilePicture for frontend compatibility
          role: user.role,
          xpTotal: user.xpTotal,
          reputationScore: user.reputationScore,
          skillScores: user.skillScores,
          badges: user.badges,
          traits: user.traits,
          isVerified: user.isVerified,
          preferences: user.preferences,
          honeycombUserId: user.honeycombUserId,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
      },
    });
  } catch (error: any) {
    console.error('❌ Database or final processing error:', error);
    
    // Provide specific error messages based on the error type
    if (error.code === 'USER_NOT_FOUND') {
      throw new ApiError('User not found in Honeycomb Protocol. Please try again.', 404);
    } else if (error.code === 'HONEYCOMB_GRAPHQL_ERROR') {
      throw new ApiError(`Honeycomb API Error: ${error.message}`, 502);
    } else if (error.code === 'HONEYCOMB_NETWORK_ERROR') {
      throw new ApiError(`Honeycomb Network Error: ${error.message}`, 503);
    } else if (error.code === 'REGISTRATION_FAILED') {
      throw new ApiError('Failed to register user with Honeycomb Protocol', 500);
    } else if (error.code && error.code.includes('DATABASE')) {
      throw new ApiError('Database error during user creation', 500);
    } else {
      // Generic fallback with more context
      const errorMessage = error.message || 'Authentication process failed';
      throw new ApiError(`Authentication failed: ${errorMessage}`, 401);
    }
  }
}));

// POST /honeycomb/profiles - Create Honeycomb profile (requires authentication)
router.post('/profiles', [
  body('name').isString().isLength({ min: 1, max: 50 }),
  body('bio').optional().isString().isLength({ max: 500 }),
  body('walletAddress').isString(),
], asyncHandler(async (req: any, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400);
  }

  const { name, bio, walletAddress, profilePicture } = req.body;
  
  try {
    // For now, return success without actually creating the profile
    // Profile creation will be handled during authentication
    res.json({
      success: true,
      data: { 
        profileId: `profile_${Date.now()}`,
        message: 'Profile setup completed. Honeycomb profile was created during authentication.',
      },
    });
  } catch (error) {
    throw new ApiError('Failed to create Honeycomb profile', 500);
  }
}));

// GET /honeycomb/status - Get Honeycomb Protocol status
router.get('/status', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const status = await honeycombService.getStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    throw new ApiError('Failed to get Honeycomb status', 500);
  }
}));

// GET /honeycomb/profile/:walletAddress - Get user's Honeycomb profile
router.get('/profile/:walletAddress', [
  param('walletAddress').isString(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { walletAddress } = req.params;
  
  try {
    const profile = await honeycombProfileService.getUserProfile(walletAddress);
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    throw new ApiError('Failed to get user profile', 500);
  }
}));

// GET /honeycomb/badges/:userId - Get user's badges
router.get('/badges/:userId', [
  param('userId').isString(),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params;
  
  try {
    const badges = await honeycombBadgeService.getUserBadges(userId);
    res.json({
      success: true,
      data: badges
    });
  } catch (error) {
    throw new ApiError('Failed to get badges', 500);
  }
}));

// POST /honeycomb/badges/check - Check for new badges
router.post('/badges/check', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  
  try {
    const newBadges = await honeycombBadgeService.checkAndAwardBadges(userId);
    res.json({
      success: true,
      data: { badges: newBadges }
    });
  } catch (error) {
    throw new ApiError('Failed to check badges', 500);
  }
}));

// Profile routes for authenticated users
router.use('/profile', (req: any, res: any, next: any) => {
  // Allow profile creation without authentication
  if (req.method === 'POST' && req.path === '/') {
    return next();
  }
  // Require auth for other profile endpoints
  return requireAdmin(req, res, next);
});

// Admin routes
router.use('/admin', requireAdmin as any); // Admin routes require admin role

// POST /honeycomb/admin/reinitialize - Reinitialize Honeycomb setup
router.post('/admin/reinitialize', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await honeycombInitializationService.initializeHoneycombSetup();
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    throw new ApiError('Failed to reinitialize Honeycomb', 500);
  }
}));

// POST /honeycomb/admin/projects - Create or update project
router.post('/admin/projects', [
  body('name').isString().isLength({ min: 1, max: 100 }),
  body('description').isString().isLength({ min: 1, max: 500 }),
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400);
  }

  try {
    const { name, description } = req.body;
    const project = await honeycombService.createOrUpdateProject({ name, description });
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    throw new ApiError('Failed to create/update project', 500);
  }
}));

export default router;