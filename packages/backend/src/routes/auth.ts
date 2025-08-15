import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../config/database';
import { generateToken, verifyWalletSignature, AuthenticatedRequest, validateAuth } from '../middleware/auth';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import { UserRole } from '@prisma/client';

const router: any = Router();

// Validation rules
const walletAuthValidation = [
  body('walletAddress')
    .isLength({ min: 32, max: 44 })
    .matches(/^[1-9A-HJ-NP-Za-km-z]+$/)
    .withMessage('Invalid wallet address format'),
  body('signature')
    .isLength({ min: 50 })
    .withMessage('Invalid signature'),
  body('message')
    .isLength({ min: 10 })
    .withMessage('Invalid message'),
];

const profileUpdateValidation = [
  body('displayName')
    .optional()
    .isLength({ min: 2, max: 30 })
    .withMessage('Display name must be between 2 and 30 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
];

// GET /auth/nonce - Get nonce for wallet signature
router.get('/nonce/:walletAddress', asyncHandler(async (req: Request, res: Response) => {
  const { walletAddress } = req.params;
  
  if (!walletAddress.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
    throw new ApiError('Invalid wallet address format', 400);
  }
  
  // Generate a unique nonce for this wallet
  const nonce = `Rise of Founders Login: ${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Store nonce temporarily (in production, use Redis with expiration)
  // For now, we'll embed timestamp and validate on login
  
  res.json({
    success: true,
    data: {
      nonce,
      message: `Please sign this message to authenticate with Rise of Founders.\n\nNonce: ${nonce}\nTimestamp: ${new Date().toISOString()}`,
    },
  });
}));

// POST /auth/wallet - Authenticate with wallet signature
router.post('/wallet', walletAuthValidation, asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400);
  }
  
  const { walletAddress, signature, message } = req.body;
  
  // Verify the signature (placeholder implementation)
  const isValidSignature = verifyWalletSignature(message, signature, walletAddress);
  
  if (!isValidSignature) {
    throw new ApiError('Invalid signature', 401);
  }
  
  // Check if message is recent (within 5 minutes)
  const messageTimestamp = message.match(/Timestamp: (.+)/)?.[1];
  if (messageTimestamp) {
    const timestamp = new Date(messageTimestamp);
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    if (timestamp < fiveMinutesAgo) {
      throw new ApiError('Message expired. Please generate a new nonce', 401);
    }
  }
  
  // Find or create user
  let user = await prisma.user.findUnique({
    where: { walletAddress },
    include: {
      badges: true,
      traits: true,
    },
  });
  
  if (!user) {
    // Create new user
    user = await prisma.user.create({
      data: {
        walletAddress,
        displayName: `Founder_${walletAddress.slice(-8)}`,
        role: UserRole.PLAYER,
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
  } else {
    // Update last active
    user = await prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() },
      include: {
        badges: true,
        traits: true,
      },
    });
  }
  
  const token = generateToken({
    id: user.id,
    walletAddress: user.walletAddress,
    role: user.role,
    email: user.email || undefined,
    isVerified: user.isVerified,
  });
  
  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        xpTotal: user.xpTotal,
        reputationScore: user.reputationScore,
        skillScores: user.skillScores,
        badges: user.badges,
        traits: user.traits,
        isVerified: user.isVerified,
        preferences: user.preferences,
      },
    },
  });
}));

// POST /auth/github/connect - Connect GitHub account
router.post('/github/connect', asyncHandler(async (req: Request, res: Response) => {
  // This would handle GitHub OAuth flow
  // For now, return placeholder
  res.json({
    success: true,
    data: {
      authUrl: `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user:email,repo:read`,
    },
  });
}));

// POST /auth/github/callback - Handle GitHub OAuth callback
router.post('/github/callback', asyncHandler(async (req: Request, res: Response) => {
  const { code, userId } = req.body;
  
  if (!code || !userId) {
    throw new ApiError('Missing authorization code or user ID', 400);
  }
  
  // Exchange code for access token
  // This would call GitHub's API to get user info
  // For now, return placeholder
  
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      githubId: 'placeholder-github-id',
      githubUsername: 'placeholder-username',
    },
  });
  
  res.json({
    success: true,
    data: {
      githubConnected: true,
      githubUsername: user.githubUsername,
    },
  });
}));

// POST /auth/refresh - Refresh JWT token
router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;
  
  if (!token) {
    throw new ApiError('Token required', 400);
  }
  
  try {
    // Verify current token and issue new one
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    
    if (!user) {
      throw new ApiError('User not found', 404);
    }
    
    const newToken = generateToken({
      id: user.id,
      walletAddress: user.walletAddress,
      role: user.role,
      email: user.email || undefined,
      isVerified: user.isVerified,
    });
    
    res.json({
      success: true,
      data: { token: newToken },
    });
  } catch (error) {
    throw new ApiError('Invalid token', 401);
  }
}));

// GET /auth/verify - Verify current token
router.get('/verify', asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError('No token provided', 401);
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        walletAddress: true,
        displayName: true,
        role: true,
        email: true,
        isVerified: true,
      },
    });
    
    if (!user) {
      throw new ApiError('User not found', 404);
    }
    
    res.json({
      success: true,
      data: {
        valid: true,
        user,
      },
    });
  } catch (error) {
    throw new ApiError('Invalid token', 401);
  }
}));

// PUT /auth/profile - Update user profile
router.put('/profile', validateAuth as any, profileUpdateValidation, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, errors.array());
  }

  const userId = req.user!.id;
  const { displayName, email, bio, avatarUrl } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(displayName && { displayName }),
        ...(email && { email }),
        ...(bio && { bio }),
        ...(avatarUrl && { avatarUrl }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        walletAddress: true,
        displayName: true,
        email: true,
        bio: true,
        avatarUrl: true,
        role: true,
        xpTotal: true,
        reputationScore: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: { 
        user: {
          ...updatedUser,
          name: updatedUser.displayName, // Map displayName to name for frontend compatibility
          profilePicture: updatedUser.avatarUrl, // Map avatarUrl to profilePicture for frontend compatibility
          createdAt: updatedUser.createdAt.toISOString(),
          updatedAt: updatedUser.updatedAt.toISOString(),
        }
      },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new ApiError('Email already exists', 409);
    }
    throw new ApiError('Failed to update profile', 500);
  }
}));

export default router;